import { motion } from "framer-motion";

export default function LoadingSpinner({ message = "Loading...", fullscreen = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullscreen ? "fixed inset-0 z-50 backdrop-blur-sm" : ""
      }`}
    >
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-t-transparent border-blue-500 animate-spin"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 animate-pulse">{message} My budget was 'free trial'. Buy me a coffee for better speed😉</p>
    </div>
  );
}
