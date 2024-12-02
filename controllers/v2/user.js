import Joi from "joi";
import jwt from "jsonwebtoken";
import EmailService from "../../utils/email.js";
import MyError from "../../utils/error.js";
import { generateToken } from "../../utils/generateToken.js";
import prisma from "../../utils/prismaClient.js";
import response from "../../utils/response.js";

// Validation schemas
const emailSchema = Joi.object({
  email: Joi.string().email().required(),
  cartId: Joi.string().uuid().required(),
});

const otpVerificationSchema = Joi.object({
  otp: Joi.string().length(4).required(),
  token: Joi.string().required(),
  cartId: Joi.string().uuid().required(),
});

const userInfoSchema = Joi.object({
  email: Joi.string().email().required(),
  cartId: Joi.string().uuid().required(),
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
  isActive: Joi.boolean().default(true),
});

class UserControllerV2 {
  static async sendEmailOTP(req, res, next) {
    try {
      const { error, value } = emailSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { email, cartId } = value;

      // Check if cart exists and is anonymous
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        throw new MyError("Cart not found", 404);
      }

      if (cart.userId) {
        throw new MyError("Cart is already associated with a user", 400);
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new MyError("Email is already registered", 400);
      }

      // Generate OTP and token
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const token = generateToken({ email, otp, cartId });

      console.log(`OTP for ${email}: ${otp}`); // For development

      const emailSent = await EmailService.sendOTP(email, otp);
      if (!emailSent) {
        throw new MyError("Failed to send OTP email", 500);
      }

      res.status(200).json(
        response(200, true, "OTP sent successfully", {
          token,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmailOTP(req, res, next) {
    try {
      const { error, value } = otpVerificationSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { otp, token, cartId } = value;

      // Verify cart still exists and is anonymous
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        throw new MyError("Cart not found", 404);
      }

      if (cart.userId) {
        throw new MyError("Cart is already associated with a user", 400);
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.otp !== otp || decoded.cartId !== cartId) {
          throw new MyError("Invalid OTP or cart mismatch", 400);
        }
      } catch (err) {
        throw new MyError("Invalid or expired OTP", 400);
      }

      res.status(200).json(
        response(200, true, "Email verified successfully", {
          email: decoded.email,
          cartId,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async registerWithCart(req, res, next) {
    try {
      const { error, value } = userInfoSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { cartId, ...userData } = value;

      // Check if cart exists and is not already associated with a user
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { user: true },
      });

      if (!cart) {
        throw new MyError("Cart not found", 404);
      }

      if (cart.userId) {
        throw new MyError("Cart is already associated with a user", 400);
      }

      // Check for existing user/company
      const existingCompany = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { companyLicenseNo: userData.companyLicenseNo },
            { companyNameEn: userData.companyNameEn },
            { companyNameAr: userData.companyNameAr },
          ],
        },
      });

      if (existingCompany) {
        if (existingCompany.email === userData.email) {
          throw new MyError("Email already registered", 400);
        }
        if (existingCompany.companyLicenseNo === userData.companyLicenseNo) {
          throw new MyError("Company license number already registered", 400);
        }
        if (existingCompany.companyNameEn === userData.companyNameEn) {
          throw new MyError("Company name (English) already registered", 400);
        }
        if (existingCompany.companyNameAr === userData.companyNameAr) {
          throw new MyError("Company name (Arabic) already registered", 400);
        }
      }

      // Create user and associate with cart
      const newUser = await prisma.user.create({
        data: {
          ...userData,
          cart: {
            connect: {
              id: cartId,
            },
          },
        },
        include: {
          cart: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
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

export default UserControllerV2;
