import mongoose from "mongoose";
const purchaseRequestSchema = new mongoose.Schema(
  {
    book:    { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    buyer:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status:  { type: String, enum: ["pending","accepted","rejected","completed", "cancelled"], default: "pending" },
    otp:     { type: String }, // 🔐 to validate book handoff
    otpValidated: { type: Boolean, default: false },
    otpGeneratedAt:{type:String},
  },
  { timestamps: true }
);


export default mongoose.model("PurchaseRequest", purchaseRequestSchema);
