import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "incoming_request",
      "request_rejected",
      "request_cancelled",
      "request_accepted",
      "counter_offer",
      "security_ready",
      "exchange_completed",
      "book_returned",
      "exchange_request",
      "purchase_request",
      "otp_initiated",
      "new_rating",
      "return_due_notification",
      "return_reminder",
      "return_overdue",
      "book_not_returned",
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  exchangeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExchangeRequest",
    default: null,
  },
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseRequest",
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
