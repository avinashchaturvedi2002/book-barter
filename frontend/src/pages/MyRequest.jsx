import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import OTPValidationModal from "../modals/OTPValidationModal";
import SuccessPopup from "../components/ui/success";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "./ErrorPage";
import MyExchangeRequestCard from "../components/ui/myExchangeRequestCard";
import MyPurchaseCard from "../components/ui/myPurchaseCard";



export default function MyRequests() {
  const [activeTab, setActiveTab] = useState("exchange");
  const [requests, setRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const { showLoader, hideLoader } = useLoading();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [cancelMsg, setCancelMsg] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : { name: "", email: "" };
  const [showSuccess,setShowSuccess]=useState(false)

  useEffect(() => {
    (async () => {
      showLoader("Getting your request status...");
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/get-my-request`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const visibleStatuses = ["pending", "accepted", "counter_pending", "counter_offer", "rejected", "security_pending", "security_paid"];
        setRequests(
          (data.exchangeRequests || []).filter((r) =>
            visibleStatuses.includes(r.status?.toLowerCase())
          )
        );
        setPurchases(data.purchaseRequests || []);
      } catch (err) {
        setError(err?.message || "Something went wrong.");
      } finally {
        hideLoader();
      }
    })();
  }, []);

  const openChatWithUser = (otherUserId) => navigate(`/chat/${otherUserId}`);

  const handleDismiss = async (exchangeId) => {
    showLoader("Dismissing this request...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/dismiss/${exchangeId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRequests((prev) => prev.filter((r) => r._id !== exchangeId));
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const cancelRequest = async (requestId) => {
    showLoader("Cancelling this request...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/cancel-request/${requestId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setCancelMsg(true);
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const openOtpModal = async (exchangeId) => {
    showLoader("Sending OTP to lender's email...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/initiate-otp/${exchangeId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSelectedExchangeId(exchangeId);
      setShowOtpModal(true);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const handleValidateOtp = async (exchangeId, otp) => {
    showLoader("Validating OTP...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/validate-otp/${exchangeId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowSuccess(true);
      setShowOtpModal(false);
      setRequests((prev) =>
        prev.map((r) =>
          r._id === exchangeId ? { ...r, status: "completed" } : r
        )
      );
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const paySecurity = async (exchangeId) => {
    showLoader("Opening Razorpay...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/security-order/${exchangeId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Book Barter",
        description: "Security Money",
        order_id: data.orderId,
        handler: async function (response) {
          showLoader("Verifying Payment...");
          try {
            const verifyRes = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/exchange/verify-security-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  exchangeId,
                }),
              }
            );
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message);
            setRequests((prev) =>
              prev.map((r) =>
                r._id === exchangeId ? { ...r, status: "security_paid" } : r
              )
            );
          } catch (err) {
            setError(err?.message || "Something went wrong.");
          } finally {
            hideLoader();
          }
        },
        prefill: {
          name: user.firstName + " " + user.lastName,
          email: user.email,
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const acceptRequest = async (exchangeId) => {
    showLoader("Accepting exchange...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/accept-exchange/${exchangeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRequests((prev) =>
        prev.map((r) =>
          r._id === exchangeId ? { ...r, status: "accepted" } : r
        )
      );
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const cancelPurchase = async (purchaseId) => {
    showLoader("Cancelling purchase request…");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/purchase/cancel/${purchaseId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message);
      }
      setCancelMsg(true);
      setPurchases((prev) => prev.filter((p) => p._id !== purchaseId));
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const initiatePurchaseOtp = async (purchaseId) => {
    showLoader("Sending OTP to seller’s email…");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/purchase/initiate-otp/${purchaseId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSelectedPurchaseId(purchaseId);
      setShowOtpModal(true);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };

  const validatePurchaseOtp = async (purchaseId, otp) => {
    showLoader("Validating OTP…");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/purchase/validate-otp/${purchaseId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShowOtpModal(false);
      setPurchases((prev) =>
        prev.map((p) =>
          p._id === purchaseId ? { ...p, status: "completed" } : p
        )
      );
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      hideLoader();
    }
  };


  const renderTabs = () => (
    <div className="flex gap-4 mb-6">
      {[
        { id: "exchange", label: "Exchange Requests" },
        { id: "purchase", label: "Purchase Requests" },
      ].map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            activeTab === id
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-zinc-700 dark:text-gray-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  if (error) return <ErrorPage message={error} />;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">My Requests</h2>
      {renderTabs()}

      {activeTab === "exchange" && (
  <div className="space-y-4">
    {requests.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400">
        You haven't made any exchange requests yet.
      </p>
    ) : (
      requests.map((req) => (
        <MyExchangeRequestCard
          key={req._id}
          req={req}
          onCancel={cancelRequest}            
          onChat={openChatWithUser}           
          onPaySecurity={paySecurity}         
          onValidateOtp={openOtpModal}        
          onAccept={acceptRequest}            
          onDismiss={handleDismiss}           
        />
      ))
    )}
  </div>
)}


      {activeTab === "purchase" && (
  <div className="space-y-4">
    {purchases.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400">
        You haven't made any purchase requests yet.
      </p>
    ) : (
      purchases.map((pr) => (
        <MyPurchaseCard
          key={pr._id}
          request={pr}
          onChat={openChatWithUser}
          onCancel={cancelPurchase}
          onValidateOtp={initiatePurchaseOtp}
        />
      ))
    )}
  </div>
)}

      <SuccessPopup message="Request Cancelled" show={cancelMsg} onClose={() => setCancelMsg(false)} />

      <OTPValidationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onValidate={activeTab==="exchange"?handleValidateOtp:validatePurchaseOtp}
        exchangeId={activeTab === "exchange" ? selectedExchangeId : undefined}
        purchaseId={activeTab === "purchase" ? selectedPurchaseId : undefined}
      />
      <SuccessPopup show={showSuccess} message={"Book Swapped"} onClose={()=>{setShowSuccess(false)}}/>
    </div>
    
  );
}
