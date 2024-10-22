import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";

import { db } from "../db/connection";
import { Users } from "../db/schemas/users";
import { eq } from "drizzle-orm";


