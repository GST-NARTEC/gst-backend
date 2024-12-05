import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  emailSchema,
  loginSchema,
  searchSchema,
  userDetailsSchema,
  userInfoSchema,
  userUpdateSchema,
} from "../schemas/user.schema.js";
import EmailService from "../utils/email.js";
import MyError from "../utils/error.js";
import { deleteFile } from "../utils/file.js";
import { generateToken } from "../utils/generateToken.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";
import TokenManager from "../utils/tokenManager.js";

class UserController {
  static async sendEmailOTP(req, res, next) {
    try {
      const { error, value } = emailSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { email } = value;

      // Check if email already exists and is verified
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new MyError("Email is already registered", 400);
      }

      // Generate OTP and token
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const token = generateToken({ email, otp });

      console.log(`OTP for ${email}: ${otp}`);

      const emailSent = await EmailService.sendOTP(email, otp);
      if (!emailSent) {
        throw new MyError("Failed to send OTP email", 500);
      }

      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmailOTP(req, res, next) {
    try {
      const { otp, token } = req.body;

      if (!token) {
        throw new MyError("Token is required", 400);
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.otp !== otp) {
          throw new MyError("Invalid OTP", 400);
        }
      } catch (err) {
        throw new MyError("Invalid or expired OTP", 400);
      }

      res
        .status(200)
        .json(response(200, true, "Email verified successfully", null));
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      const { error, value } = userInfoSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { cartItems, ...userData } = value;

      // Verify products and addons exist
      const productIds = cartItems.map((item) => item.productId);
      const addonIds = cartItems.flatMap((item) =>
        (item.addons || []).map((addon) => addon.id)
      );

      const [products, addons] = await Promise.all([
        prisma.product.findMany({
          where: {
            id: { in: productIds },
            status: "active",
          },
        }),
        prisma.addon.findMany({
          where: {
            id: { in: addonIds },
            status: "active",
          },
        }),
      ]);

      if (products.length !== productIds.length) {
        throw new MyError("One or more products are invalid or inactive", 400);
      }

      if (addonIds.length > 0 && addons.length !== addonIds.length) {
        throw new MyError("One or more addons are invalid or inactive", 400);
      }

      // Create user and cart in transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Create user with cart in a single operation
        const user = await prisma.user.create({
          data: {
            ...userData,
            cart: {
              create: {
                items: {
                  create: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    addonItems: {
                      create: (item.addons || []).map((addon) => ({
                        addonId: addon.id,
                        quantity: addon.quantity,
                      })),
                    },
                  })),
                },
              },
            },
          },
          include: {
            cart: {
              include: {
                items: {
                  include: {
                    product: true,
                    addonItems: {
                      include: {
                        addon: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return user;
      });

      res
        .status(201)
        .json(response(201, true, "User registered successfully", result));
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { email, password } = value;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new MyError("Invalid email or password", 401);
      }

      // Check if user has completed checkout process
      if (!user.password) {
        throw new MyError(
          "Please complete checkout process to activate your account",
          403
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new MyError("Invalid email or password", 401);
      }

      const tokenPayload = { userId: user.id, email: user.email };
      const accessToken = TokenManager.generateAccessToken(tokenPayload);
      const refreshToken = TokenManager.generateRefreshToken(tokenPayload);

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json(
        response(200, true, "Login successful", {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async searchUsers(req, res, next) {
    try {
      const { error, value } = searchSchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { search, page, limit, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      const whereClause = search
        ? {
            OR: [
              { email: { contains: search } },
              { companyNameEn: { contains: search } },
              { companyNameAr: { contains: search } },
              { companyLicenseNo: { contains: search } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            email: true,
            companyNameEn: true,
            companyNameAr: true,
            companyLicenseNo: true,
            mobile: true,
            country: true,
            createdAt: true,
            password: false,
            isActive: true,
          },
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json(
        response(200, true, "Users retrieved successfully", {
          users,
          pagination: {
            total,
            page,
            totalPages,
            limit,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = userDetailsSchema.validate(req.query);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { fields } = value;
      let queryObject = {
        where: { id },
      };

      // If no field specified, return all user data except invoices
      if (!fields) {
        queryObject.include = {
          cart: {
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      category: true,
                      addons: {
                        where: {
                          status: "active",
                        },
                      },
                    },
                  },
                  addonItems: {
                    include: {
                      addon: true,
                    },
                  },
                },
              },
            },
          },
          orders: {
            include: {
              orderItems: {
                include: {
                  product: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
              invoice: true,
            },
          },
        };
      } else {
        // Return only specific field data
        switch (fields) {
          case "orders":
            queryObject.select = {
              id: true,
              orders: {
                include: {
                  orderItems: {
                    include: {
                      product: {
                        include: {
                          category: true,
                        },
                      },
                    },
                  },
                  invoice: true,
                },
              },
            };
            break;
          case "cart":
            queryObject.select = {
              id: true,
              cart: {
                include: {
                  items: {
                    include: {
                      product: {
                        include: {
                          category: true,
                          addons: {
                            where: {
                              status: "active",
                            },
                          },
                        },
                      },
                      addonItems: {
                        include: {
                          addon: true,
                        },
                      },
                    },
                  },
                },
              },
            };
            break;
          case "invoices":
            queryObject.select = {
              id: true,
            };
            break;
          case "profile":
            queryObject.select = {
              id: true,
              email: true,
              companyLicenseNo: true,
              companyNameEn: true,
              companyNameAr: true,
              landline: true,
              mobile: true,
              country: true,
              region: true,
              city: true,
              zipCode: true,
              streetAddress: true,
              latitude: true,
              longitude: true,
              createdAt: true,
              updatedAt: true,
            };
            break;
        }
      }

      const user = await prisma.user.findUnique(queryObject);

      if (!user) {
        throw new MyError("User not found", 404);
      }

      // Fetch invoices separately if needed
      let invoices = null;
      if (!fields || fields === "invoices") {
        invoices = await prisma.invoice.findMany({
          where: { userId: id },
          include: {
            order: {
              include: {
                orderItems: {
                  include: {
                    product: {
                      include: {
                        // category: true,
                        addons: true,
                        // addons: {
                        //   where: {
                        //     status: "active",
                        //   },
                        //   select: {
                        //     id: true,
                        //     name: true,
                        //     price: true,
                        //     unit: true,
                        //     stock: true,
                        //     status: true,
                        //   },
                        // },
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      const transformResponse = (data, invoiceData) => {
        if (!data) return null;

        // Create a deep clone to avoid mutating the original data
        const transformedData = JSON.parse(JSON.stringify(data));

        // Add invoices to response if they exist
        if (invoiceData) {
          transformedData.invoices = invoiceData;
        }

        return transformedData;
      };

      const transformedUser = transformResponse(user, invoices);

      const responseMessage = fields
        ? `User ${fields} retrieved successfully`
        : "User details retrieved successfully";

      res.status(200).json(
        response(200, true, responseMessage, {
          user: transformedUser,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // First check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          cart: {
            include: {
              items: {
                include: {
                  addonItems: true,
                },
              },
            },
          },
          orders: {
            include: {
              invoice: true,
              orderItems: true,
            },
          },
          invoices: true,
        },
      });

      if (!user) {
        throw new MyError("User not found", 404);
      }

      // Start transaction to ensure all related data is deleted
      await prisma.$transaction(async (prisma) => {
        // Delete cart items and their addons first if cart exists
        if (user.cart) {
          // First delete all cart item addons
          for (const cartItem of user.cart.items) {
            await prisma.cartItemAddon.deleteMany({
              where: { cartItemId: cartItem.id },
            });
          }

          // Then delete cart items
          await prisma.cartItem.deleteMany({
            where: { cartId: user.cart.id },
          });
        }

        // Delete order items and invoices
        for (const order of user.orders) {
          // Delete order items
          await prisma.orderItem.deleteMany({
            where: { orderId: order.id },
          });

          // Delete invoice if exists
          if (order.invoice) {
            // Delete the physical PDF file if it exists
            if (order.invoice.pdf) {
              try {
                await deleteFile(order.invoice.pdf);
              } catch (err) {
                console.warn(`Failed to delete invoice PDF: ${err.message}`);
              }
            }

            await prisma.invoice.delete({
              where: { id: order.invoice.id },
            });
          }

          // Delete the order
          await prisma.order.delete({
            where: { id: order.id },
          });
        }

        // Delete cart if exists
        if (user.cart) {
          await prisma.cart.delete({
            where: { id: user.cart.id },
          });
        }

        // Finally delete the user
        await prisma.user.delete({
          where: { id },
        });
      });

      res
        .status(200)
        .json(
          response(
            200,
            true,
            "User and all related data deleted successfully",
            null
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = userUpdateSchema.validate(req.body);

      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new MyError("User not found", 404);
      }

      // Check for unique constraints if updating company details
      if (
        value.companyLicenseNo ||
        value.companyNameEn ||
        value.companyNameAr
      ) {
        const uniqueCheck = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  value.companyLicenseNo
                    ? { companyLicenseNo: value.companyLicenseNo }
                    : {},
                  value.companyNameEn
                    ? { companyNameEn: value.companyNameEn }
                    : {},
                  value.companyNameAr
                    ? { companyNameAr: value.companyNameAr }
                    : {},
                ],
              },
            ],
          },
        });

        if (uniqueCheck) {
          if (uniqueCheck.companyLicenseNo === value.companyLicenseNo) {
            throw new MyError("Company license number already exists", 400);
          }
          if (uniqueCheck.companyNameEn === value.companyNameEn) {
            throw new MyError("Company name (English) already exists", 400);
          }
          if (uniqueCheck.companyNameAr === value.companyNameAr) {
            throw new MyError("Company name (Arabic) already exists", 400);
          }
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: value,
        select: {
          id: true,
          email: true,
          companyLicenseNo: true,
          companyNameEn: true,
          companyNameAr: true,
          landline: true,
          mobile: true,
          country: true,
          region: true,
          city: true,
          zipCode: true,
          streetAddress: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json(
        response(200, true, "User updated successfully", {
          user: updatedUser,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const user = req.user;
      const tokenPayload = { userId: user.id, email: user.email };

      const accessToken = TokenManager.generateAccessToken(tokenPayload);
      const refreshToken = TokenManager.generateRefreshToken(tokenPayload);

      // Update refresh token in database
      await prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.status(200).json(
        response(200, true, "Tokens refreshed successfully", {
          accessToken,
          refreshToken,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { action } = req.query;

      if (!["active", "inactive"].includes(action)) {
        throw new MyError("Invalid action. Use 'active' or 'inactive'", 400);
      }

      const isActive = action === "active";

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          email: true,
          companyNameEn: true,
          companyNameAr: true,
          isActive: true,
        },
      });

      if (!user) {
        throw new MyError("User not found", 404);
      }

      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          companyNameEn: true,
          companyNameAr: true,
          isActive: true,
        },
      });

      // Send email notification
      await EmailService.sendStatusUpdateEmail({
        email: user.email,
        user: updatedUser,
        isActive,
      });

      res.status(200).json(
        response(
          200,
          true,
          `User ${isActive ? "activated" : "suspended"} successfully`,
          {
            user: updatedUser,
          }
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async createWithCart(req, res, next) {
    try {
      const { error, value } = userInfoSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { cartItems, ...userData } = value;

      // Create user and cart in transaction
      const newUser = await prisma.$transaction(async (prisma) => {
        // Create the user first
        const user = await prisma.user.create({
          data: {
            ...userData,
            cart: {
              create: {
                status: "ACTIVE",
                items: {
                  create: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    addonItems: {
                      create: (item.addons || []).map((addon) => ({
                        addonId: addon.id,
                        quantity: addon.quantity,
                      })),
                    },
                  })),
                },
              },
            },
          },
          include: {
            cart: {
              include: {
                items: {
                  include: {
                    product: true,
                    addonItems: {
                      include: {
                        addon: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return user;
      });

      res.status(201).json(
        response(201, true, "User registered successfully", {
          user: newUser,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
