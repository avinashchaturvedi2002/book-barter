import ErrorPage from "../pages/ErrorPage";
import React, { useState } from "react";

export default function OTPValidationModal({ isOpen, onClose, onValidate, exchangeId, purchaseId }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setError(null);
    onValidate(exchangeId||purchaseId, otp);
  };

  if (!isOpen) return null;

  if(error) return <ErrorPage message={error}/>

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-4">Validate Book Exchange</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Ask the lender for the OTP they received via email.
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          Confirm Exchange
        </button>
      </div>
    </div>
  );
}
