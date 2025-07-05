import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  author: String,
  category: String,
  description: String,
  mode: { type: String, required: true },
  sellingPrice: Number,
  securityMoney: Number,
  available: { type: Boolean, default: true },
  imageUrl: String,
  city:String,
  location: {
    type: { type: String, default: "Point" },
    coordinates:[Number]
  },
}, { timestamps: true });

bookSchema.index({ location: "2dsphere" });

export default mongoose.model("Book", bookSchema);
