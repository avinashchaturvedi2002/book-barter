import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import coffeeRoutes from "./routes/coffeeRoutes.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import chatRoutes from './routes/conversations.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import contactRoutes from "./routes/contactRoutes.js"
import cors from "cors";
import http from "http";
import { setupSocket } from "./socket.js";
import returnReminderJob from "./cron/returnReminderJob.js";
import returnOverdueReminderJob from "./cron/returnOverdueReminderJob.js";


dotenv.config();
const app = express();
const server = http.createServer(app);

// Setup socket.io
setupSocket(server);

// Connect to DB
connectDB();

// Middleware
// ==== CORS setup (must come before everything else) ====
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://192.168.31.198:5173",
  "http://localhost:3000",
  "https://book-barter-live.netlify.app",
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    console.log("🌐 Incoming origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.options("*", cors());

app.use(express.json());


// Route registration with debug wrappers
try {
  console.log("Loading /api/auth");
  app.use("/api/auth", authRoutes);
} catch (e) {
  console.error("❌ Failed to load /api/auth:", e);
}

try {
  console.log("Loading /api/books");
  app.use("/api/books", bookRoutes);
} catch (e) {
  console.error("❌ Failed to load /api/books:", e);
}

try {
  console.log("Loading /api/user");
  app.use("/api/user", userRoutes);
} catch (e) {
  console.error("❌ Failed to load /api/user:", e);
}

try {
  console.log("Loading /api/exchange");
  app.use("/api/exchange", exchangeRoutes);
} catch (e) {
  console.error("❌ Failed to load /api/exchange:", e);
}

try {
  console.log("Loading /api/conversations");
  app.use("/api/conversations", chatRoutes);
} catch (e) {
  console.error("❌ Failed to load /api/conversations:", e);
}

try {
  console.log("Loading /api/payment");
  app.use("/api/payment", coffeeRoutes);
} catch (e) {
  console.error("❌ Failed to load /api/payment:", e);
}

try {
  console.log("Loading /api/notifications");
  app.use("/api/notifications", notificationRoutes);
} catch (e) {
  console.error("❌ Failed to load /api/notifications:", e);
}

try {
  console.log("Loading /api/purchase");
  app.use("/api/purchase", purchaseRoutes);
} catch (e) {
  console.error("❌ Failed to load /api/purchase:", e);
}

try{
  console.log("Loading/api/contact");
  app.use("/api/contact",contactRoutes);
}
catch(e)
{
  console.error("Failed to load contact route")
}

// Cron jobs
returnReminderJob.start();
returnOverdueReminderJob.start();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
