import { useEffect, useState } from "react";
import BookCarousel3D from "../components/effects/BookCarousel3D";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "../pages/ErrorPage";

export default function CounterOfferModal({ isOpen, onClose, requesterId, exchangeId, onCounterSuccess }) {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState(null);
  const {showLoader,hideLoader}=useLoading();
  const [error,setError]=useState();
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  // services/exchange.js
 const sendCounterOffer = async (exchangeId, newBookId, token) => {
  
  try{
    const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/exchange/counter/${exchangeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newOfferedBookId: newBookId }),
    }
  );
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();     
  }
    catch(err)
    {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    finally{
      
    }
};


  useEffect(() => {
    const fetchRequesterBook=async()=>{
      if (!isOpen) return;
      showLoader("Getting all available books of requester...")
      try{
        const res=await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/getUserBooks/${requesterId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      const data=await res.json();
      console.log(data);
       setBooks(data.user.books);
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
    
    fetchRequesterBook();      
  }, [isOpen, requesterId]);

  const handleSend = async () => {
    showLoader("Sending counter offer...")
    try {
      await sendCounterOffer(exchangeId, selected, token);
      onCounterSuccess(exchangeId);      // lift state
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    finally{
      hideLoader();
    }
  };

  if (!isOpen) return null;

  if (error) return <ErrorPage message={error}/>
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Pick another book to propose</h2>
        <BookCarousel3D
  books={books}
  selectedId={selected}
  onSelect={setSelected}
/>


        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-1.5 rounded bg-gray-300">Cancel</button>
          <button disabled={!selected} onClick={handleSend} className="px-4 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50">
            Send Counter-Offer
          </button>
        </div>
      </div>
    </div>
  );
}
