import { motion } from "framer-motion";

export default function LoadingSpinner({ message = "Loading...", fullscreen = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 ${
        fullscreen ? "fixed inset-0 z-50 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70" : ""
      }`}
      role="status"
    >
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 animate-pulse max-w-s">
        {message} <br />
        <span>My budget was 'free trial'.</span> Buy me a coffee for better speed 😉
      </p>
    </div>
  );
}
