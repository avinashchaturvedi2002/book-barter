import { motion } from "framer-motion";
import {
  BookOpen,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Repeat2,
  Handshake,
  Star,
  CircleDollarSign,
  RefreshCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-white pb-20">
      {/* ===== Hero Section ===== */}
      <header className="max-w-5xl mx-auto px-4 pt-14 pb-10 text-center">
  <motion.h1
    className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
  >
    Watch How <span className="text-blue-600">Book Barter</span> Works
  </motion.h1>

  {/* Responsive YouTube Video */}
  <div className="w-full max-w-3xl mx-auto px-4 mb-8">
  <div className="relative w-full pt-[56.25%] sm:pt-[50%] md:pt-[45%] lg:pt-[40%] rounded-xl overflow-hidden shadow-lg">
    <iframe
      className="absolute top-0 left-0 w-full h-full"
      src="https://www.youtube.com/embed/BjJPS2Knak0"
      title="Book Barter Demo"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
</div>



  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
    A seamless and secure way to swap, lend, or buy books — powered by community and technology.
  </p>
</header>

      {/* ===== Flow Sections ===== */}
      <section className="max-w-5xl mx-auto px-4 grid gap-12">
        {[
          {
            icon: <BookOpen className="w-7 h-7 text-blue-500" />,
            title: "1. Discover & Request",
            description:
              "Login via Google or email/password. Browse available books listed by other users. To request an exchange or lending, you must have at least one book uploaded and available.",
          },
          {
            icon: <Handshake className="w-7 h-7 text-blue-500" />,
            title: "2. Send a Request",
            description:
              "Choose to exchange (temporary or permanent) or buy. The book owner is notified instantly and can accept, reject, make a counter offer, or propose lending for a security deposit.",
          },
          {
            icon: <MessageCircle className="w-7 h-7 text-blue-500" />,
            title: "3. Chat & Meet",
            description:
              "Once accepted, both users can chat in real-time to finalize a meetup. At the exchange spot, the requester initiates OTP verification to complete the transaction.",
          },
          {
            icon: <ShieldCheck className="w-7 h-7 text-blue-500" />,
            title: "4. OTP Validation",
            description:
              "Book owner receives a one-time password (OTP) via email. Upon verification, the system marks the books as swapped, lent, or sold.",
          },
          {
            icon: <Repeat2 className="w-7 h-7 text-blue-500" />,
            title: "5. Returns & Completion",
            description:
              "For exchanges and lent books, the requester can initiate a return from their profile. The same OTP flow ensures a verified return and completion of the transaction.",
          },
          {
            icon: <RefreshCcw className="w-7 h-7 text-blue-500" />,
            title: "6. Counter Offers & Alternatives",
            description:
              "If the owner sees other available books in the requester's library, they can propose an alternate exchange. The requester can accept or cancel the counter offer.",
          },
          {
            icon: <CircleDollarSign className="w-7 h-7 text-blue-500" />,
            title: "7. Lending with Security",
            description:
              "Owners may choose to lend without exchange by requesting a security deposit. Once payment is done, the requester can proceed with OTP validation just like in swaps.",
          },
          {
            icon: <Star className="w-7 h-7 text-blue-500" />,
            title: "8. Ratings & Reviews",
            description:
              "After each exchange, both users can rate each other to help build community trust and maintain quality interactions.",
          },
        ].map(({ icon, title, description }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-3">
              {icon} {title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              {description}
            </p>
          </motion.div>
        ))}
      </section>

      {/* ===== CTA ===== */}
      <footer className="max-w-5xl mx-auto px-4 pt-16 text-center flex flex-col justify-center items-center">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ready to start exchanging?
        </motion.h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-md mx-auto mb-6">
          Upload your first book or browse listings from fellow readers near you.
        </p>
        <Link to="/browse">
          <Button className="text-base px-6 py-4 flex items-center gap-2">
            Browse Books <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </footer>
    </div>
  );
}
