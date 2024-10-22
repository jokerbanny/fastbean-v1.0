import { Router } from "express";
import {
  userRegister,
  userLogin,
  userAccount,
  userLogout,
  userUpdateDetails,
  // userForgotPassword,
} from "../controllers/authController";
import { protect } from "./../middlewares/authMiddleware";

const router = Router();

// This all routes for users
router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/account", protect, userAccount);
router.get("/logout", userLogout);
router.put("/update-details", protect, userUpdateDetails);
// router.patch("/update-password", protect, userForgotPassword);

export default router;
