import express from "express";
import { registerUser, googleAuth, loginUser, verifyToken as verifyTokenController, forgotPassword, resetPassword, pwaGoogleHandling } from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyUser.js";
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

router.get("/verify",verifyTokenController);

router.post("/forgot-password",forgotPassword)

router.post("/reset-password",resetPassword)

router.get("/google/cb",pwaGoogleHandling)




// ✅ Authenticated route to get user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email profilePic");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});


export default router;
