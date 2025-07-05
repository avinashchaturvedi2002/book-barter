import mongoose from "mongoose";

const offerTrailSchema = new mongoose.Schema(
  {
    by:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offeredBook: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const exchangeRequestSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // borrower
  requestedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // lender
  requestedBook: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  offeredBook: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed","swapped","overdue","counter_pending","security_pending","security_paid", "cancelled","lent_on_security"],
    default: "pending"
  },
  history: [offerTrailSchema],   // <── NEW
  lastActionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  securityOffer: { type: Boolean, default: false },
  securityAmount: { type: Number }, 
  securityPaid: { type: Boolean, default: false },
  securityOrderId: String,
  securityPaymentId: String,
  message: { type: String },

  // OTPs
  lenderOtp: { type: String },   // hashed
  lenderOtpValidated: { type: Boolean, default: false },
  otpGeneratedAt:{type:String},
   // shared expiry

   returnOtp: { type: String }, // hashed
  returnOtpGeneratedAt: { type: Date },
  returnOtpValidated: { type: Boolean, default: false },
   durationInDays: { type: Number }, // selected duration
  returnBy: { type: Date },
  
  dismissedByRequester: {
  type: Boolean,
  default: false,
},


}, { timestamps: true });

export default mongoose.model("ExchangeRequest", exchangeRequestSchema);
