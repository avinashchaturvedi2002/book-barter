import jwt from "jsonwebtoken";
import User from "../models/User.js";

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token && token !== "undefined" && token !== "null") {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select("-password");

          if (user) {
            req.user = user;
          }
        } catch (e) {
          console.log("Invalid token in optionalAuth:", e.message);
        }
      }
    } else {
      console.log("Guest user – no token provided");
    }
  } catch (error) {
    console.error("Error in optionalAuth:", error.message);
  }

  next(); // Always continue
};

export default optionalAuth;
