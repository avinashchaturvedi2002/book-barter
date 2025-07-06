import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js";
import axios from "axios"
// Utility: Generate token
const generateToken = (userId,firstName,lastName,email) => {
  return jwt.sign({ id: userId,firstName,lastName,email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ");

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "Email/Username and password are required." });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id,user.firstName,user.lastName,user.email);
    res.status(200).json({ token, emailOrUsername });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// verify token


// POST /api/auth/google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ") || "-";

    let user = await User.findOne({ email });

    if (!user) {
      const usernameBase = email.split("@")[0];
      let uniqueUsername = usernameBase;
      let suffix = 1;

      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${usernameBase}${suffix++}`;
      }

      user = await User.create({
        firstName,
        lastName,
        email,
        username: uniqueUsername,
        password: null,
        profilePicture: picture,
        fromGoogle: true,
      });
    }

    const authToken = generateToken(user._id,user.firstName,user.lastName,user.email);
    res.json({
  token:authToken,
  user: {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatarUrl,
    firstName: user.firstName,
    lastName: user.lastName
  }
});

  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ message: "Invalid Google token" });
  }
};

const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.status(200).json({ valid: true, user });
  } catch (err) {
    console.error("Token verification failed", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericMsg = "If that email is registered, a reset link has been sent.";

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: genericMsg });

    // Generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash it using SHA256
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${email}`;

    await sendEmail(
      email,
      "Book Barter • Password Reset",
      `Click below to reset your password:\n\n${resetLink}\n\nThis link will expire in 15 minutes.`
    );

    res.status(200).json({ message: genericMsg });
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};


const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;

  try {
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the received raw token using SHA256
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Compare
    if (hashedToken !== user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const pwaGoogleHandling=async (req, res) => {

  const code = req.query.code;
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const FRONTEND_URL = process.env.FRONTEND_URL;
  if (!code) return res.status(400).send("Missing authorization code");

  try {
    // 1. Exchange code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/cb`,
      grant_type: 'authorization_code',
    });

    const { id_token } = tokenRes.data;

    // 2. Decode ID token to get user info
    const userInfo = jwt.decode(id_token);
    const { email, name, picture } = userInfo;

    // 3. Create or find user in DB
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, profilePic: picture });
    }

    // 4. Generate your app’s JWT
    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Redirect back to frontend with token
    const safeFrontendUrl = FRONTEND_URL.replace(/\/+$/, ""); // remove trailing slashes
    return res.redirect(`${safeFrontendUrl}/login?jwt=${appToken}`);
  } catch (err) {
    console.error('Google Token Exchange Error:',
    err.response?.data || err.message);
  return res.redirect(
    `${FRONTEND_URL}/login?error=oauth_failed`
  );
  }
}
export { registerUser, loginUser, googleAuth, verifyToken, resetPassword, forgotPassword,pwaGoogleHandling };
