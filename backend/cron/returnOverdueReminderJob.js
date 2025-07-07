import cron from "node-cron";
import ExchangeRequest from "../models/ExchangeRequest.js";
import { sendEmail } from "../utils/sendEmail.js";
import { getIO } from "../socket.js";

// Runs every day at 10 AM
const returnOverdueReminderJob = cron.schedule("0 10 * * *", async () => {
  const now = new Date();

  try {
    const overdueExchanges = await ExchangeRequest.find({
      returnBy: { $lt: now },
      status: { $in: ["swapped", "lent_on_security"] },
    }).populate("requestedBy requestedFrom requestedBook");

    for (const exchange of overdueExchanges) {
      const borrower = exchange.requestedBy;
      const lender = exchange.requestedFrom;
      const book = exchange.requestedBook;

      if (!borrower?.email || !lender?.email || !book?.title) continue;

      // Email to borrower
      await sendEmail(
        borrower.email,
        "⚠️ Book Return Overdue",
        `Dear ${borrower.firstName},\n\nThe return of "${book.title}" is now overdue (was due on ${exchange.returnBy.toDateString()}).\nPlease return the book to the lender as soon as possible.\n\nThanks,\nBook Barter`
      );

      // Email to lender
      await sendEmail(
        lender.email,
        "🔔 Book Not Returned Yet",
        `Hi ${lender.firstName},\n\n"${book.title}" was supposed to be returned by ${borrower.firstName} on ${exchange.returnBy.toDateString()}, but it hasn't been marked as returned yet.\n\nYou can follow up with them via chat.\n\nThanks,\nBook Barter`
      );

      const io=getIO();
      await emitNotification(io, {
  toUserId: borrower._id,
  type: "return_overdue",
  message: `⚠️ "${book.title}" was due on ${exchange.returnBy.toDateString()}. Please return it ASAP.`,
  exchangeId: exchange._id,
  bookTitle: book.title,
});

// Notify lender
await emitNotification(io, {
  toUserId: lender._id,
  type: "book_not_returned",
  message: `🔔 "${book.title}" hasn't been returned by ${borrower.firstName}. It was due on ${exchange.returnBy.toDateString()}.`,
  exchangeId: exchange._id,
  bookTitle: book.title,
});
    }

    console.log(`⏰ Overdue reminders sent for ${overdueExchanges.length} exchanges.`);
  } catch (error) {
    console.error("❌ Overdue cron job error:", error);
  }
});

export default returnOverdueReminderJob;
