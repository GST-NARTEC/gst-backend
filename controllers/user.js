import bcrypt from "bcrypt";
import Joi from "joi";
import EmailService from "../utils/email.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

// Validation schemas
const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const otpVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(4).pattern(/^\d+$/).required(),
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

class UserController {
  static async sendEmailOTP(req, res, next) {
    try {
      const { error, value } = emailSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { email } = value;

      // Check if email already exists and is isCreated
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser?.isCreated) {
        throw new MyError("Email is already registered", 400);
      }

      // Generate 4 digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Set OTP expiry to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Save OTP
      await prisma.oTP.create({
        data: {
          email,
          otp,
          expiresAt,
        },
      });

      console.log(`OTP for ${email}: ${otp}`);

      const emailSent = await EmailService.sendOTP(email, otp);
      if (!emailSent) {
        throw new MyError("Failed to send OTP email", 500);
      }

      res.status(200).json(response(200, true, "OTP sent successfully", null));
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

      const { email, otp } = value;

      const otpRecord = await prisma.oTP.findFirst({
        where: {
          email,
          otp,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otpRecord) {
        throw new MyError("Invalid or expired OTP", 400);
      }

      // Create user with email and isCreated=false
      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          isCreated: false,
        },
        update: {
          isCreated: false,
        },
      });

      // Delete used OTP
      await prisma.oTP.delete({
        where: { id: otpRecord.id },
      });

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

      // Check if email exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        throw new MyError("Please verify your email first", 400);
      }

      if (existingUser.isCreated) {
        throw new MyError("User is already registered", 400);
      }

      // Generate password
      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user with all information and mark as isCreated
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
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
          password: hashedPassword,
          isCreated: true,
        },
      });

      res.status(200).json(
        response(200, true, "User isCreated successfully", {
          user: updatedUser,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
