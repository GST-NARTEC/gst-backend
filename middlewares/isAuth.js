import jwt from "jsonwebtoken";

import MyError from "../utils/error.js";
import prisma from "../utils/prismaClient.js";

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
      return next(new MyError("You are not authenticated.", 401));
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(
          new MyError("Your session has expired. Please log in again.", 401)
        );
      } else {
        err.statusCode = 500;
        err.message = "Could not decode token.";
        return next(err);
      }
    }

    if (!decodedToken) {
      return next(new MyError("You are not authenticated.", 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });

    if (!user) {
      return next(new MyError("User not found.", 404));
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
