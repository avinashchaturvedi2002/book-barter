import cron from "node-cron";
import ExchangeRequest from "../models/ExchangeRequest.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// Run every day at 9 AM
const returnReminderJob = cron.schedule("0 9 * * *", async () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const upcomingReturns = await ExchangeRequest.find({
      returnBy: { $gte: now, $lte: tomorrow },
      status: "Swapped",
    }).populate("requestedBy requestedFrom requestedBook");

    for (const exchange of upcomingReturns) {
      const borrower = exchange.requestedBy;
      const lender = exchange.requestedFrom;
      const book = exchange.requestedBook;

      await sendEmail({
        to: borrower.email,
        subject: "📅 Book Return Reminder",
        text: `Please return "${book.title}" by ${exchange.returnBy.toDateString()}.`,
      });

      await sendEmail({
        to: lender.email,
        subject: "📦 Book Return Expected",
        text: `"${book.title}" is due to be returned by ${borrower.name} by ${exchange.returnBy.toDateString()}.`,
      });
    }

    console.log(`✅ Cron job executed: ${upcomingReturns.length} reminders sent.`);
  } catch (error) {
    console.error("❌ Cron job error:", error);
  }
});

export default returnReminderJob;
