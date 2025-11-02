import ejs from "ejs";
import ExcelJS from "exceljs";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { userProductSchema } from "../schemas/userProductSchema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserProductsController {
  static async createProduct(req, res, next) {
    let imagePaths = [];
    try {
      const { error, value } = userProductSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { gtin: _, barcodeType, ...productData } = value;

      // First, find the barcodeType record
      const barcodeTypeRecord = await prisma.barcodeType.findFirst({
        where: { type: barcodeType },
      });

      if (!barcodeTypeRecord) {
        throw new MyError("Invalid barcode type", 400);
      }

      // Get user and find ONE available GTIN of the requested type
      const [user, availableGtin] = await Promise.all([
        prisma.user.findUnique({
          where: { id: req.user.id },
        }),
        prisma.assignedGtin.findFirst({
          where: {
            order: {
              userId: req.user.id,
              status: "Activated",
            },
            barcodeTypeId: barcodeTypeRecord.id,
            gtin: {
              status: "Sold", // Only get unused GTINs
            },
          },
          include: {
            gtin: true,
            order: true,
          },
          orderBy: {
            createdAt: "asc", // Get oldest GTIN first
          },
        }),
      ]);

      if (!user) {
        throw new MyError("You are not authorized to create a product", 401);
      }

      if (!availableGtin) {
        throw new MyError(
          `No available GTINs found for barcode type: ${barcodeType}`,
          400
        );
      }

      // Handle image uploads
      const imageUrls = [];
      if (req.files?.images) {
        for (const file of req.files.images) {
          const imagePath = addDomain(file.path);
          imageUrls.push(imagePath);
          imagePaths.push(imagePath);
        }
      }

      // Check for existing SKU
      const existingProduct = await prisma.userProduct.findFirst({
        where: { sku: productData.sku },
      });

      if (existingProduct) {
        throw new MyError("Product with SKU already exists", 400);
      }

      // Create product using transaction to ensure data consistency
      const product = await prisma.$transaction(async (prisma) => {
        // Create the product with single GTIN
        const newProduct = await prisma.userProduct.create({
          data: {
            ...productData,
            gtin: availableGtin.gtin.gtin,
            userId: req.user.id,
            isSec: productData.isSec,
            images: {
              create: imageUrls.map((url) => ({ url })),
            },
          },
          include: {
            images: true,
          },
        });

        console.log(`Updating GTIN ${availableGtin.gtin.gtin} to Used`);

        // Update only this single GTIN's status
        await prisma.gTIN.update({
          where: {
            id: availableGtin.gtinId,
            gtin: newProduct.gtin,
          },
          data: {
            status: "Used",
          },
        });

        // Update user's SEC quantity if applicable
        if (productData.isSec) {
          await prisma.user.update({
            where: { id: req.user.id },
            data: {
              secQuantity: {
                decrement: 1,
              },
            },
          });
        }

        return newProduct;
      });

      res.status(201).json(
        response(201, true, "Product created successfully", {
          product,
        })
      );
    } catch (error) {
      // Clean up uploaded images if there was an error
      for (const path of imagePaths) {
        await deleteFile(path);
      }
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    let imagePaths = [];
    try {
      const { id } = req.params;
      const { error, value } = userProductSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Remove gtin from the update data
      const { gtin: _, ...updateData } = value;

      // Check if product exists and belongs to user
      const existingProduct = await prisma.userProduct.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          images: true,
        },
      });

      if (!existingProduct) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      // Handle image uploads
      const imageUrls = [];
      if (req.files?.images) {
        for (const file of req.files.images) {
          const imagePath = addDomain(file.path);
          imageUrls.push(imagePath);
          imagePaths.push(imagePath);
        }
      }

      // Update product (removed GTIN-related operations)
      const updatedProduct = await prisma.userProduct.update({
        where: { id },
        data: {
          ...updateData,
          images: {
            create: imageUrls.map((url) => ({ url })),
          },
        },
        include: {
          images: true,
        },
      });

      res.status(200).json(
        response(200, true, "Product updated successfully", {
          product: updatedProduct,
        })
      );
    } catch (error) {
      // Clean up uploaded images if there was an error
      for (const path of imagePaths) {
        await deleteFile(path);
      }
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      // Find product with user verification and include necessary relations
      const product = await prisma.userProduct.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          images: true,
        },
      });

      if (!product) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      // Find the order and assigned GTIN - Modified to search all orders
      const assignedGtin = await prisma.assignedGtin.findFirst({
        where: {
          gtin: {
            gtin: product.gtin,
          },
          order: {
            userId: req.user.id,
          },
        },
        include: {
          gtin: true,
          order: true,
        },
      });

      if (!assignedGtin) {
        throw new MyError("GTIN assignment not found", 404);
      }

      await prisma.$transaction(async (prisma) => {
        // Delete physical image files from storage
        if (product.images && product.images.length > 0) {
          const deletePromises = product.images.map(async (image) => {
            try {
              await deleteFile(image.url);
            } catch (error) {
              console.error(`Failed to delete image file: ${image.url}`, error);
            }
          });
          await Promise.all(deletePromises);
        }

        // Delete all related ProductImage records from database
        await prisma.productImage.deleteMany({
          where: { productId: id },
        });

        // Release GTIN if exists - update status to "Sold"
        if (product.gtin) {
          await prisma.gTIN.update({
            where: {
              gtin: product.gtin,
              status: "Used",
            },
            data: {
              status: "Sold",
            },
          });
        }

        // Finally delete the product
        await prisma.userProduct.delete({
          where: { id },
        });
      });

      res
        .status(200)
        .json(response(200, true, "Product deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req, res, next) {
    try {
      const { id } = req.params;

      const product = await prisma.userProduct.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          images: true,
        },
      });

      if (!product) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      res
        .status(200)
        .json(
          response(200, true, "Product retrieved successfully", { product })
        );
    } catch (error) {
      next(error);
    }
  }

  static async listProducts(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const skip = (page - 1) * limit;

      const whereClause = {
        userId: req.user.id,
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { sku: { contains: search } },
            { gtin: { contains: search } },
          ],
        }),
      };

      // First get the products
      const [products, total] = await Promise.all([
        prisma.userProduct.findMany({
          where: whereClause,
          include: {
            images: true,
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.userProduct.count({ where: whereClause }),
      ]);

      // Get barcodeType information for each product
      const productsWithBarcodeType = await Promise.all(
        products.map(async (product) => {
          const assignedGtin = await prisma.assignedGtin.findFirst({
            where: {
              gtin: {
                gtin: product.gtin,
              },
            },
            include: {
              barcodeType: true,
            },
          });

          return {
            ...product,
            barcodeType: assignedGtin?.barcodeType?.type || null,
          };
        })
      );

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Products retrieved successfully", {
          products: productsWithBarcodeType,
          pagination: {
            total,
            page: Number(page),
            totalPages,
            hasMore: page < totalPages,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteProductImage(req, res, next) {
    try {
      const { productId, imageId } = req.params;

      // Check if product exists and belongs to user
      const product = await prisma.userProduct.findFirst({
        where: {
          id: productId,
          userId: req.user.id,
        },
        include: {
          images: true,
        },
      });

      if (!product) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      // Find the specific image
      const image = product.images.find((img) => img.id === imageId);
      if (!image) {
        throw new MyError("Image not found", 404);
      }

      // Delete physical file and database record
      await Promise.all([
        deleteFile(image.url),
        prisma.productImage.delete({
          where: { id: imageId },
        }),
      ]);

      res
        .status(200)
        .json(response(200, true, "Image deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }

  static async searchProducts(req, res, next) {
    try {
      const { gtin } = req.query;

      // Find product using the GTIN
      const product = await prisma.userProduct.findFirst({
        where: {
          gtin: {
            contains: gtin,
          },
        },
        include: {
          images: true,
          user: {
            select: {
              companyNameEn: true,
              companyNameAr: true,
            },
          },
        },
      });

      // If product found, return it
      if (product) {
        return res
          .status(200)
          .json(response(200, true, "Product found successfully", { product }));
      }

      // If product not found, fetch GTIN information
      const gtinRecord = await prisma.gTIN.findFirst({
        where: {
          gtin,
        },
      });

      if (!gtinRecord) {
        throw new MyError(
          `We couldn't find the barcode ${gtin} in our database. Please verify the number and try again.`,
          404
        );
      }

      // Find assignment information
      const assignedGtin = await prisma.assignedGtin.findFirst({
        where: {
          gtinId: gtinRecord.id,
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  companyNameEn: true,
                  companyNameAr: true,
                  email: true,
                },
              },
            },
          },
          barcodeType: true,
        },
      });

      const gtinInfo = {
        gtin: gtinRecord.gtin,
        status: gtinRecord.status,
        assignedTo: assignedGtin
          ? {
              userId: assignedGtin.order.userId,
              companyNameEn: assignedGtin.order.user.companyNameEn,
              companyNameAr: assignedGtin.order.user.companyNameAr,
              barcodeType: assignedGtin.barcodeType?.type || null,
              orderNumber: assignedGtin.order.orderNumber || null,
              purchaseDate: assignedGtin.createdAt,
            }
          : null,
        product: null,
      };

      res
        .status(200)
        .json(response(200, true, "GTIN information found", { gtinInfo }));
    } catch (error) {
      next(error);
    }
  }

  static async exportExcelProducts(req, res, next) {
    try {
      console.log("[Excel Export] Starting export process");

      // Fetch all products for the user
      const products = await prisma.userProduct.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          images: true,
          user: {
            select: {
              companyNameEn: true,
              companyNameAr: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (products.length === 0) {
        throw new MyError("No products found for export", 404);
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Products");

      // Define columns with safe access
      worksheet.columns = [
        { header: "Title", key: "title", width: 30 },
        { header: "SKU", key: "sku", width: 15 },
        { header: "GTIN", key: "gtin", width: 15 },
        { header: "Status", key: "status", width: 10 },
        { header: "Brand Name", key: "brandName", width: 20 },
        { header: "Description", key: "description", width: 50 },
        { header: "GPC", key: "gpc", width: 15 },
        { header: "HS Code", key: "hsCode", width: 15 },
        { header: "Packaging Type", key: "packagingType", width: 15 },
        { header: "Unit of Measure", key: "unitOfMeasure", width: 15 },
        { header: "Country of Origin", key: "countryOfOrigin", width: 15 },
        { header: "Country of Sale", key: "countryOfSale", width: 15 },
        { header: "Product Type", key: "productType", width: 15 },
        { header: "Created At", key: "createdAt", width: 20 },
        { header: "Images", key: "images", width: 50 },
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Add products data with safe value checking
      products.forEach((product, index) => {
        try {
          // Safely get values with fallbacks
          const rowData = {
            title: product?.title || "",
            sku: product?.sku || "",
            gtin: product?.gtin || "",
            status: product?.status || "",
            brandName: product?.brandName || "",
            description: product?.description || "",
            gpc: product?.gpc || "",
            hsCode: product?.hsCode || "",
            packagingType: product?.packagingType || "",
            unitOfMeasure: product?.unitOfMeasure || "",
            countryOfOrigin: product?.countryOfOrigin || "",
            countryOfSale: product?.countryOfSale || "",
            productType: product?.productType || "",
            createdAt: product?.createdAt
              ? new Date(product.createdAt).toLocaleDateString()
              : "",
            images: Array.isArray(product?.images)
              ? product.images
                  .map((img) => img?.url || "")
                  .filter(Boolean)
                  .join(", ")
              : "",
          };

          const row = worksheet.addRow(rowData);

          // Add border to cells
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        } catch (err) {
          console.error(
            `Error adding row for product ${product?.id || "unknown"}:`,
            err
          );
        }
      });

      // Auto-fit columns with error handling
      worksheet.columns.forEach((column) => {
        if (column.key) {
          // Only process if column has a key
          try {
            const values = worksheet.getColumn(column.key).values;
            const maxLength = values
              ? Math.max(
                  ...values
                    .map((v) => (v ? String(v).length : 0))
                    .filter(Boolean)
                )
              : 10;

            column.width = Math.min(Math.max(maxLength, 10), 50);
          } catch (err) {
            console.error(`Error auto-fitting column ${column.key}:`, err);
            column.width = 15; // fallback width
          }
        }
      });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="products.xlsx"'
      );

      console.log("[Excel Export] Writing workbook to response");

      // Write to response
      await workbook.xlsx.write(res);

      console.log("[Excel Export] Export completed successfully");

      // End the response
      res.end();
    } catch (error) {
      console.error("[Excel Export Error]", error);
      next(error);
    }
  }

  static async exportPdfProducts(req, res, next) {
    try {
      // Fetch all products for the user with user information
      const [products, user] = await Promise.all([
        prisma.userProduct.findMany({
          where: {
            userId: req.user.id,
          },
          include: {
            images: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.findUnique({
          where: { id: req.user.id },
          select: {
            companyNameEn: true,
            companyNameAr: true,
          },
        }),
      ]);

      if (products.length === 0) {
        throw new MyError("No products found for export", 404);
      }

      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `products-${timestamp}.pdf`;
      const pdfPath = path.join(__dirname, "../uploads/pdfs", fileName);

      // Ensure the pdfs directory exists
      await fs.mkdir(path.join(__dirname, "../uploads/pdfs"), {
        recursive: true,
      });

      // Render the EJS template
      const templatePath = path.join(__dirname, "../view/productsList.ejs");
      const html = await ejs.renderFile(templatePath, { products, user });

      // Launch puppeteer with unique userDataDir to avoid conflicts
      const uniqueUserDataDir = path.join(
        process.cwd(),
        "temp",
        `puppeteer_profile_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`
      );
      const browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080",
        ],
        userDataDir: uniqueUserDataDir,
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      // Set content and wait for images to load
      await page.setContent(html, {
        waitUntil: ["networkidle0", "domcontentloaded"],
        timeout: 30000,
      });

      // Generate PDF with specific settings
      await page.pdf({
        path: pdfPath,
        format: "A4",
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
        printBackground: true,
        preferCSSPageSize: true,
      });

      await browser.close();

      // Clean up temporary userDataDir
      try {
        await fs.rm(uniqueUserDataDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn("Failed to cleanup userDataDir:", cleanupError);
      }

      // Read the generated PDF file
      const pdfBuffer = await fs.readFile(pdfPath);

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="products-${timestamp}.pdf"`
      );

      // Send the PDF
      res.send(pdfBuffer);

      // Optionally, delete the file after sending
      // Uncomment the following line if you want to delete the file after sending
      // await fs.unlink(pdfPath);
    } catch (error) {
      console.error("PDF export error:", error);
      next(error);
    }
  }

  static async bulkImportProducts(req, res, next) {
    try {
      const { products } = req.body;

      // Validate that products array exists and is not empty
      if (!products || !Array.isArray(products) || products.length === 0) {
        throw new MyError(
          "Products array is required and must not be empty",
          400
        );
      }

      // Limit bulk import to reasonable size (e.g., 1000 products)
      if (products.length > 1000) {
        throw new MyError(
          "Bulk import limited to 1000 products per request",
          400
        );
      }

      // Verify user exists and get available GTINs count
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new MyError("You are not authorized to create products", 401);
      }

      // Prepare results tracking
      const results = {
        successful: [],
        failed: [],
        summary: {
          total: products.length,
          succeeded: 0,
          failed: 0,
        },
      };

      // Process each product
      for (let i = 0; i < products.length; i++) {
        const productData = products[i];
        const rowNumber = i + 1;

        try {
          // Validate product data
          const { error, value } = userProductSchema.validate(productData);
          if (error) {
            throw new Error(error.details[0].message);
          }

          const { gtin: _, barcodeType, ...validatedData } = value;

          // Validate barcode type if provided
          let barcodeTypeRecord = null;
          if (barcodeType) {
            barcodeTypeRecord = await prisma.barcodeType.findFirst({
              where: { type: barcodeType },
            });

            if (!barcodeTypeRecord) {
              throw new Error(`Invalid barcode type: ${barcodeType}`);
            }
          }

          // Find available GTIN for this barcode type
          const availableGtin = await prisma.assignedGtin.findFirst({
            where: {
              order: {
                userId: req.user.id,
                status: "Activated",
              },
              ...(barcodeTypeRecord && {
                barcodeTypeId: barcodeTypeRecord.id,
              }),
              gtin: {
                status: "Sold",
              },
            },
            include: {
              gtin: true,
              order: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          });

          if (!availableGtin) {
            throw new Error(
              `No available GTINs found${
                barcodeType ? ` for barcode type: ${barcodeType}` : ""
              }`
            );
          }

          // Check for duplicate SKU if provided
          if (validatedData.sku) {
            const existingProduct = await prisma.userProduct.findFirst({
              where: { sku: validatedData.sku },
            });

            if (existingProduct) {
              throw new Error(
                `Product with SKU "${validatedData.sku}" already exists`
              );
            }
          }

          // Create product in transaction
          const product = await prisma.$transaction(async (prisma) => {
            // Create the product
            const newProduct = await prisma.userProduct.create({
              data: {
                ...validatedData,
                gtin: availableGtin.gtin.gtin,
                userId: req.user.id,
                isSec: validatedData.isSec || false,
              },
            });

            // Update GTIN status to Used
            await prisma.gTIN.update({
              where: {
                id: availableGtin.gtinId,
                gtin: newProduct.gtin,
              },
              data: {
                status: "Used",
              },
            });

            // Update user's SEC quantity if applicable
            if (validatedData.isSec) {
              await prisma.user.update({
                where: { id: req.user.id },
                data: {
                  secQuantity: {
                    decrement: 1,
                  },
                },
              });
            }

            return newProduct;
          });

          // Add to successful results
          results.successful.push({
            row: rowNumber,
            productId: product.id,
            title: product.title,
            sku: product.sku,
            gtin: product.gtin,
            message: "Product created successfully",
          });
          results.summary.succeeded++;
        } catch (error) {
          // Add to failed results
          results.failed.push({
            row: rowNumber,
            title: productData.title || "N/A",
            sku: productData.sku || "N/A",
            error: error.message,
          });
          results.summary.failed++;
        }
      }

      // Determine response status
      const statusCode =
        results.summary.failed === 0
          ? 201
          : results.summary.succeeded === 0
          ? 400
          : 207; // Multi-Status

      const message =
        results.summary.failed === 0
          ? "All products imported successfully"
          : results.summary.succeeded === 0
          ? "All products failed to import"
          : "Bulk import completed with some failures";

      res
        .status(statusCode)
        .json(
          response(statusCode, results.summary.failed === 0, message, results)
        );
    } catch (error) {
      console.error("Bulk import error:", error);
      next(error);
    }
  }
}

export default UserProductsController;
