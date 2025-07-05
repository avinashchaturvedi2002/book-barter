import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (val) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(val)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError || !email) return;

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(data.message || "Password reset link sent. Redirecting...");
      setTimeout(() => navigate("/login", { state: { fromForgotPassword: true } }), 5000);
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-white">Forgot Password</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              We'll email you a link to reset it. ✉️
            </p>
          </div>

          {message && (
            <p className="text-center text-sm mb-4 text-blue-600 dark:text-blue-400">{message}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-white" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                 onChange={(e) => setEmail(e.target.value)}
  onBlur={(e) => validateEmail(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${
                  emailError ? "border-red-500" : "border-gray-300"
                } rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                placeholder="you@example.com"
              />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || emailError || !email}
              className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md text-white transition ${
                loading || emailError
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Login
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
}
