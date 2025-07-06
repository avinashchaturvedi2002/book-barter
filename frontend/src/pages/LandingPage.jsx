import { Button } from "../components/ui/button";
import {  Bell, Repeat2, Users, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-white">
      

      <main className="max-w-5xl mx-auto px-4 py-2 text-center">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to BookBarter!  📚
        </motion.h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
          A Smarter Way to Share Books! Earn trust, build your collection, and save money.
        </p>
        <div className="flex flex-col gap-4 justify-center">
  <Link to="/browse">
    <Button className="text-base px-6 py-4">Explore Books Now</Button>
  </Link>
  <Link to="/how-it-works">
    <Button variant="outline" className="my-2">
  How Book Barter Works ?
</Button>

  </Link>
</div>
      </main>

      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-10 text-left">
  {/* Card 1: Multiple Modes */}
  <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
      <Repeat2 className="w-5 h-5 text-blue-500" />
      Flexible Sharing
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      Choose to sell, buy, exchange temporarily, lend, or borrow—whatever suits your need.
    </p>
  </div>

  {/* Card 2: OTP & Security */}
  <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
      <Lock className="w-5 h-5 text-blue-500" />
      OTP-Verified Transfers
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      Ensure trust and safety with OTP verification and refundable security for lending/borrowing.
    </p>
  </div>

 
  <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
      <Bell className="w-5 h-5 text-blue-500" />
      Real Time Notifications
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      Recieve notifcations about exchange status in real time on the website.
    </p>
  </div>
</section>

    
    </div>
  );
}
