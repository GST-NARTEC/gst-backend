import bcrypt from "bcrypt";
import Joi from "joi";
import MyError from "../utils/error.js";
import JWT from "../utils/jwt.js";
import prisma from "../utils/prismaClient.js";
import response from "../utils/response.js";

const superAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

class SuperAdminController {
  static async login(req, res, next) {
    try {
      // Validate request body
      const { error, value } = superAdminSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      const { email, password } = value;

      // Verify credentials against env variables
      if (
        email !== process.env.SUPER_ADMIN_EMAIL ||
        password !== process.env.SUPER_ADMIN_PASSWORD
      ) {
        throw new MyError("Invalid credentials", 401);
      }

      // Check if super admin exists in database
      let superadmin = await prisma.superAdmin.findFirst({
        where: { email },
      });

      let tokenPayload;
      let accessToken;
      let refreshToken;

      // If super admin doesn't exist, create one
      if (!superadmin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        superadmin = await prisma.superAdmin.create({
          data: {
            email,
            password: hashedPassword,
          },
        });
      }

      // Create token payload
      tokenPayload = {
        superadminId: superadmin.id,
        email: superadmin.email,
      };

      // Generate tokens
      accessToken = JWT.generateAccessToken(tokenPayload);
      refreshToken = JWT.generateRefreshToken(tokenPayload);

      // Handle token storage with transaction
      try {
        await prisma.$transaction(
          async (tx) => {
            // Delete existing tokens
            await tx.refreshToken.deleteMany({
              where: { superadminId: superadmin.id },
            });

            // Create new refresh token
            await tx.refreshToken.create({
              data: {
                token: refreshToken,
                superadminId: superadmin.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              },
            });
          },
          {
            timeout: 10000, // 10 second timeout
            isolationLevel: "Serializable", // Highest isolation level
          }
        );
      } catch (tokenError) {
        console.error("Token operation failed:", tokenError);
        // If token operations fail, generate new tokens
        accessToken = JWT.generateAccessToken(tokenPayload);
        refreshToken = JWT.generateRefreshToken(tokenPayload);
      }

      // Remove sensitive data before sending response
      const { password: _, ...superadminData } = superadmin;

      res.status(200).json(
        response(200, true, "Super Admin login successful", {
          superAdmin: {
            ...superadminData,
            accessToken,
            refreshToken,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const superadmin = req.superadmin;

      const tokenPayload = {
        superadminId: superadmin.id,
        email: superadmin.email,
      };

      const accessToken = JWT.generateAccessToken(tokenPayload);
      const refreshToken = JWT.generateRefreshToken(tokenPayload);

      // Handle token refresh with transaction
      try {
        await prisma.$transaction(
          async (tx) => {
            // Delete existing tokens
            await tx.refreshToken.deleteMany({
              where: { superadminId: superadmin.id },
            });

            // Create new refresh token
            await tx.refreshToken.create({
              data: {
                token: refreshToken,
                superadminId: superadmin.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          },
          {
            timeout: 10000,
            isolationLevel: "Serializable",
          }
        );

        res.status(200).json(
          response(200, true, "Tokens refreshed successfully", {
            accessToken,
            refreshToken,
          })
        );
      } catch (tokenError) {
        console.error("Token refresh failed:", tokenError);
        throw new MyError("Failed to refresh tokens", 500);
      }
    } catch (error) {
      next(error);
    }
  }
}

export default SuperAdminController;
