import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPromptModal({ onClose }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">🔒 Login Required</h2>
        <p className="text-gray-600 mb-5">
          You must be logged in to perform this action.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
