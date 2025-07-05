import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useLoading } from "../context/LoadingContext";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoading();

  const [formData, setFormData] = useState({
    name: "",
    lname: "",
    username: "",
    email: "",
    password: "",
    cpassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [errors, setErrors] = useState({
  name: "",
  lname: "",
  username: "",
  email: "",
  password: "",
  cpassword: "",
});
const namePattern = /^[a-zA-Z\s'-]{1,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((s) => ({ ...s, [name]: value }));
  setErrors((s) => ({ ...s, [name]: validateField(name, value) }));
  // live‑update matching confirm password too
  if (name === "password") {
    setErrors((s) => ({
      ...s,
      cpassword: validateField("cpassword", formData.cpassword),
    }));
  }
};

const isFormValid =
  Object.values(errors).every((e) => e === "") &&
  Object.values(formData).every((v) => v !== "");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const { name, lname, username, email, password, cpassword } = formData;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    

    if (!namePattern.test(name) || !namePattern.test(lname)) {
      return setError("Please enter valid names (letters only, no emojis or numbers).");
    }

    if (!usernamePattern.test(username)) {
      return setError("Username must be 3–20 characters with only letters, numbers, or underscores.");
    }

    if (!emailPattern.test(email)) {
      return setError("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (password !== cpassword) {
      return setError("Passwords do not match.");
    }

    const payload = {
      name: `${name.trim()} ${lname.trim()}`,
      username,
      email,
      password,
    };

    showLoader("Creating your account...");
    try {
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Registration failed");

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const validateField = (field, value) => {
  switch (field) {
    case "name":
    case "lname":
      return namePattern.test(value) ? "" : "Letters only";
    case "username":
      return usernamePattern.test(value)
        ? ""
        : "3–20 chars, letters/numbers/_";
    case "email":
      return emailPattern.test(value) ? "" : "Invalid email";
    case "password":
      return value.length >= 6 ? "" : "Min 6 chars";
    case "cpassword":
      return value === formData.password ? "" : "Passwords differ";
    default:
      return "";
  }
};


  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c === 1) {
            clearInterval(timer);
            navigate("/login");
          }
          return c - 1;
        });
      }, 1000);
    }
  }, [success, navigate]);

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 md:p-12 relative"
        >
          <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-white mb-2">
            Join Book Barter 📚
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Share, swap, lend, and discover a whole world of books.
          </p>

          <form onSubmit={handleRegister}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[ 
                { label: "First Name", name: "name" },
                { label: "Last Name", name: "lname" },
                { label: "Username", name: "username" },
                { label: "Email", name: "email", type: "email" },
                { label: "Password", name: "password", type: "password" },
                { label: "Confirm Password", name: "cpassword", type: "password" },
              ].map(({ label, name, type = "text" }) => (
                <div key={name}>
  <label className="block text-sm font-semibold mb-1 dark:text-white">
    {label}
  </label>
  <input
    type={type}
    name={name}
    value={formData[name]}
    onChange={handleChange}
    required
    className={`w-full px-4 py-2 rounded-md border ${
      errors[name]
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300 dark:border-gray-600"
    } dark:bg-gray-700 dark:text-white`}
  />
  {errors[name] && (
    <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
  )}
</div>

              ))}
            </div>

            {error && (
              <p className="text-red-500 text-center text-sm mt-4 font-medium">{error}</p>
            )}

            <div className="flex justify-center mt-8">
              <button
  type="submit"
  disabled={!isFormValid}
  className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg shadow-md transition
    ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
>
  Create Account
</button>

            </div>

            <p className="text-sm text-center mt-6 dark:text-slate-300">
              Already have an account?
              <Link
                to="/login"
                className="text-blue-600 font-medium hover:underline ml-1"
              >
                Login here
              </Link>
            </p>
          </form>

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col justify-center items-center rounded-2xl z-50"
            >
              <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
              <h2 className="text-xl font-bold dark:text-white mb-2">
                Successfully registered!
              </h2>
              <p className="text-center text-sm dark:text-white">
                Redirecting to login in{" "}
                <span className="font-semibold">{countdown}</span> seconds…
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
