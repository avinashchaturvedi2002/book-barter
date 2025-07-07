import cron from "node-cron";
import ExchangeRequest from "../models/ExchangeRequest.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { getIO } from "../socket.js";

// Runs every day at 9 AM
const returnReminderJob = cron.schedule("0 9 * * *", async () => {
  const now = new Date();

  // Set start of tomorrow
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  // Set end of tomorrow
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  try {
    const upcomingReturns = await ExchangeRequest.find({
      returnBy: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: { $in: ["swapped", "lent_on_security"] },
    }).populate("requestedBy requestedFrom requestedBook");

    for (const exchange of upcomingReturns) {
      const borrower = exchange.requestedBy;
      const lender = exchange.requestedFrom;
      const book = exchange.requestedBook;

      // Defensive checks
      if (!borrower?.email || !lender?.email || !book?.title) continue;

      await sendEmail(
        borrower.email,
        "📅 Book Return Reminder",
        `Hello ${borrower.firstName},\n\nPlease return "${book.title}" by ${exchange.returnBy.toDateString()}.\n\nThanks,\nBook Barter`
      );

      await sendEmail(
        lender.email,
        "📦 Book Return Expected",
        `Hello ${lender.firstName},\n\n"${book.title}" is due to be returned by ${borrower.firstName} by ${exchange.returnBy.toDateString()}.\n\nYou can track the exchange on Book Barter.\n\nRegards,\nBook Barter`
      );

      const io=getIO();

      await emitNotification(io, {
  toUserId: borrower._id,
  type: "return_reminder",
  message: `⏰ Reminder: Please return "${book.title}" by ${exchange.returnBy.toDateString()}.`,
  exchangeId: exchange._id,
  bookTitle: book.title,
});

// Notify lender
await emitNotification(io, {
  toUserId: lender._id,
  type: "return_due_notification",
  message: `📦 "${book.title}" is due to be returned by ${borrower.firstName} tomorrow.`,
  exchangeId: exchange._id,
  bookTitle: book.title,
});
    }

    console.log(`✅ Cron job executed: ${upcomingReturns.length} reminders sent.`);
  } catch (error) {
    console.error("❌ Cron job error:", error);
  }
});

export default returnReminderJob;
