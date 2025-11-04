import { MulterError } from "multer";
import MyError from "../utils/error.js";
import logger from "../utils/logger.js";
import response from "../utils/response.js";

export const notFoundHandler = (req, res, next) => {
  const error = new MyError(`No route found for ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  console.log(error);
  let status = 500;
  let message = "Internal Server Error !";
  let data = null;
  let success = false;

  if (error instanceof MyError || error instanceof MulterError) {
    status = error.statusCode || 500;
    message = error.message || message;
    data = error.data || null;
  }

  // Log error with detailed information
  logger.error({
    message: `[${status}] ${message}`,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const errorStack = error.stack || null;

  res.status(status).json(response(status, success, message, data, errorStack));
};
