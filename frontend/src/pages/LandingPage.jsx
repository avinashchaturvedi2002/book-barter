import { Button } from "../components/ui/button";
import {  Bell, Repeat2, Users, Lock, Share, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isIos && !isInStandalone) {
      setShowIosPrompt(true);
    }
  }, []);
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

    {showIosPrompt && (
  <motion.div
    initial={{ y: 60, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    role="dialog"
    aria-live="polite"
    className="fixed inset-x-0 bottom-6 flex justify-center z-50 pointer-events-none"
  >
    <div className="pointer-events-auto bg-white dark:bg-gray-900 shadow-2xl rounded-2xl px-5 py-4 max-w-sm w-full mx-4">
      <button
        onClick={() => setShowIosPrompt(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss install instructions"
      >
        <X size={18} />
      </button>

      <div className="flex items-start space-x-3">
        <Share size={20} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm leading-5 text-gray-900 dark:text-gray-100">
          <strong className="font-semibold">Install Book Barter</strong> on your iPhone:<br />
          tap <span className="font-medium">Share</span> and then
          <span className="font-medium"> “Add to Home Screen”</span>.
        </p>
      </div>
    </div>
  </motion.div>
)}
    
    </div>
  );
}
