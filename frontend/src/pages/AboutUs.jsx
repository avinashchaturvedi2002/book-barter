import { motion } from "framer-motion";
import {
  BookOpen,
  RefreshCcw,
  ShieldCheck,
  MessageCircle,
  Code2,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-white pb-20">
      {/* ===== Hero ===== */}
      <header className="max-w-5xl mx-auto px-4 pt-14 pb-10 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          About <span className="text-blue-600">Book&nbsp;Barter</span>
        </motion.h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Re‑imagining the way readers share knowledge, save money, and build
          community — one book at a time.
        </p>
      </header>

      {/* ===== Mission ===== */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" /> Our Mission
          </h2>
          <p className="leading-relaxed text-gray-700 dark:text-gray-300">
            We believe brilliant books deserve more than dusty shelves. Book
            Barter empowers readers to <strong className="text-blue-600">swap,
            lend, donate,</strong> and <strong className="text-blue-600">borrow </strong>
            books effortlessly — reducing waste and multiplying access to
            stories that matter.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <BookOpen className="w-32 h-32 text-blue-400 dark:text-blue-500" />
        </motion.div>
      </section>

      {/* ===== Why Built ===== */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center order-2 md:order-1"
          >
            <Users className="w-28 h-28 text-blue-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2 space-y-4"
          >
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <RefreshCcw className="w-6 h-6 text-blue-500" /> Why I Built It
            </h2>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              The idea for Book Barter emerged from a personal experience. After finishing The Alchemist, I was looking forward to reading The Kite Runner. I reached out to my WhatsApp groups to borrow a copy, but received no responses. This made me realize how fragmented and limited book sharing is, even among enthusiastic readers. I envisioned a platform that could foster a broader, more accessible reading community—one where users can easily lend, borrow, or exchange books in a structured, secure, and engaging environment. Book Barter is my attempt to transform isolated reading habits into a collaborative experience through technology, while promoting sustainability and deeper literary connections.
            </p>
            <a href="https://www.linkedin.com/in/avinash-chaturvedi/" >
            <p className="text-sm italic text-gray-500 dark:text-gray-400 mt-2">
  — Avinash Chaturvedi, Creator of Book Barter
</p>
            </a>
            
          </motion.div>
        </div>
      </section>

      {/* ===== Tech Stack ===== */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-center mb-10 flex items-center justify-center gap-2">
          <Code2 className="w-6 h-6 text-blue-500" /> Technology Stack
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Frontend */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">Frontend</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
              <li>React (Vite)</li>
              <li>Tailwind CSS & Framer Motion</li>
              <li>Context API + Hooks</li>
              <li>PWA‑ready</li>
            </ul>
          </div>
          {/* Backend */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">Backend</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
              <li>Node.js + Express</li>
              <li>MongoDB & Mongoose</li>
              <li>Socket.IO (real‑time)</li>
              <li>Razorpay payments</li>
            </ul>
          </div>
          {/* Security */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">Security & Trust</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
              <li>JWT Auth & Google OAuth</li>
              <li>OTP‑verified returns</li>
              <li>Rate limiting & sanitization</li>
              <li>Soft‑delete moderation tools</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Core Features ===== */}
      <section className="bg-blue-50 dark:bg-gray-900 py-16">
        <h2 className="text-2xl font-semibold text-center mb-12 flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-500" /> Core Features
        </h2>
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          {[
            {
              icon: <BookOpen className="w-5 h-5 text-blue-500" />,
              title: "Multi‑Mode Sharing",
              text: "Swap, lend, donate, or borrow — temporary or permanent — with refundable deposits when needed.",
            },
            {
              icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
              title: "Real‑Time Chat & Notifications",
              text: "Socket.IO powered messaging, typing indicators, seen status, and instant notifications for every action.",
            },
            {
              icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
              title: "Secure Transactions",
              text: "OTP‑verified handoffs and Razorpay‑secured deposits keep every exchange safe and fair.",
            },
            {
              icon: <Sparkles className="w-5 h-5 text-blue-500" />,
              title: "Community Reputation",
              text: "Ratings & reviews foster trust and highlight stellar readers.",
            },
          ].map(({ icon, title, text }) => (
            <div key={title} className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                {icon} {title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Call‑to‑Action ===== */}
      <footer className="max-w-5xl mx-auto px-4 pt-16 text-center flex flex-col justify-center items-center">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ready to give your books a new life?
        </motion.h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-md mx-auto mb-6">
          Join our growing community and start swapping today.
        </p>
        <Link to="/browse">
          <Button className="text-base px-6 py-4 flex items-center gap-2">
            Explore Books <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </footer>
    </div>
  );
}
