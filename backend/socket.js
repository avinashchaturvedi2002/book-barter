import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/Message.js";
import Notification from "./models/Notification.js";
import Conversation from "./models/Conversation.js";

const onlineUsers = new Map();      // userId  ->  Set<socket.id>
let ioInstance;

export function setupSocket(server) {


  const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://192.168.31.198:5173",
  "http://localhost:3000",
  "https://book-barter-live.netlify.app",
].filter(Boolean);

ioInstance = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`❌ Socket.IO blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});
  const io = ioInstance;

  /* ────────────  GLOBAL AUTH MIDDLEWARE  ──────────── */
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Auth token missing"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;              // { id, … }
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  /* ────────────  PER‑SOCKET HANDLERS  ──────────── */
  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log("🟢  User connected:", userId);

    /* Join the personal room immediately */
    socket.join(`user:${userId}`);

    /* Maintain online‑users map for status */
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    socket.broadcast.emit("user_online", { userId });

    /* ── Join a single conversation room on demand ── */
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("join_personal_room", () => {
  socket.join(`user:${userId}`);
  console.log(`✅ ${userId} joined personal room`);
});

    /* ── Send Message ─────────────────────────────── */
    socket.on("send_message", async ({ conversationId, content }) => {
      const newMessage = await Message.create({
        conversationId,
        sender: userId,
        content,
        seenBy: [userId],
      });

      /* Update conversation’s lastMessage timestamp */
      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: newMessage._id, updatedAt: new Date() },
        { new: true }
      ).lean();

      /* Emit to everyone currently viewing the conversation */
      io.to(conversationId).emit("new_message", newMessage);

      /* Emit directly to each participant’s personal room */
      for (const participantId of conversation.participants) {
  const idStr = participantId.toString();
  if (idStr !== userId) {
    // Skip sending new_message again
    io.to(`user:${idStr}`).emit("update_conversations", {
      conversationId,
      lastMessage: newMessage,
    });
  }
}
    });

    /* ── Typing Indicators ────────────────────────── */
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("typing", { from: userId });
    });
    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(conversationId).emit("stop_typing", { from: userId });
    });

    /* ── Mark messages as seen ─────────────────────── */
    socket.on("mark_seen", async ({ conversationId }) => {
      await Message.updateMany(
        {
          conversationId,
          sender: { $ne: userId },
          seenBy: { $ne: userId },
        },
        { $addToSet: { seenBy: userId } }
      );

      const conv = await Conversation.findById(conversationId).lean();

      io.to(conversationId).emit("message_seen", { userId, conversationId });

      /* Notify every participant (all tabs) to refresh counts */
      conv.participants.forEach((pId) =>
        io.to(`user:${pId}`).emit("update_conversations")
      );
    });

    /* ── Real‑time Notifications ───────────────────── */
    socket.on(
      "send_notification",
      async ({ toUserId, type, message, exchangeId }) => {
        const notif = await Notification.create({
          user: toUserId,
          type,
          message,
          exchangeId,
        });
        console.log(`📣 Emitting new_notification to user:${toUserId}`, notif);
        io.to(`user:${toUserId}`).emit("new_notification", notif);
      }
    );

    /* ── Disconnect cleanup ───────────────────────── */
    socket.on("disconnect", () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("user_offline", { userId });
        }
      }
      console.log("🔴  User disconnected:", userId);
    });
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance)
    throw new Error("Socket.io not initialised – call setupSocket() first");
  return ioInstance;
}

export { onlineUsers };
