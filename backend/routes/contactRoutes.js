import express from "express"
import { sendEmail } from "../utils/sendEmail.js";
const router=express.Router();
router.post("/",async(req,res)=>{
  const {name,email,message}=req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const subject = `📨 New Contact Form Message from ${name}`;
    const text = `From: ${name}\nEmail: ${email}\n\n${message}`;

    await sendEmail(process.env.EMAIL_USER, subject, text);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Failed to send contact form message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }

})

export default router