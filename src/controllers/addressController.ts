import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";

import { db } from "../db/connection";
import { Addresses } from "../db/schemas/addresses";
import { eq } from "drizzle-orm";
import { Address } from "../interfaces/interfaces";

//@desc      Get all Addresss By User
//route      GET /api/v1/addresss
//@access    Private
export const getAddresss = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const addresss = await db
    .select()
    .from(Addresses)
    .where(eq(Addresses.userId, userId));
  res.status(200).json({ success: true, data: addresss });
});

//@desc      Get Sinlge Address By User
//route      GET /api/v1/addresss/id
//@access    Private
export const getAddress = asyncHandler(async (req: Request, res: Response) => {
  const addressId = req.params.id;

  const [address] = await db
    .select()
    .from(Addresses)
    .where(eq(Addresses.id, addressId));

  if (!address) {
    res.status(404).json({
      success: false,
      message: `Address not found with id: ${addressId}`,
    });
    return;
  }

  res.status(200).json({ success: true, data: address });
});

//@desc      Post Create Address By User
//route      POST /api/v1/users
//@access    Private
export const createAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const id = uuidv4().toUpperCase();
    const { district, village, city, province, homeNo } = req.body as Address;

    const invalidField = (() => {
      if (district && typeof district !== "string") return "a valid district";
      if (!village || typeof village !== "string") return "village";
      if (!city || typeof city !== "string") return "city";
      if (!province || typeof province !== "string") return "province";
      if ((homeNo && typeof homeNo !== "number") || typeof homeNo === "boolean")
        return "homeNo";
    })();

    if (invalidField) {
      res.status(400).json({
        success: false,
        message: `Please enter a valid field: ${invalidField}!`,
      });
      return;
    }

    const address = {
      id,
      district,
      village,
      city,
      province,
      homeNo,
      userId,
    };

    await db.insert(Addresses).values(address);

    res.status(201).json({ success: true, data: address });
  }
);

//@desc      Update a Adress By User
//route      PUT /api/v1/auth/adresss/id
//@access    Private
export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const addressId = req.params.id;
    const { district, village, city, province, homeNo } = req.body as Address;

    const [check] = await db
      .select()
      .from(Addresses)
      .where(eq(Addresses.id, addressId));

    // Validate if adress exists
    if (!check) {
      res.status(404).json({
        success: false,
        message: `Can not update address not found with id: ${addressId}`,
      });
      return;
    }

    // Check if required fields are missing
    const invalidField = (() => {
      if (district && typeof district !== "string") return "a valid district";
      if (!village || typeof village !== "string") return "village";
      if (!city || typeof city !== "string") return "city";
      if (!province || typeof province !== "string") return "province";
      if ((homeNo && typeof homeNo !== "number") || typeof homeNo === "boolean")
        return "homeNo";
    })();

    if (invalidField) {
      res.status(400).json({
        success: false,
        message: `Please enter a valid field: ${invalidField}!`,
      });
      return;
    }

    const address = {
      id: addressId,
      district,
      village,
      city,
      province,
      homeNo,
    };

    // Fetch the updated address
    await db.update(Addresses).set(address).where(eq(Addresses.id, addressId));

    res.status(200).json({ success: true, data: address });
  }
);

//@desc      Delete Sinlge Address by User
//route      DELETE /api/v1/addresss/id
//@access    Private
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const addressId = req.params.id;

    const [check] = await db
      .select()
      .from(Addresses)
      .where(eq(Addresses.id, addressId));

    // Validate if address exists
    if (!check) {
      res.status(404).json({
        success: false,
        message: `Can not delet address not found with id: ${addressId}`,
      });
      return;
    }

    await db.delete(Addresses).where(eq(Addresses.id, addressId));

    res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  }
);
