import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import bcrypt = require("bcryptjs");

import { db } from "../db/connection";
import { Users } from "../db/schemas/users";
import { eq } from "drizzle-orm";
import { User } from "../interfaces/interfaces";

//@desc      Get all Users By Admin
//route      GET /api/v1/users
//@access    Private
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await db.select().from(Users);
  res.status(200).json({ success: true, data: users });
});

//@desc      Get Sinlge User By Admin
//route      GET /api/v1/users/id
//@access    Private
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const [user] = await db.select().from(Users).where(eq(Users.id, userId));

  if (!user) {
    res
      .status(404)
      .json({ success: false, message: `User not found with id: ${userId}` });
    return;
  }

  res.status(200).json({ success: true, data: user });
});

//@desc      Post Create User By Admin
//route      POST /api/v1/users
//@access    Private
export const createUser = asyncHandler(async (req: Request, res: Response) => {
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

  const id = uuidv4().toUpperCase();
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const [check] = await db.select().from(Users).where(eq(Users.email, email));

  // If Email Existing
  if (check) {
    res.status(401).json({
      success: false,
      message: "User email has already been registered!",
    });
    return;
  }

  const user = { id, username, email, password: hashedPassword };

  await db.insert(Users).values(user);

  res.status(201).json({ success: true, data: user });
});

//@desc      Update a User By Admin
//route      PUT /api/v1/auth/users/id
//@access    Private
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
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
  const allowedFields: (keyof User)[] = [
    "fName",
    "lName",
    "username",
    "email",
    "phone",
    "password",
    "gender",
    "age",
    "photo",
    "verified",
    "imagesURL",
    "roles",
  ];

  const dataToUpdate = Object.keys(req.body)
    .filter((key) => allowedFields.includes(key as keyof User))
    .reduce((acc, key) => {
      acc[key as keyof User] = req.body[key];
      return acc;
    }, {} as Partial<User>);

  // Update user
  await db.update(Users).set(dataToUpdate).where(eq(Users.id, userId));

  // Fetch the updated user
  const [updatedUser] = await db
    .select()
    .from(Users)
    .where(eq(Users.id, userId));

  res.status(200).json({ success: true, data: updatedUser });
});

//@desc      Delete Sinlge User by Admin
//route      DELETE /api/v1/users/id
//@access    Private
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const [check] = await db.select().from(Users).where(eq(Users.id, userId));

  // Validate if user exists
  if (!check) {
    res.status(404).json({
      success: false,
      message: `Can not delet user not found with id: ${userId}`,
    });
    return;
  }

  await db.delete(Users).where(eq(Users.id, userId));

  res.status(200).json({ success: true, message: "User deleted successfully" });
});
