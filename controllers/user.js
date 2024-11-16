import bcrypt from "bcrypt";
import Joi from "joi";
import EmailService from "../utils/email.js";
import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken.js";
import { generatePassword } from "../utils/generatePassword.js";

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
}

export default UserController;
