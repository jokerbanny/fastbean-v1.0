// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { db } from "../db/connection";
import { Users } from "../db/schemas/users";
import { eq } from "drizzle-orm";
import { User, DecodedToken } from "../interfaces/interfaces";

// Extend the Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user: User; // Defined user type
    }
  }
}

// Middleware to protect routes
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as DecodedToken;

      const [user] = await db
        .select()
        .from(Users)
        .where(eq(Users.id, decoded.id))
        .limit(1);

      if (!user) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
      }

      // Assigment user to req.user
      req.user = user as User;

      next();
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
      return;
    }
  }
);

// Middleware to authorize based on user roles
export const authorize = (...roles: Array<User["roles"]>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.roles)) {
      res.status(403).json({
        success: false,
        message: `User role: ${req.user.roles} is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};
