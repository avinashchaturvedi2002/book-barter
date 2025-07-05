import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config used:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "present" : "missing"
});

const filePath = "./bi.jpg"; // ⬅️ replace this with a real image file path

cloudinary.uploader.upload(filePath, { resource_type: "image" }, (error, result) => {
  if (error) {
    console.error("❌ Upload failed:", error);
  } else {
    console.log("✅ Upload successful:", result.secure_url);
  }
});
