import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({ message = "Something went wrong." }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-6 sm:px-8 text-center">
      <AlertTriangle className="w-20 h-20 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        Oops!
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {message}
      </p>
      <button
  onClick={() => window.location.reload()}
  className="mt-2 px-6 py-2 border border-blue-600 text-blue-600 font-medium rounded hover:bg-blue-50 transition"
>
  Retry
</button>
<br />
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
      >
        Back to Home
      </button>
    </div>
  );
}
