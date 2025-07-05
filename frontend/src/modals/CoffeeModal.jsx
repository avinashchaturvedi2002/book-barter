import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import ThankYouModal from "./ThankYouModal";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "../pages/ErrorPage";

export default function BuyCoffeeModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const {showLoader,hideLoader}=useLoading();
  const [error,setError]=useState(null);

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 1) {
      alert("Please enter a valid amount (minimum ₹1)");
      return;
    }
    showLoader("Opening Razorpay for you...")
    try{
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/coffee-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    const options = {
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "Support BookBarter 💖",
      description: "Thanks for the coffee!",
      order_id: data.orderId,
      handler: async function (response) {
        const verifyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/verify-coffee`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) return alert("Payment failed");
        setShowThankYou(true);
        onClose();
      },
      prefill: {
        name: "",
        email: "",
      },
      theme: {
        color: "#fbbf24", // nice yellow
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    }
  catch(err)
  {
    setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
  }
  finally
  {
    hideLoader();
  }
}

if (error) return <ErrorPage message={error}/>

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-xl font-bold">Buy Me a Coffee ☕</Dialog.Title>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Enter the amount you'd like to contribute:</p>
          <input
            type="number"
            min="10"
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 50"
          />
          <button
            onClick={handlePayment}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded"
          >
            Pay Now
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
    <ThankYouModal isOpen={showThankYou} onClose={() => { setShowThankYou(false); onClose(); }} />

    </>
    
  );

}
