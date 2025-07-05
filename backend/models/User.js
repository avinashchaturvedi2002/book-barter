import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // only if not using Google
  googleId: { type: String }, // to support Google login
  profileImage: { type: String },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  fromGoogle: { type: Boolean, default: false },

  // 🔐 Password Reset Fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

}, { timestamps: true });

export default mongoose.model("User", userSchema);
