import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../interfaces/interfaces";
import { v4 as uuidv4 } from "uuid";

import { db } from "../db/connection";
import { eq } from "drizzle-orm";
import { Users } from "../db/schemas/users";

// Only for user can update user detail
interface UserUpdate {
  fName: string;
  lName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  gender: "male" | "female" | "other";
  age: number;
  photo: string | null;
}

//@desc      Register user
//route      POST /api/v1/auth/register
//@access    Public
export const userRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body as User;

    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: `Please enter ${
          !username ? "username" : !email ? "email" : "password"
        }!`,
      });
      return;
    }

    const [check] = await db.select().from(Users).where(eq(Users.email, email));

    // If Email Existing
    if (check) {
      res.status(401).json({
        success: false,
        message: `This email: ${email} has already been registered!`,
      });
      return;
    }

    const id = uuidv4().toUpperCase();
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = { id, username, email, password: hashedPassword };

    await db.insert(Users).values(user);

    const userInfo = {
      ...user,
    } as User;

    sendTokenResponse(userInfo, 201, res);
  }
);

//@desc      Login user
//route      POST /api/v1/auth/login
//@access    Public
export const userLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as User;

  // Validation email password
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: `Please enter ${!email ? "email" : "password"}!`,
    });
    return;
  }

  // If Email Existing
  const [user] = await db.select().from(Users).where(eq(Users.email, email));

  // If Email Existing
  if (!user) {
    res.status(401).json({
      success: false,
      message: "User email not register on website!",
    });
    return;
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: `User password is wrong with: ${password}`,
    });
    return;
  }

  const userInfo = { ...user } as User;

  sendTokenResponse(userInfo, 200, res);
});

// controllers / auth.js
//@desc      Log user out / clear cookiew
//route      GET /api/v1/auth/logout
//@access    Private
export const userLogout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("token", "none"),
    {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    };
  res.status(200).json({});
});

//@desc      Get current logged in user
//route      POST /api/v1/auth/me
//@access    Private
export const userAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const [user] = await db.select().from(Users).where(eq(Users.id, userId));

  res.status(200).json({ success: true, data: user });
});

//@desc      Update a User By Admin
//route      PUT /api/v1/auth/users/id
//@access    Private
export const userUpdateDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const [check] = await db.select().from(Users).where(eq(Users.id, userId));

    // Validate if user exists
    if (!check) {
      res.status(404).json({
        success: false,
        message: `Can not update user not found with id: ${userId}`,
      });
      return;
    }

    const { gender, roles } = req.body;
    const allowedValues = ["male", "female", "helper", "buyer", "seller"];

    // Validate gender and roles
    const isValid = [gender, roles].every(
      (val) => !val || allowedValues.includes(val)
    );

    if (!isValid) {
      const invalidField =
        gender && !allowedValues.includes(gender)
          ? gender
          : roles && !allowedValues.includes(roles)
          ? roles
          : null;

      res.status(400).json({
        success: false,
        message: `Invalid value: ${invalidField}`,
      });
      return;
    }

    // Filter fields that can be updated
    const allowedFields: (keyof UserUpdate)[] = [
      "fName",
      "lName",
      "username",
      "email",
      "phone",
      "password",
      "gender",
      "age",
      "photo",
    ];

    const dataToUpdate = Object.keys(req.body)
      .filter((key) => allowedFields.includes(key as keyof UserUpdate))
      .reduce((acc, key) => {
        acc[key as keyof UserUpdate] = req.body[key];
        return acc;
      }, {} as Partial<UserUpdate>);

    if (req.body.password) {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);
      dataToUpdate.password = hashedPassword;
    }

    // Update user
    await db.update(Users).set(dataToUpdate).where(eq(Users.id, userId));

    // Fetch the updated user
    const [updatedUser] = await db
      .select()
      .from(Users)
      .where(eq(Users.id, userId));

    res.status(200).json({ success: true, data: updatedUser });
  }
);

// Get token from sign, create cookiew and send response
const sendTokenResponse = async (
  user: User,
  statusCode: number,
  res: Response
) => {
  // Create token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE || "30", 10) *
          24 *
          60 *
          60 *
          1000 // Fallback to 30 days if undefined
    ),
    httpOnly: true,
  };

  // if(process.env.NODE_ENV === 'production') {
  //     options.secure = true;
  // };

  res.status(statusCode).cookie("token", token, options).json(token);
};
