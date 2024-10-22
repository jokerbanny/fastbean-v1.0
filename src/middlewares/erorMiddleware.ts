import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Determine the status code, defaulting to 500 for server errors
  const statusCode = res.statusCode < 400 ? 500 : res.statusCode;

  // Log the error message for debugging
  console.error("Error:", error.message);

  // Send a structured JSON response
  res.status(statusCode).json({
    message: error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }), // Include stack trace only in non-production
  });
};

export default errorHandler;
