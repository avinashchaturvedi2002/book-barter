import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/ui/Header";
import BookCard from "../components/ui/bookcard";
import CustomDropdown from "../components/ui/customdropdown";
import ExchangeModal from "../modals/ExchangeModal";
import PurchaseModal from "../modals/PurchaseModal";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "./ErrorPage";
import LoginPromptModal from "../modals/LoginPromptModal";

export default function ExploreBooks() {
   const [books, setBooks] = useState([]);
  const [allAuthors, setAllAuthors]     = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allCities, setAllCities]       = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [requestedBookIds, setRequestedBookIds] = useState([]);
  const [showPurchaseConfirmation, setShowPurchaseConfirmation] = useState(false);
  const [radius, setRadius] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const { showLoader, hideLoader } = useLoading();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [error,setError]=useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchRequested = async () => {
    showLoader();
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/requestedbooks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRequestedBookIds(data.requestedBookIds);
      } catch (err) {
        setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
      }
      finally{
        hideLoader();
      }
    };

  const sendPurchaseRequest=async (book)=>{
    showLoader("Sending Purchase Request...")
    try{
      console.log(book);
      const res= await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/purchase/send-request`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({bookId:book._id})
      })

      if(res.ok)
      {
        setShowPurchaseConfirmation(true);
      }
    }
    catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    } finally {
      hideLoader();
    }
  }

useEffect(()=>{
  fetchRequested();
},[])
  
useEffect(() => {
  const fetchBooks = async () => {
    showLoader("Getting the Books...")
    try {
      const query = new URLSearchParams();

      if (filterType) query.append("type", filterType === "buy" ? "sell" : "lend");
      if (filterAuthor) query.append("author", filterAuthor);
      if (filterCategory) query.append("category", filterCategory);
      if (searchTerm) query.append("title", searchTerm);
      if (filterCity) query.append("city", filterCity);
      if (radius && userLocation) {
        query.append("radius", radius);
        query.append("lat", userLocation.latitude);
        query.append("lng", userLocation.longitude);
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/explore?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log(data);
      setBooks(data);
      if (
   !filterType && !filterAuthor && !filterCategory &&
   !filterCity && !searchTerm && !radius
  ) {
    setAllAuthors([...new Set(data.map(b => b.author))]);
    setAllCategories([...new Set(data.map(b => b.category))]);
    setAllCities([...new Set(data.map(b => b.city).filter(Boolean))]);
  }
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    } finally {
      hideLoader();
    }
  };

  if (userLocation || !radius) {
    fetchBooks(); // only run when we have coordinates (or if no radius filter)
  }
}, [filterType, filterAuthor, filterCategory, searchTerm, filterCity, radius, userLocation]);


  

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => console.error("Failed to get location", err)
      );
    }
  }, []);


  const handleActionClick = async (book) => {
    showLoader();
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.valid) {
        setShowLoginPrompt(true);
        return;
      }
    } catch (err) {
      console.warn("Token verification failed:", err.message);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setShowLoginPrompt(true);
      return;
    }
    finally{
      hideLoader();
    }

    setSelectedBook(book);
    if (book.mode === "lend") return;
    else
    sendPurchaseRequest(book);

  };



  const authorOptions = [{ id: "", title: "-- All Authors --" }].concat(
   allAuthors.map(a => ({ id: a, title: a }))
 );

   const categoryOptions = [{ id: "", title: "-- All Categories --" }].concat(
  allCategories.map(c => ({ id: c, title: c }))
 );

  const cityOptions = [{ id: "", title: "-- All Cities --" }].concat(
   allCities.map(c => ({ id: c, title: c }))
 );


  const filteredBooks = books; 

  if(error) return <ErrorPage message={error}/>

  return (
    <div className="bg-gradient-to-b from-white to-blue-50">
      <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Explore Books</h2>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
          <div className="flex-1">
            <label className="p-2 block font-semibold text-gray-700">Looking for?</label>
            <CustomDropdown
              options={[
                { id: "", title: "-- Select --" },
                { id: "buy", title: "Buy Book" },
                { id: "exchange", title: "Exchange Book" },
              ]}
              value={filterType}
              onChange={setFilterType}
            />
          </div>
          <div className="flex-1">
            <label className="p-2 block font-semibold text-gray-700">Author</label>
            <CustomDropdown
              options={authorOptions}
              value={filterAuthor}
              onChange={setFilterAuthor}
            />
          </div>
          <div className="flex-1">
            <label className="p-2 block font-semibold text-gray-700">Category</label>
            <CustomDropdown
              options={categoryOptions}
              value={filterCategory}
              onChange={setFilterCategory}
            />
          </div>
          <div className="flex-1">
  <label className="p-2 block font-semibold text-gray-700">City</label>
  <CustomDropdown
    options={cityOptions}
    value={filterCity}
    onChange={setFilterCity}
  />
</div>

          <div className="flex-1">
            <label className="p-2 block font-semibold text-gray-700">
              Radius: <span className="text-blue-600">{radius} km</span>
            </label>
            <input
              type="range"
              min={1}
              max={500}
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by book title..."
          className="w-full rounded-full border px-5 py-3 shadow-sm mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onActionClick={handleActionClick}
                isRequested={requestedBookIds?.includes(book._id)}
              />
            ))}
          </div>
        
      </div>

      {/* Exchange Modal */}
      {selectedBook && selectedBook.mode === "lend" && (
        <ExchangeModal selectedBook={selectedBook} setSelectedBook={setSelectedBook} onSuccess={() => {
      setRequestedBookIds((prev) => [...prev, selectedBook._id]);
    }}/>
      )}

      {/* Purchase Modal */}
      {showPurchaseConfirmation && selectedBook && (
  <PurchaseModal
    selectedBook={selectedBook}
    onClose={() => {
      setShowPurchaseConfirmation(false);
      setSelectedBook(null);
    }}
  />
)}


      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-out">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
            {selectedBook?.mode === "lend"
              ? "✅ Exchange request submitted successfully!"
              : "✅ Purchase notification sent successfully!"}
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginPrompt && (
        <LoginPromptModal onClose={()=>{setShowLoginPrompt(false)}}/>
      )}
    </div>
  );
}
