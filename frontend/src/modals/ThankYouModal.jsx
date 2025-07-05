import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function ThankYouModal({ isOpen, onClose }) {
  // Auto-close after 3 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center text-gray-700 dark:text-gray-200 relative z-10"
          >
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <Dialog.Title className="text-xl font-semibold">
              Thank you! ☕
            </Dialog.Title>
            <p className="text-sm mt-2">
              Your support keeps BookBarter running.
            </p>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
