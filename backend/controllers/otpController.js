// controllers/exchangeController.js
import ExchangeRequest from "../models/ExchangeRequest.js";
import Book from "../models/Book.js";
import PurchaseRequest from "../models/PurchaseRequest.js"
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import { emitNotification } from "../utils/emitNotifications.js";
import {getIO} from "../socket.js"
import User from "../models/User.js";

const OTP_EXPIRY_MINUTES = 10;

export const initiateOtpExchange = async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;
    console.log("idhar aayi call");
    const exchange = await ExchangeRequest.findById(requestId)
  .populate({
    path: "requestedBook",
    populate: {
      path: "owner", // this must match your Book model's owner field
      model: "User"
    }
  });

    if (!exchange) {
      return res.status(404).json({ message: "Exchange request not found." });
    }

    if (exchange.requestedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the borrower can initiate the OTP exchange." });
    }

    const now = new Date();
    const expiryTime = new Date(exchange.otpGeneratedAt || 0);
    expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);

    if (exchange.lenderOtp && now < expiryTime) {
      return res.status(200).json({ message: "OTP already initiated. Please validate within 10 minutes." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    exchange.lenderOtp = hashedOtp;
    exchange.otpGeneratedAt = now;
    await exchange.save();
    console.log("exchange ",exchange);
    const lenderEmail = exchange.requestedBook.owner.email;
    console.log("Lender email", lenderEmail);
    await sendEmail(
       lenderEmail,
       "Book Barter OTP for Exchange Confirmation",
      `Hello,\n\nYour OTP for confirming the exchange is:${otp}\nIt will expire in 10 minutes.\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\nThank you.`
    );
    const io=getIO();
     await emitNotification(io, {
   toUserId : exchange.requestedBook.owner._id,
  type     : "otp_initiated",
   message  : "Borrower has generated an OTP for the swap.",
   exchangeId: exchange._id
 });

    res.status(200).json({ message: "OTP sent to lender's email." });
  } catch (err) {
    console.error("OTP initiation error:", err);
    res.status(500).json({ message: "Server error during OTP initiation" });
  }
};

export const validateExchangeOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;
    const { otp } = req.body;

    const exchange = await ExchangeRequest.findById(requestId)
      .populate("requestedBook")
      .populate("offeredBook");

    if (!exchange) {
      return res.status(404).json({ message: "Exchange not found." });
    }

    if (exchange.requestedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the borrower can validate the OTP." });
    }

    if (!exchange.otpGeneratedAt) {
      return res.status(400).json({ message: "No OTP initiated for this exchange." });
    }

    // Expiry Check
    const expiryTime = new Date(exchange.otpGeneratedAt);
    expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);
    if (new Date() > expiryTime) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // OTP Match
    const isValid = await bcrypt.compare(otp, exchange.lenderOtp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check book availability
    if (!exchange.requestedBook.available) {
      return res.status(409).json({ message: "Requested book is no longer available." });
    }

    if (exchange.status !== "security_paid" && exchange.offeredBook && !exchange.offeredBook.available) {
      return res.status(409).json({ message: "Offered book is no longer available." });
    }

    // Status update
    exchange.status = exchange.status === "security_paid" ? "lent_on_security" : "swapped";
    exchange.lenderOtp = undefined;
    exchange.otpGeneratedAt = undefined;
    exchange.lenderOtpValidated = true;

    const msPerDay = 24 * 60 * 60 * 1000;
    exchange.returnBy = new Date(Date.now() + exchange.durationInDays * msPerDay);

    await exchange.save();

    await Book.findByIdAndUpdate(exchange.requestedBook._id, { available: false });

    if (exchange.offeredBook) {
      await Book.findByIdAndUpdate(exchange.offeredBook._id, { available: false });
    }

    const borrower = await User.findById(exchange.requestedBy);
const lender = await User.findById(exchange.requestedFrom);

await sendEmail(
  borrower.email,
  "Book Barter • Exchange Confirmed",
  `Hi ${borrower.firstName},\n\nYour exchange for "${exchange.requestedBook.title}" has been successfully confirmed.\n\nReturn by: ${exchange.returnBy.toDateString()}\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\n📚 Book Barter Team`
);

await sendEmail(
  lender.email,
  "Book Barter • Exchange Confirmed",
  `Hi ${lender.firstName},\n\nYou have successfully lent/swapped your book "${exchange.requestedBook.title}".\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\n📚 Book Barter Team`
);


    const successMsg =
  exchange.status === "lent_on_security"
    ? "Lending on security completed!"
    : "Books swapped successfully!";
    const io=getIO();
await emitNotification(io, {
  toUserId: exchange.requestedBy,
  type: "exchange_completed",
  message: successMsg,
  exchangeId: exchange._id
});

await emitNotification(io, {
  toUserId: exchange.requestedFrom,
  type: "exchange_completed",
  message: successMsg,
  exchangeId: exchange._id
});


    res.status(200).json({ message: "Exchange validated and marked as completed." });

  } catch (err) {
    console.error("OTP validation error:", err);
    res.status(500).json({ message: "Server error during OTP validation" });
  }
};


export const initiateReturnOtpExchange=async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",requestId);

    const exchange = await ExchangeRequest.findById(requestId)
  .populate({
    path: "requestedBook",
    populate: {
      path: "owner", // this must match your Book model's owner field
      model: "User"
    }
  });

    if (!exchange) {
      return res.status(404).json({ message: "Exchange request not found." });
    }

    if (exchange.requestedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the borrower can initiate the OTP exchange." });
    }

    const now = new Date();
    const expiryTime = new Date(exchange.returnOtpGeneratedAt|| 0);
    expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);

    if (exchange.returnOtp && now < expiryTime) {
      return res.status(200).json({ message: "OTP already initiated. Please validate within 10 minutes." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    exchange.returnOtp = hashedOtp;
    exchange.returnOtpGeneratedAt = now;
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",exchange);
    await exchange.save();
    console.log("exchange ",exchange);
    const lenderEmail = exchange.requestedBook.owner.email;
    console.log("Lender email", lenderEmail);
    await sendEmail(
       lenderEmail,
       "Book Barter OTP for Exchange Confirmation",
      `Hello,\n\nYour OTP for returning the exchange is: ${otp}.\nIt will expire in 10 minutes.\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\nThank you.`
    );
    const io=getIO();
    await emitNotification(io, {
  toUserId: exchange.requestedBook.owner._id,
  type: "return_otp_initiated",
  message: "Borrower generated OTP to return the book.",
  exchangeId: exchange._id
});


    res.status(200).json({ message: "OTP sent to lender's email." });
  } catch (err) {
    console.error("OTP initiation error:", err);
    res.status(500).json({ message: "Server error during OTP initiation" });
  }
};
export const validateReturnOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;
    const { otp } = req.body;

    const exchange = await ExchangeRequest.findById(requestId).populate("requestedBook");

    if (!exchange) {
      return res.status(404).json({ message: "Exchange not found." });
    }

    if (exchange.requestedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the borrower can validate the OTP." });
    }

    const now = new Date();
    console.log("exchange: ",exchange);
if (!exchange.returnOtpGeneratedAt) {
  return res.status(400).json({ message: "No OTP initiated for this exchange." });
}

const expiryTime = new Date(exchange.returnOtpGeneratedAt);
expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);

if (now > expiryTime) {
  return res.status(400).json({ message: "OTP expired. Please request a new one." });
}


    const isValid = await bcrypt.compare(otp, exchange.returnOtp);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    exchange.status = "completed";
    exchange.returnOtp = undefined;
    exchange.returnOtpGeneratedAt = undefined;
    await exchange.save();

    await Book.findByIdAndUpdate(exchange.requestedBook._id, { available: true });
    await Book.findByIdAndUpdate(exchange.offeredBook, { available: true });
    const borrower = await User.findById(exchange.requestedBy);
const lender = await User.findById(exchange.requestedFrom);

await sendEmail(
  borrower.email,
  "Book Barter • Book Return Completed",
  `Hi ${borrower.firstName},\n\nYou have successfully returned "${exchange.requestedBook.title}".\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\n📚 Thank you for using Book Barter!`
);

await sendEmail(
  lender.email,
  "Book Barter • Book Received Back",
  `Hi ${lender.firstName},\n\n"${exchange.requestedBook.title}" has been returned by the borrower.\nPlease confirm the condition and proceed with any refund if applicable.\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\n📚 Book Barter Team`
);

    
    const io=getIO();
    await emitNotification(io, {
  toUserId: exchange.requestedBy,
  type: "book_returned",
  message: "Return completed. Security will be refunded (if applicable).",
  exchangeId: exchange._id
});

await emitNotification(io, {
  toUserId: exchange.requestedFrom,
  type: "book_returned",
  message: "Your book has been returned by borrower.",
  exchangeId: exchange._id
});


    res.status(200).json({ message: "Book Marked as returned" });
  } catch (err) {
    console.error("OTP validation error:", err);
    res.status(500).json({ message: "Server error during OTP validation" });
  }
};

export const initiatePurchaseOtp=async(req,res)=>{
  try{
    const userId=req.user._id;
    const purchaseId=req.params.id;
    const purchase=await PurchaseRequest.findById(purchaseId).populate({path:"seller",select:"email"});
    console.log(purchase);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase request not found." });
    }

    if (purchase.buyer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the buyer can initiate the OTP for purchasing." });
    }
    const now = new Date();
    const expiryTime = new Date(purchase.otpGeneratedAt || 0);
    expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);

    if (purchase.otp && now < expiryTime) {
      return res.status(200).json({ message: "OTP already initiated. Please validate within 10 minutes." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    purchase.otp=hashedOtp;
    purchase.otpGeneratedAt=now;
    await purchase.save();

    const sellerEmail=purchase.seller.email;
    console.log(purchase);
    await sendEmail(
       sellerEmail,
       "Book Barter OTP for Selling Confirmation",
      `Hello,\n\nYour OTP for confirming the selling of book is: ${otp}\nIt will expire in 10 minutes.\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\nThank you.\n `
    );
    const io=getIO();
     await emitNotification(io, {
   toUserId : purchase.seller,
  type     : "otp_initiated",
   message  : "Buyer has generated an OTP for the selling of book",
   purchaseId: purchase._id})

   res.status(200).json({ message: "OTP sent to buyer's email." });
  }
  catch(err)
  {
    console.error("OTP initiation error:", err);
    res.status(500).json({ message: "Server error during OTP initiation" });
  }
}

export const validatePurchaseOtp=async(req,res)=>{
  try {
    const userId = req.user._id;
    const purchaseId = req.params.id;
    const { otp } = req.body;

    const purchase = await PurchaseRequest.findById(purchaseId)
      .populate("book");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    if (purchase.buyer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the buyer can validate the OTP." });
    }

    if (!purchase.otpGeneratedAt) {
      return res.status(400).json({ message: "No OTP initiated for this purchase." });
    }

    // Expiry Check
    const expiryTime = new Date(purchase.otpGeneratedAt);
    expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);
    if (new Date() > expiryTime) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // OTP Match
    const isValid = await bcrypt.compare(otp, purchase.otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check book availability
    if (!purchase.book.available) {
      return res.status(409).json({ message: "Requested book is no longer available." });
    }


    // Status update
    purchase.status="completed"
    purchase.otp = undefined;
    purchase.otpGeneratedAt = undefined;
    purchase.otpValidated = true;

    await purchase.save();

    await Book.findByIdAndUpdate(purchase.book._id, { available: false });

    const buyer = await User.findById(purchase.buyer);
const seller = await User.findById(purchase.seller);

await sendEmail(
  buyer.email,
  "Book Barter • Purchase Completed",
  `Hi ${buyer.firstName},\n\nYour purchase of "${purchase.book.title}" is successful! Enjoy reading 📚\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\nThanks for using Book Barter.`
);

await sendEmail(
  seller.email,
  "Book Barter • Book Sold",
  `Hi ${seller.firstName},\n\nYou have successfully sold your book "${purchase.book.title}".\nPlease ensure handover and mark the delivery complete.\n\n Click here to open app : ${process.env.FRONTEND_URL}\n\n📚 Book Barter Team`
);


    const io=getIO();
await emitNotification(io, {
  toUserId: purchase.buyer,
  type: "exchange_completed",
  message: "Congratulations on your new book!",
  purchaseId: purchase._id
});

await emitNotification(io, {
  toUserId: purchase.seller,
  type: "exchange_completed",
  message: "Congratulations on your sale!",
  exchangeId: purchase._id
});


    res.status(200).json({ message: "Sale marked as completed." });

  } catch (err) {
    console.error("OTP validation error:", err);
    res.status(500).json({ message: "Server error during OTP validation" });
  }
}