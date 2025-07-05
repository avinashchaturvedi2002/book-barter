import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CounterOfferModal from "../modals/CounterOfferModal";
import SuccessPopup from "../components/ui/success";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "./ErrorPage";
import ExchangeRequestCard from "../components/ui/exchangeRequestCard";
import PurchaseRequestCard from "../components/ui/purchaseRequestCard";

export default function IncomingRequests() {
  const [activeTab, setActiveTab] = useState("exchange");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [purchaseNotifications, setPurchaseNotifications] = useState([]);
  const navigate = useNavigate();
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterRequestId, setCounterRequestId] = useState(null);
  const [counterRequesterId, setCounterRequesterId] = useState(null);
  const [securityOfferSuccess, setSecurityOfferSuccess]=useState(false)
 const [securityAmount, setSecurityAmount]=useState("0");
 const {showLoader,hideLoader}=useLoading();
 const [error,setError]=useState();

  


  const handleCounterSuccess = (id) => {
    setIncomingRequests((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: "counter_pending" } : r))
    );
  };

  useEffect(() => {
    const getIncomingRequests = async () => {
      showLoader("Getting your incoming requests...")
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/incoming-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log(data);
        setIncomingRequests(data.exchangeRequests);
        setPurchaseNotifications(data.purchaseRequests);
      } catch (err) {
        setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
      }
      finally{
        hideLoader();
      }
    };
    getIncomingRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    showLoader("Updating request status...")
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const endpoint =
        newStatus === "accepted"
          ? `/api/exchange/accept-exchange/${id}`
          : `/api/exchange/reject-exchange/${id}`;
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setIncomingRequests((prev) =>
          prev.map((req) => (req._id === id ? { ...req, status: newStatus } : req))
        );
      } else {
        alert(data.message || "Failed to update");
      }
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    finally{
      hideLoader();
    }
  };

  const handlePurchaseStatus = async (id, newStatus) => {
  showLoader("Updating purchase status…");
  try {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    const endpoint =
      newStatus === "accepted"
        ? `/api/purchase/accept-purchase/${id}`
        : `/api/purchase/reject-purchase/${id}`;
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setPurchaseNotifications((prev) =>
      prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
    );
  } catch (err) {
    setError(
      err?.response?.data?.message || err?.message || "Something went wrong."
    );
  } finally {
    hideLoader();
  }
};


  const openChatWithUser = (otherUserId) => {
    navigate(`/chat/${otherUserId}`);
  };

  const renderTabs = () => (
    <div className="flex gap-4 mb-6">
      <button
        className={`px-4 py-2 rounded ${activeTab === "exchange" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        onClick={() => setActiveTab("exchange")}
      >
        Exchange Requests
      </button>
      <button
        className={`px-4 py-2 rounded ${activeTab === "purchase" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        onClick={() => setActiveTab("purchase")}
      >
        Purchase Notifications
      </button>
    </div>
  );

  const lendForSecurityMoney=async(id)=>{
    showLoader("You are so kind...")
    try{
      const token=sessionStorage.getItem("token")||localStorage.getItem("token");
      const res=await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/exchange/lend-security/${id}`,{
        method:"PUT",
        headers:{
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data=await res.json();
      setSecurityAmount(data.exchangeRequest.securityAmount)
      if(res.ok)
      {
        setIncomingRequests(prev=>prev.map(r=>r._id===id?{...r,status:"security_pending"}:r))
        setSecurityOfferSuccess(true);
      }
    }
    catch(err)
    {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    finally{
      hideLoader();
    }
  }

  if (error) return <ErrorPage message={error}/>

  return (
    <div>
      <div className="max-w-4xl mx-auto p-4 ">
        <h2 className="text-2xl font-semibold mb-2">Incoming Requests</h2>
        {renderTabs()}

        {activeTab === "exchange" && (
  <div className="grid gap-6">
    {incomingRequests.map((req) => (
      <ExchangeRequestCard
        key={req._id}
        req={req}
        onAccept={(id) => handleUpdateStatus(id, "accepted")}
        onReject={(id) => handleUpdateStatus(id, "Rejected")}
        onCounter={(requestId, requesterId) => {
          setCounterRequestId(requestId);
          setCounterRequesterId(requesterId);
          setCounterOpen(true);
        }}
        onLendSecurity={(id) => lendForSecurityMoney(id)}
        onChat={(userId) => openChatWithUser(userId)}
      />
    ))}
  </div>
)}


       {activeTab === "purchase" && (
  <div className="grid gap-6">
    {purchaseNotifications.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400">
        You haven't received any purchase requests yet.
      </p>
    ) : (
      purchaseNotifications.map((req) => (
        <PurchaseRequestCard
          key={req._id}
          req={req}
          onAccept={(id) => handlePurchaseStatus(id, "accepted")}
          onReject={(id) => handlePurchaseStatus(id, "rejected")}
          onChat={(userId) => openChatWithUser(userId)}
        />
      ))
    )}
  </div>
)}


      </div>

      <CounterOfferModal
        isOpen={counterOpen}
        onClose={() => setCounterOpen(false)}
        requesterId={counterRequesterId}
        exchangeId={counterRequestId}
        onCounterSuccess={handleCounterSuccess}
      />
      <SuccessPopup message={`Sent a security offer of ${securityAmount}`} show={securityOfferSuccess} onClose={()=>{setSecurityOfferSuccess(false)}} />
    </div>
  );
}
