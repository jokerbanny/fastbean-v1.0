import express, { Application, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import errorHandler from "./middlewares/erorMiddleware";
import { addressRoute, userRoute, authRoute } from "./routes";

const app: Application = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// All Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/addresses", addressRoute);

// Catch-all route for unmatched routes
app.use((req: Request, res: Response) => {
  const requestedUrl = req.originalUrl; // Get the original URL requested
  res.status(404).json({
    message: `Oops! The resource you're looking for: ${requestedUrl} doesn't seem to exist. Please check the URL and try again.`,
  });
});

// Error Handler Middleware
app.use(errorHandler);

export { app };
