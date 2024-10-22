import { Router } from "express";
import {
  getAddresss,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController";

import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.route("/")
.get(protect,authorize("admin"), getAddresss)
.post(protect, createAddress);

router
  .route("/:id")
  .get(protect,  getAddress)
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default router;
