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

    try {
      const decoded = JWT.verifyAccessToken(token);
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
        throw new MyError("Access token expired", 419);
      }
      throw new MyError("Invalid token", 401);
    }
  } catch (error) {
    next(error);
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new MyError("No refresh token provided", 401);
    }

    try {
      const decoded = JWT.verifyRefreshToken(refreshToken);
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
        throw new MyError("Refresh token expired", 419);
      }
      throw new MyError("Invalid refresh token", 401);
    }
  } catch (error) {
    next(error);
  }
};
