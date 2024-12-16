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
      const { error, value } = superAdminSchema.validate(req.body);
      if (error) {
        throw new MyError(error.details[0].message, 400);
      }

      if (
        value.email !== process.env.SUPER_ADMIN_EMAIL ||
        value.password !== process.env.SUPER_ADMIN_PASSWORD
      ) {
        throw new MyError("Invalid credentials", 400);
      }

      // allow only one super admin
      let superadmin = await prisma.superAdmin.findFirst({
        where: {
          email: value.email,
        },
      });

      let accessToken, refreshToken;

      if (superadmin) {
        // just refresh access and refresh token
        accessToken = JWT.generateAccessToken({
          superadminId: superadmin.id,
        });
        refreshToken = JWT.generateRefreshToken({
          superadminId: superadmin.id,
        });
      } else {
        // create a new super admin
        const hashedPassword = await bcrypt.hash(value.password, 10);
        superadmin = await prisma.superAdmin.create({
          data: {
            ...value,
            password: hashedPassword,
          },
        });

        accessToken = JWT.generateAccessToken({
          superadminId: superadmin.id,
        });
        refreshToken = JWT.generateRefreshToken({
          superadminId: superadmin.id,
        });
      }

      res.status(201).json(
        response(201, true, "Super Admin created successfully", {
          superAdmin: {
            email: superadmin.email,
            accessToken,
            refreshToken,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default SuperAdminController;
