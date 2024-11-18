import bcrypt from "bcrypt";
import Joi from "joi";
import jwt from "jsonwebtoken";
import EmailService from "../utils/email.js";
import MyError from "../utils/error.js";
import { generatePassword } from "../utils/generatePassword.js";
import { generateToken } from "../utils/generateToken.js";
import JWT from "../utils/jwt.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Validation schemas
const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const userInfoSchema = Joi.object({
  email: Joi.string().email().required(),
  companyLicenseNo: Joi.string().required(),
  companyNameEn: Joi.string().required(),
  companyNameAr: Joi.string().required(),
  landline: Joi.string().allow("", null),
  mobile: Joi.string().required(),
  country: Joi.string().required(),
  region: Joi.string().required(),
  city: Joi.string().required(),
  zipCode: Joi.string().required(),
  streetAddress: Joi.string().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const searchSchema = Joi.object({
  search: Joi.string().allow("").optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("email", "companyNameEn", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Add this helper function

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

      const {
        email,
        companyLicenseNo,
        companyNameEn,
        companyNameAr,
        landline,
        mobile,
        country,
        region,
        city,
        zipCode,
        streetAddress,
        latitude,
        longitude,
      } = value;

      // Check if unique fields are already taken
      const existingCompany = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { companyLicenseNo },
            { companyNameEn },
            { companyNameAr },
          ],
        },
      });

      if (existingCompany) {
        if (existingCompany.email === email) {
          throw new MyError("Email already registered", 400);
        }
        if (existingCompany.companyLicenseNo === companyLicenseNo) {
          throw new MyError("Company license number already registered", 400);
        }
        if (existingCompany.companyNameEn === companyNameEn) {
          throw new MyError("Company name (English) already registered", 400);
        }
        if (existingCompany.companyNameAr === companyNameAr) {
          throw new MyError("Company name (Arabic) already registered", 400);
        }
      }

      // Generate password
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          companyLicenseNo,
          companyNameEn,
          companyNameAr,
          landline,
          mobile,
          country,
          region,
          city,
          zipCode,
          streetAddress,
          latitude: latitude || null,
          longitude: longitude || null,
        },
      });

      // Don't send password hash in response just for testing later we will be sending the password in
      // payment confirmation email
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json(
        response(201, true, "User created successfully", {
          user: userWithoutPassword,
          password, // Include the plain password in response
        })
      );
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

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new MyError("Invalid email or password", 401);
      }

      const token = JWT.createToken(
        { userId: user.id, email: user.email },
        { expiresIn: "24h" }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json(
        response(200, true, "Login successful", {
          user: userWithoutPassword,
          token,
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
              { email: { contains: search, mode: "insensitive" } },
              { companyNameEn: { contains: search, mode: "insensitive" } },
              { companyNameAr: { contains: search, mode: "insensitive" } },
              { companyLicenseNo: { contains: search, mode: "insensitive" } },
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

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          cart: {
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      category: true,
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
          invoices: true,
        },
      });

      if (!user) {
        throw new MyError("User not found", 404);
      }

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json(
        response(200, true, "User details retrieved successfully", {
          user: userWithoutPassword,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
