import { useEffect, useState } from "react";
import CustomDropdown from "../components/ui/customdropdown";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "../pages/ErrorPage";
import { useNavigate } from "react-router-dom";

export default function ExchangeModal({ selectedBook, setSelectedBook, onSuccess }) {
  const [myBooks, setMyBooks] = useState([]);
  const [offeredBookId, setOfferedBookId] = useState("");
  const [borrowDuration, setBorrowDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showLoader, hideLoader } = useLoading();
  const [error, setError] = useState(null);
  const [showNoBooksPopup, setShowNoBooksPopup] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const navigate = useNavigate();

  const durationOptions = [
    { id: 3, title: "3 days" },
    { id: 7, title: "7 days" },
    { id: 14, title: "14 days" },
    { id: 30, title: "30 days" },
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      showLoader("fetching your available books...");
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/mybooks`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setMyBooks(data.books || []);

        if (!data.books || data.books.filter((b) => b.available).length === 0) {
          setShowNoBooksPopup(true);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Something went wrong.");
      } finally {
        hideLoader();
      }
    };

    fetchBooks();
  }, []);

  const handleRequestSubmit = async () => {
    if (!offeredBookId) {
      toast.warn("📚 Please select a book to offer!");
      return;
    }

    if (!borrowDuration) {
      toast.warn("📅 Please select the borrowing duration!");
      return;
    }

    const offeredBook = myBooks.find(
      (book) => (book._id || book.id.toString()) === offeredBookId
    );
    if (!offeredBook) {
      toast.error("❌ Selected book not found.");
      return;
    }

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    showLoader("sending your exchange request...");
    try {
      setIsSubmitting(true);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/books/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestedBookId: selectedBook._id,
          offeredBookId: offeredBook._id,
          durationInDays: borrowDuration,
        }),
      });

      const data = await res.json();

      if (res.ok) {
  toast.success("✅ Exchange request sent successfully!");
  setHasSubmitted(true); // 🔒 Prevent further clicks

  setTimeout(() => {
    setSelectedBook(null);
  }, 3000);

  if (onSuccess) {
    onSuccess();
  }

}
 else {
        toast.error(data.message || "❌ Error sending request.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong.");
    } finally {
      hideLoader();
      setIsSubmitting(false);
    }
  };

  if (error) return <ErrorPage message={error} />;

  if (showNoBooksPopup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-4">⚠️ No Available Books</h3>
          <p className="text-gray-700 mb-4">
            You don't have any available books to offer in exchange.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
          >
            ➕ Add a Book
          </button>
          <div className="mt-4">
            <button
              onClick={() => setSelectedBook(null)}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
        <h3 className="text-xl font-bold mb-4 text-center text-blue-700">
          📖 Request to Borrow: <span className="text-black">{selectedBook.title}</span>
        </h3>

        <p className="mb-2 text-gray-700">Choose one of your books to offer:</p>

        <CustomDropdown
          options={myBooks
            .filter((b) => b.available)
            .map((b) => ({
              id: b._id || b.id.toString(),
              title: b.title,
            }))}
          value={offeredBookId}
          onChange={(selectedId) => setOfferedBookId(selectedId)}
        />

        <div className="mt-4">
          <p className="mb-2 text-gray-700">Select borrowing duration:</p>
          <CustomDropdown
            options={durationOptions}
            value={borrowDuration}
            onChange={(value) => setBorrowDuration(value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setSelectedBook(null)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-full transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRequestSubmit}
            disabled={isSubmitting || hasSubmitted}
            className={`px-4 py-2 rounded-full text-white transition ${
              isSubmitting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Sending..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
