import MyError from "../utils/error.js";
import JWT from "../utils/jwt.js";
import prisma from "../utils/prismaClient.js";

export const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new MyError("Please provide a valid access token", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new MyError("User not authenticated", 401);
    }

    const decoded = JWT.verifyAccessToken(token);

    if (decoded.superadminId) {
      const superadmin = await prisma.superAdmin.findUnique({
        where: { id: decoded.superadminId },
      });

      if (!superadmin) {
        throw new MyError("Superadmin not found", 404);
      }

      req.superadmin = superadmin;
      return next();
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new MyError("User not found", 404);
    }

    if (!user.isActive) {
      throw new MyError(
        "Your account is suspended. Please contact support.",
        401
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new MyError("Access token expired", 419));
    }
    next(error);
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new MyError("No refresh token provided", 401);
    }

    const decoded = JWT.verifyRefreshToken(refreshToken);

    if (decoded.superadminId) {
      const superadmin = await prisma.superAdmin.findUnique({
        where: { id: decoded.superadminId },
      });

      if (!superadmin) {
        throw new MyError("Superadmin not found", 404);
      }

      req.superadmin = superadmin;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new MyError("User not found", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new MyError("Refresh token expired", 419));
    }
    next(error);
  }
};
