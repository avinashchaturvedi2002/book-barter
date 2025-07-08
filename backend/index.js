import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import coffeeRoutes from "./routes/coffeeRoutes.js"
import exchangeRoutes from "./routes/exchangeRoutes.js";
import chatRoutes from './routes/conversations.js';
import notificationRoutes from "./routes/notificationRoutes.js"
import cors from "cors";
import http from "http";
import { setupSocket } from "./socket.js";
import returnReminderJob from "./cron/returnReminderJob.js";
import returnOverdueReminderJob from "./cron/returnOverdueReminderJob.js";
import purchaseRoutes from "./routes/purchaseRoutes.js"


dotenv.config();
const app = express();
const server = http.createServer(app);
// Setup socket.io
setupSocket(server);// ✅ Adjusted for ES Module


connectDB();

 // ✅ Call this with the HTTP server // ✅ HTTP server for socket.io

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://192.168.31.198:5173",
  "http://localhost:3000",
  "https://book-barter-live.netlify.app",
].filter(Boolean); // removes undefined

app.options("*", cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      // Origin allowed
      callback(null, true);
    } else {
      // Origin not allowed
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/user", userRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use('/api/conversations', chatRoutes);
app.use("/api/payment",coffeeRoutes)
app.use("/api/notifications",notificationRoutes)
app.use("/api/purchase",purchaseRoutes)

returnReminderJob.start()
returnOverdueReminderJob.start();
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
