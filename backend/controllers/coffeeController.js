import razorpayInstance from "../utils/razorpay.js";
import crypto from "crypto"
const createCoffeeOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `coffee_order_${Date.now()}`,
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error creating coffee order:", err);
    res.status(500).json({ message: "Failed to create coffee order" });
  }
};
const verifyCoffeePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature. Payment not verified." });
    }

    // Optionally save to DB or log donation
    console.log("Coffee payment verified:", razorpay_payment_id);

    res.status(200).json({ message: "Payment verified successfully." });
  } catch (err) {
    console.error("Error verifying coffee payment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createCoffeeOrder,verifyCoffeePayment };