export const errorResponseHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 400;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// create a path handler
export const invalidPathHandler = (req, res, next) => {
  let error = new Error("Invalid Path");
  error.status = 400;
  next(error);
};
