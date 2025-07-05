import Notification from "../models/Notification.js";
import { onlineUsers } from "../socket.js";

export async function emitNotification(io, { toUserId, type, message, exchangeId }) {
  try {
    // 1. Save to DB
    const notif = await Notification.create({
      user: toUserId,
      type,
      message,
      exchangeId: exchangeId || null,
      read: false,
    });

    // 2. Emit to all sockets of the user
    const socketSet = onlineUsers.get(toUserId.toString());
    if (socketSet) {
      console.log(`📣 Emitting new_notification to user:${toUserId}`, notif);
      for (const sid of socketSet) {
        io.to(sid).emit("new_notification", notif);
      }
    } else {
      console.log(`🟡 User ${toUserId} is offline — not emitted`);
    }

    return notif;
  } catch (err) {
    console.error("❌ Failed to emit notification:", err.message);
  }
}
