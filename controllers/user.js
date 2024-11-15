import prisma from "../utils/prismaClient.js";
import EmailService from "../utils/email.js";
import MyError from "../utils/error.js";
import response from "../utils/response.js";

class UserController {
  static async sendEmailOTP(req, res, next) {
    try {
      const { email } = req.body;

      // Check if email already exists and is verified
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser?.isEmailVerified) {
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
      const { email, otp } = req.body;

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

      // Create or update user with verified email
      await prisma.user.upsert({
        where: { email },
        create: {
          email,
          isEmailVerified: true,
        },
        update: {
          isEmailVerified: true,
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
      } = req.body;

      // Check if email exists and is verified
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        throw new MyError("Please verify your email first", 400);
      }

      if (!existingUser.isEmailVerified) {
        throw new MyError("Please verify your email first", 400);
      }

      // Update user with all information
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
        },
      });

      res.status(200).json(
        response(200, true, "User information saved successfully", {
          user: updatedUser,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
