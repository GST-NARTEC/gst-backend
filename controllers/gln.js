import ejs from "ejs";
import ExcelJS from "exceljs";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { glnSchema } from "../schemas/gln.schema.js";
import MyError from "../utils/error.js";
import { addDomain, deleteFile } from "../utils/file.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GLNController {
  static async createGLN(req, res, next) {
    let imagePath = null;
    try {
      const { error, value } = glnSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { gtin: _, barcodeType, ...glnData } = value;

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

      if (req.file) {
        imagePath = addDomain(req.file.path);
      }

      // Create product using transaction to ensure data consistency
      const gln = await prisma.$transaction(async (prisma) => {
        // Create the product with single GTIN
        const newGLN = await prisma.gLN.create({
          data: {
            ...glnData,
            gtin: availableGtin.gtin.gtin,
            userId: req.user.id,
          },
        });

        console.log(`Updating GTIN ${availableGtin.gtin.gtin} to Used`);

        // Update only this single GTIN's status
        await prisma.gTIN.update({
          where: {
            id: availableGtin.gtinId,
            gtin: newGLN.gtin,
          },
          data: {
            status: "Used",
          },
        });

        return newGLN;
      });

      res.status(201).json(
        response(201, true, "Product created successfully", {
          product: gln,
        })
      );
    } catch (error) {
      if (imagePath) await deleteFile(imagePath);
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    let imagePath = null;
    try {
      const { id } = req.params;
      const { error, value } = glnSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Remove gtin from the update data
      const { gtin: _, ...updateData } = value;

      // Check if product exists and belongs to user
      const existingGLN = await prisma.gLN.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!existingGLN) {
        throw new MyError("GLN not found or unauthorized", 404);
      }

      // Handle image uploads
      if (req.file) {
        imagePath = addDomain(req.file.path);
        if (existingGLN.image) await deleteFile(existingGLN.image);
      }

      // Update GLN
      const updatedGLN = await prisma.gLN.update({
        where: { id },
        data: {
          ...updateData,
          image: imagePath,
        },
      });

      res.status(200).json(
        response(200, true, "GLN updated successfully", {
          gln: updatedGLN,
        })
      );
    } catch (error) {
      if (imagePath) await deleteFile(imagePath);
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      // Find product with user verification and include necessary relations
      const gln = await prisma.gLN.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!gln) {
        throw new MyError("Product not found or unauthorized", 404);
      }

      // Find the order and assigned GTIN - Modified to search all orders
      const assignedGtin = await prisma.assignedGtin.findFirst({
        where: {
          gtin: {
            gtin: gln.gtin,
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
        // Delete physical image file
        if (gln.image) await deleteFile(gln.image);

        // Release GTIN if exists - update status to "Sold"
        if (gln.gtin) {
          await prisma.gTIN.update({
            where: {
              gtin: gln.gtin,
              status: "Used",
            },
            data: {
              status: "Sold",
            },
          });
        }

        // Finally delete the product
        await prisma.gLN.delete({
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

      const gln = await prisma.gLN.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!gln) {
        throw new MyError("GLN not found or unauthorized", 404);
      }

      res.status(200).json(
        response(200, true, "GLN retrieved successfully", {
          gln,
        })
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
            { gtin: { contains: search } },
            { identifier: { contains: search } },
            { physicalLocation: { contains: search } },
            { locationNameEn: { contains: search } },
            { locationNameAr: { contains: search } },
            { addressEn: { contains: search } },
            { addressAr: { contains: search } },
            { poBox: { contains: search } },
            { postalCode: { contains: search } },
          ],
        }),
      };

      // First get the products
      const [glns, total] = await Promise.all([
        prisma.gLN.findMany({
          where: whereClause,

          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.gLN.count({ where: whereClause }),
      ]);

      // Get barcodeType information for each product
      const glnsWithBarcodeType = await Promise.all(
        glns.map(async (gln) => {
          const assignedGtin = await prisma.assignedGtin.findFirst({
            where: {
              gtin: {
                gtin: gln.gtin,
              },
            },
            include: {
              barcodeType: true,
            },
          });

          return {
            ...gln,
            barcodeType: assignedGtin?.barcodeType?.type || null,
          };
        })
      );

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "GLNs retrieved successfully", {
          glns: glnsWithBarcodeType,
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

  static async searchProducts(req, res, next) {
    try {
      const { gtin } = req.query;
      const gln = await prisma.gLN.findFirst({
        where: {
          gtin: {
            contains: gtin,
          },
        },
        include: {
          user: {
            select: {
              companyNameEn: true,
              companyNameAr: true,
            },
          },
        },
      });

      if (!gln) {
        throw new MyError(
          `We couldn't find the barcode ${gtin} in our database. Please verify the number and try again.`,
          404
        );
      }

      res.status(200).json(
        response(200, true, "Products retrieved successfully", {
          product: gln,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async exportExcelGLNs(req, res, next) {
    try {
      console.log("[Excel Export] Starting export process");

      // Fetch all GLNs for the user
      const glns = await prisma.gLN.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          user: {
            select: {
              companyNameEn: true,
              companyNameAr: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (glns.length === 0) {
        throw new MyError("No GLNs found for export", 404);
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("GLNs");

      // Define columns based on GLN schema
      worksheet.columns = [
        { header: "Identifier", key: "identifier", width: 20 },
        { header: "Physical Location", key: "physicalLocation", width: 30 },
        { header: "Location Name (EN)", key: "locationNameEn", width: 30 },
        { header: "Location Name (AR)", key: "locationNameAr", width: 30 },
        { header: "Address (EN)", key: "addressEn", width: 40 },
        { header: "Address (AR)", key: "addressAr", width: 40 },
        { header: "PO Box", key: "poBox", width: 15 },
        { header: "Postal Code", key: "postalCode", width: 15 },
        { header: "Latitude", key: "latitude", width: 15 },
        { header: "Longitude", key: "longitude", width: 15 },
        { header: "GTIN", key: "gtin", width: 20 },
        { header: "Status", key: "isActive", width: 10 },
        { header: "Company Name (EN)", key: "companyNameEn", width: 30 },
        { header: "Company Name (AR)", key: "companyNameAr", width: 30 },
        { header: "Created At", key: "createdAt", width: 20 },
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Add GLNs data with safe value checking
      glns.forEach((gln) => {
        try {
          const rowData = {
            identifier: gln?.identifier || "",
            physicalLocation: gln?.physicalLocation || "",
            locationNameEn: gln?.locationNameEn || "",
            locationNameAr: gln?.locationNameAr || "",
            addressEn: gln?.addressEn || "",
            addressAr: gln?.addressAr || "",
            poBox: gln?.poBox || "",
            postalCode: gln?.postalCode || "",
            latitude: gln?.latitude || "",
            longitude: gln?.longitude || "",
            gtin: gln?.gtin || "",
            isActive: gln?.isActive ? "Active" : "Inactive",
            companyNameEn: gln?.user?.companyNameEn || "",
            companyNameAr: gln?.user?.companyNameAr || "",
            createdAt: gln?.createdAt
              ? new Date(gln.createdAt).toLocaleDateString()
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
            `Error adding row for GLN ${gln?.id || "unknown"}:`,
            err
          );
        }
      });

      // Auto-fit columns with error handling
      worksheet.columns.forEach((column) => {
        if (column.key) {
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
      res.setHeader("Content-Disposition", 'attachment; filename="glns.xlsx"');

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

  static async exportPdfGLNs(req, res, next) {
    try {
      // Fetch all GLNs for the user with user information
      const [glns, user] = await Promise.all([
        prisma.gLN.findMany({
          where: {
            userId: req.user.id,
          },
          include: {
            user: {
              select: {
                companyNameEn: true,
                companyNameAr: true,
              },
            },
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

      if (glns.length === 0) {
        throw new MyError("No GLNs found for export", 404);
      }

      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `glns-${timestamp}.pdf`;
      const pdfPath = path.join(__dirname, "../uploads/pdfs", fileName);

      // Ensure the pdfs directory exists
      await fs.mkdir(path.join(__dirname, "../uploads/pdfs"), {
        recursive: true,
      });

      // Render the EJS template
      const templatePath = path.join(__dirname, "../view/glnList.ejs");
      const html = await ejs.renderFile(templatePath, { glns, user });

      // Launch puppeteer with specific configurations
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

      // Read the generated PDF file
      const pdfBuffer = await fs.readFile(pdfPath);

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="glns-${timestamp}.pdf"`
      );

      // Send the PDF
      res.send(pdfBuffer);

      // Clean up: Delete the temporary PDF file after sending
      await fs.unlink(pdfPath);
    } catch (error) {
      console.error("PDF export error:", error);
      next(error);
    }
  }
}

export default GLNController;
