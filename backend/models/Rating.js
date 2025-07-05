import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  ratedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Rating", ratingSchema);
