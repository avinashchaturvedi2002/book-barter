import express from "express";
import { registerUser, googleAuth, loginUser, verifyToken, forgotPassword, resetPassword, pwaGoogleHandling } from "../controllers/authController.js";
import { body } from "express-validator";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  registerUser
);

router.post("/google", googleAuth);

router.post("/login",loginUser);

router.get("/verify",verifyToken);

router.post("/forgot-password",forgotPassword)

router.post("/reset-password",resetPassword)

router.get("/google/cb",pwaGoogleHandling)
export default router;
