import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OTPValidationModal from "../../modals/OTPValidationModal";
import { useLoading } from "../../context/LoadingContext";
import ErrorPage from "../../pages/ErrorPage";
import SuccessPopup from "../ui/success"; 



export default function BorrowedBooks() {
  const [borrowed, setBorrowed] = useState([]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState("");
  const {showLoader,hideLoader}=useLoading();
  const [error,setError]=useState(null)
  const [showSuccess,setShowSuccess]=useState(false)

  /*────────────────── Fetch data ──────────────────*/
  useEffect(() => {
    (async () => {
      showLoader("fetching your borrowed books...")
      try {
        
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/getMyBorrowedBooks`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        console.log(data);
       setBorrowed([...data.borrowedBooks,...data.borrowedOnSecurity]);
        console.log(borrowed);
      } catch (err) {
        setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
      } finally {
        hideLoader();
      }
    })();
  }, []);

  /*───────────────── OTP helpers ─────────────────*/
  const openOtpModal = async (exchangeId, role) => {
    if (role !== "borrower") return; // safety guard
    showLoader("Sending return otp to the owner...")
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/initiate-return-otp/${exchangeId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSelectedExchangeId(exchangeId);
      hideLoader();
      setShowOtpModal(true);
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
  };

  const handleValidateOtp = async (exchangeId, otp) => {
    showLoader("validating otp...")
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/exchange/validate-return-otp/${exchangeId}`,
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
      
    } catch (err) {
      alert(err.message || "OTP validation failed.");
    }
    finally{
      hideLoader();
    }
  };

  if(error) return <ErrorPage message={error}/>
  /*──────────────────── Render ───────────────────*/
  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">

      {borrowed.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No books currently borrowed.
        </p>
      )}

      { borrowed.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {borrowed.map((ex) => {
            const isBorrower = ex.role === "borrower";
            const daysLeft = ex.returnBy
              ? Math.ceil(
                  (new Date(ex.returnBy).getTime() - Date.now()) / 86_400_000
                )
              : null;

            return (
              <div
                key={ex.exchangeId}
                className="overflow-hidden rounded-2xl shadow-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col"
              >
                {/*─ Cover image ─*/}
                <div className="relative">
                  <img
                    src={ex.book.imageUrl}
                    alt={ex.book.title}
                    className="w-full h-56 object-contain bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-700 dark:to-zinc-800"
                  />

                  {/* Role badge */}
                  <span
                    className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm text-white tracking-wide ${
                      isBorrower ? "bg-blue-600" : "bg-amber-600"
                    }`}
                  >
                    {isBorrower ? "Borrower" : "Lender"}
                  </span>

                  {/* Days left badge */}
                  {daysLeft !== null && (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm">
                      {daysLeft > 0 ? `${daysLeft}d left` : "Due!"}
                    </span>
                  )}
                </div>

                {/*─ Main details ─*/}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {ex.book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    by {ex.book.author}
                  </p>

                  {/* Exchange info */}
                  {ex.exchangedFor ?(
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <img
                        src={ex.exchangedFor.imageUrl}
                        alt={ex.exchangedFor.title}
                        className="w-8 h-10 object-contain rounded border"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Exchanged for:</span>{" "}
                        {ex.exchangedFor.title} by {ex.exchangedFor.author}
                      </span>
                    </div>
                  ):(<>
                        <span className="text-gray-700 dark:text-gray-300 mt-5">You have borrowed this on security money
                      </span></>)}

                  <hr className="my-2 border-zinc-200 dark:border-zinc-700" />
                  <Link to={`/profile/${ex.owner._id}`}>
                    <p className="text-sm  text-blue-600 dark:text-gray-300 underline">
                    <span className="font-medium">Original owner:</span> {" "}
                    {ex.owner?.name ?? "—"}
                  </p>
                  </Link>
                  

                  {ex.returnBy && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Return by:</span> {" "}
                      {new Date(ex.returnBy).toLocaleDateString()}
                    </p>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Action */}
                  {isBorrower && (
                    <button
                      onClick={() => openOtpModal(ex.exchangeId, ex.role)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Return Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OTP modal */}
      <OTPValidationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onValidate={handleValidateOtp}
        exchangeId={selectedExchangeId}
      />

      <SuccessPopup
  message="✅ Return completed successfully!"
  show={showSuccess}
  onClose={() => setShowSuccess(false)}
/>
    </div>
  );
}
