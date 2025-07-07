import ExchangeRequest from "../models/ExchangeRequest.js";
import Book from "../models/Book.js";
import bcrypt from "bcryptjs"
import razorpay from "../utils/razorpay.js";
import crypto from "crypto"
import { emitNotification } from "../utils/emitNotifications.js";
import {getIO} from "../socket.js"
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";


const acceptExchangeRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;

    // Find the exchange request
    const exchange = await ExchangeRequest.findById(requestId).populate("requestedBook");

    if (!exchange) {
      return res.status(404).json({ message: "Exchange request not found." });
    }

    // Ensure the logged-in user owns the requested book
    if(exchange.status!="counter_pending")
    {
      if (exchange.requestedBook.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to accept this request." });
    }
    }
    else
    {
      if (exchange.requestedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to accept this request." });
    }
  }

    // Update the status
    exchange.status = "accepted";
    exchange.lastActionBy=userId;

    await exchange.save();
    const io=getIO();
    await emitNotification(io, {
  toUserId : exchange.requestedBy,
  type     : "request_accepted",
  message  : "Your exchange request was accepted!",
  exchangeId: exchange._id
});

    const borrower = await User.findById(exchange.requestedBy);
await sendEmail(
  borrower.email,
  "Book Barter • Exchange Request Accepted",
  `Hi ${borrower.firstName},\n\nYour exchange request for "${exchange.requestedBook.title}" has been accepted. Head over to Book Barter to proceed with the next steps.\n\n📚 Book Barter Team`
);

    res.status(200).json({ message: "Exchange request accepted successfully.", exchange });
  } catch (error) {
    console.error("Error accepting exchange request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const rejectExchangeRequest=async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;

    // Find the exchange request
    const exchange = await ExchangeRequest.findById(requestId).populate("requestedBook");

    if (!exchange) {
      return res.status(404).json({ message: "Exchange request not found." });
    }

    // Ensure the logged-in user owns the requested book
    if (exchange.requestedBook.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to reject this request." });
    }

    // Update the status
    exchange.status = "rejected";
    exchange.lastActionBy=userId;
     
    await exchange.save();
    const io=getIO();
    await emitNotification(io, {
  toUserId : exchange.requestedBy,
  type     : "request_rejected",
  message  : "Your exchange request was rejected.",
  exchangeId: exchange._id
});
    
    const borrower = await User.findById(exchange.requestedBy);
await sendEmail(
  borrower.email,
  "Book Barter • Exchange Request Rejected",
  `Hi ${borrower.firstName},\n\nUnfortunately, your exchange request for "${exchange.requestedBook.title}" was rejected. Feel free to explore other books or try again with a different offer.\n\n📚 Book Barter Team`
);


    res.status(200).json({ message: "Exchange request rejected successfully.", exchange });
  } catch (error) {
    console.error("Error rejecting exchange request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const counterExchangeOffer = async (req, res) => {
  try {
    const userId      = req.user._id;         
    const requestId   = req.params.id;
    const { newOfferedBookId } = req.body;  

    const exchange = await ExchangeRequest.findById(requestId)
                          .populate("requestedBook");

    if (!exchange) return res.status(404).json({ message: "Request not found." });

   
    if (exchange.requestedBook.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to counter." });
    }

    
    const isAvailable = await Book.exists({
      _id: newOfferedBookId,
      owner: exchange.requestedBy,
      available: true
    });
    if (!isAvailable) {
      return res.status(400).json({ message: "Selected book is not available." });
    }

    /** mutate main fields */
    exchange.offeredBook = newOfferedBookId;
    exchange.status      = "counter_pending";
    exchange.lastActionBy = userId;

    /** push into history */
    exchange.history.push({
      by: userId,
      offeredBook: newOfferedBookId,
    });

    await exchange.save();
    const io=getIO();
    await emitNotification(io, {
  toUserId : exchange.requestedBy,
  type     : "counter_offer",
  message  : "You have a new counter-offer!",
  exchangeId: exchange._id
}); 

    const borrower = await User.findById(exchange.requestedBy);
await sendEmail(
  borrower.email,
  "Book Barter • New Counter-Offer",
  `Hi ${borrower.firstName},\n\nThe owner of "${exchange.requestedBook.title}" has sent a counter-offer. Log in to Book Barter to view and respond.\n\n📚 Book Barter Team`
);

    res.status(200).json({ message: "Counter-offer sent.", exchange });
  } catch (err) {
    console.error("Counter-offer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// routes/exchange.js or similar

const dismissRequest=async (req, res) => {
  try {
    const exchange = await ExchangeRequest.findOne({
      _id: req.params.id,
      requestedBy: req.user._id,
    });

    if (!exchange) {
      return res.status(404).json({ message: "Exchange request not found." });
    }

    if (exchange.status !== "rejected") {
      return res.status(400).json({ message: "Only rejected requests can be dismissed." });
    }

    exchange.dismissedByRequester = true;
    await exchange.save();

    res.status(200).json({ message: "Exchange request dismissed." });
  } catch (err) {
    console.error("Dismiss error:", err);
    res.status(500).json({ message: "Server error while dismissing request." });
  }
}

const cancelExchangeRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;

    const exchange = await ExchangeRequest.findById(requestId);

    if (!exchange) return res.status(404).json({ message: "Exchange request not found." });

    if (exchange.requestedBy.toString() !== userId.toString())
      return res.status(403).json({ message: "You are not authorized to cancel this request." });

    exchange.status = "cancelled"; 
    exchange.lastActionBy = userId;

    await exchange.save();
    const io=getIO();
    await emitNotification(io, {
  toUserId : exchange.requestedFrom,
  type     : "request_cancelled",
  message  : "The borrower cancelled their request.",
  exchangeId: exchange._id
}); 

    const owner = await User.findById(exchange.requestedFrom);
await sendEmail(
  owner.email,
  "Book Barter • Exchange Request Cancelled",
  `Hi ${owner.firstName},\n\nThe borrower has cancelled the exchange request for your book. You can explore other requests on Book Barter.\n\n📚 Book Barter Team`
);


    res.status(200).json({ message: "Exchange request cancelled by borrower.", exchange });
  } catch (error) {
    console.error("Error cancelling exchange request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const offerSecurityDeposit = async (req, res) => {
  try {
    const exchangeId = req.params.id;
    const userId = req.user._id;

    // 1️⃣  Fetch + sanity checks
    const ex = await ExchangeRequest.findById(exchangeId)
      .populate("requestedBook", "securityMoney title");

      console.log("*************************************************",ex);

    if (!ex) return res.status(404).json({ message: "Exchange request not found" });

    if (!ex.requestedFrom.equals(userId))
      return res.status(403).json({ message: "Only the lender can do this." });

    if (!["pending", "counter_pending"].includes(ex.status))
      return res
        .status(400)
        .json({ message: `Cannot offer security from status “${ex.status}”.` });

    // 2️⃣  Update
    ex.securityOffer  = true;
    ex.securityAmount = ex.securityAmount || ex.requestedBook.securityMoney;
    ex.offeredBook=null;
    ex.status         = "security_pending";
    ex.lastActionBy   = userId;
    await ex.save();
    const io=getIO();
    await emitNotification(io, {
  toUserId : ex.requestedBy,
  type     : "security_ready",
  message  : `Lender is willing to lend on ₹${ex.securityAmount} security.`,
  exchangeId: ex._id
});

    const borrower = await User.findById(ex.requestedBy);
await sendEmail(
  borrower.email,
  "Book Barter • Security Deposit Offered",
  `Hi ${borrower.firstName},\n\nThe lender has offered to lend you "${ex.requestedBook.title}" in exchange for a security deposit of ₹${ex.securityAmount}.\n\nLog in to proceed with the deposit.\n\n📚 Book Barter Team`
);

    // 4️⃣  Done
    res.json({
      message: "Security‐deposit offer sent to borrower.",
      exchangeRequest: {
        _id: ex._id,
        status: ex.status,
        securityAmount: ex.securityAmount,
      },
    });
  } catch (err) {
    console.error("offerSecurityDeposit error", err);
    res.status(500).json({ message: "Server error while offering security." });
  }
};



const createSecurityOrder = async (req, res) => {
  try {
    const exchangeId = req.params.id;
    const ex = await ExchangeRequest.findById(exchangeId).populate("requestedBook", "securityMoney");

    if (!ex || !ex.requestedBook) {
  return res.status(404).json({ message: "Exchange request not found" });
}

const amountInRupees = ex.securityAmount || ex.requestedBook.securityMoney;
const amountInPaise = amountInRupees * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${exchangeId}`,
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

const verifySecurityPayment = async (req, res) => {
  try {
    const {
      exchangeId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 1️⃣  Verify signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: "Signature verification failed" });

    // 2️⃣  Mark exchange as paid
    const ex = await ExchangeRequest.findById(exchangeId);
    if (!ex) return res.status(404).json({ message: "Exchange not found" });

    ex.status = "security_paid";
    ex.securityPaid = true;
    ex.securityOrderId = razorpay_order_id;
    ex.securityPaymentId = razorpay_payment_id;
    await ex.save();
    const io=getIO();
    await emitNotification(io, {
  toUserId : ex.requestedFrom,
  type     : "security_paid",
  message  : "Security deposit has been paid by borrower.",
  exchangeId: ex._id
});

    const lender = await User.findById(ex.requestedFrom);
await sendEmail(
  lender.email,
  "Book Barter • Security Deposit Paid",
  `Hi ${lender.firstName},\n\nThe borrower has successfully paid the security deposit for "${ex.requestedBook.title}". You can now hand over the book and track the transaction.\n\n📚 Book Barter Team`
);


    return res.status(200).json({ message: "Security deposit recorded", exchange: ex });
  } catch (err) {
    console.error("verifySecurityPayment error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export {acceptExchangeRequest,rejectExchangeRequest,counterExchangeOffer, dismissRequest, offerSecurityDeposit,cancelExchangeRequest, createSecurityOrder, verifySecurityPayment}
