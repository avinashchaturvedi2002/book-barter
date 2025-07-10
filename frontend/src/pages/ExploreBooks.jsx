import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/ui/bookcard";
import CustomDropdown from "../components/ui/customdropdown";
import ExchangeModal from "../modals/ExchangeModal";
import PurchaseModal from "../modals/PurchaseModal";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "./ErrorPage";
import LoginPromptModal from "../modals/LoginPromptModal";
import { useDebounce } from "../hooks/useDebounce";
import CityAutocompleteInput from "../components/util/CityAutoComplete";
import { Search } from "lucide-react";
import { useInView } from "react-intersection-observer";



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
  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedRadius = useDebounce(radius, 500);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loadingBooks,setLoadingBooks]=useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });



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
        setRequestedBookIds((prev) => [...prev, book._id]);
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

  const fetchBooks = async () => {
  if (!hasMore && page !== 1) return;
  setLoadingBooks(true);
  showLoader("Loading books...");

  try {
    const query = new URLSearchParams();
    if (filterType) query.append("type", filterType === "buy" ? "sell" : "lend");
    if (filterAuthor) query.append("author", filterAuthor);
    if (filterCategory) query.append("category", filterCategory);
    if (debouncedSearch) query.append("title", debouncedSearch);
    if (filterCity) query.append("city", filterCity);
    if (debouncedRadius && userLocation) {
      query.append("radius", debouncedRadius);
      query.append("lat", userLocation.latitude);
      query.append("lng", userLocation.longitude);
    }

    query.append("page", page);
    query.append("limit", 9);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/books/explore?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    // if filters are untouched, update options
    if (page === 1) {
      if (!filterType && !filterAuthor && !filterCategory && !filterCity && !searchTerm && !radius) {
        setAllAuthors([...new Set(data.books.map(b => b.author))]);
        setAllCategories([...new Set(data.books.map(b => b.category))]);
        setAllCities([...new Set(data.books.map(b => b.city).filter(Boolean))]);
      }
    }

    setBooks(prev => page === 1 ? data.books : [...prev, ...data.books]);
    setHasMore(data.hasMore);
  } catch (err) {
    setError(err?.message || "Failed to fetch books.");
  } finally {
    hideLoader();
    setLoadingBooks(false);
  }
};

useEffect(()=>{
  fetchRequested();
},[])
  
useEffect(() => {
  if (userLocation || !debouncedRadius) {
    fetchBooks();
  }
}, [page]);

useEffect(() => {
  if (inView && hasMore && !loadingBooks) {
    setPage(prev => prev + 1);
  }
}, [inView]);

useEffect(() => {
  setPage(1);
  setHasMore(true);
}, [filterType, filterAuthor, filterCategory, debouncedSearch, filterCity, debouncedRadius, userLocation]);


const onSelectCity = (option) => {
  if (!option || typeof option.label !== "string") {
    setFilterCity("");
    return;
  }

  const cityOnly = option.label.split(",")[0].trim();
  if (filterCity !== cityOnly) {
    setFilterCity(cityOnly);
  } else {
    setFilterCity("");
    setTimeout(() => setFilterCity(cityOnly), 0); // trigger re-fetch even if same
  }
};


  

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
        <div className="relative mb-4">
  <input
    type="text"
    placeholder="Search by book title..."
    className="w-full rounded-full border outline-none border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ease-in-out px-5 py-3 pr-12 shadow-sm text-base md:text-lg dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <Search
    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
    size={20}
  />
</div>


        {/* Toggle Button for Mobile */}
<div className="md:hidden mb-4">
  <button
    onClick={() => setShowMobileFilters((prev) => !prev)}
    className="w-full bg-blue-600 text-white py-2 px-4 rounded-full shadow"
  >
    {showMobileFilters ? "Hide Filters" : "Show Filters"}
  </button>
</div>

      

        {/* Filters */}
        <div className="hidden md:flex mb-6  flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
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
  <CityAutocompleteInput onSelect={onSelectCity} />
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

        
        

              {showMobileFilters && (
  <div className="md:hidden mb-6 space-y-4">
    <div>
      <label className="block font-semibold text-gray-700">Looking for?</label>
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
    <div>
      <label className="block font-semibold text-gray-700">Author</label>
      <CustomDropdown options={authorOptions} value={filterAuthor} onChange={setFilterAuthor} />
    </div>
    <div>
      <label className="block font-semibold text-gray-700">Category</label>
      <CustomDropdown options={categoryOptions} value={filterCategory} onChange={setFilterCategory} />
    </div>
    <div>
      <label className="block font-semibold text-gray-700">City</label>
      <CityAutocompleteInput onSelect={onSelectCity} />
    </div>
    <div>
      <label className="block font-semibold text-gray-700">
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
)}

         {!loadingBooks && filteredBooks.length === 0 && (
  <div className="flex flex-col items-center justify-center text-center mt-16 mb-32 px-4">
    <img
      src="/image.png" 
      alt="No books found"
      className="w-48 h-48 mb-6 opacity-80"
    />
    <h3 className="text-2xl font-bold text-gray-700 mb-2">
      No Books Found
    </h3>
    <p className="text-gray-500 mb-4 max-w-md">
      We couldn’t find any books that match your filters.
      {filterCity && (
        <> Try adjusting your city or expanding the radius.</>
      )}
    </p>
    <button
      onClick={() => {
        setFilterCity("");
        setFilterType("");
        setFilterAuthor("");
        setFilterCategory("");
        setRadius("");
        setSearchTerm("");
      }}
      className="px-6 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
    >
      Reset Filters
    </button>
  </div>
)}
        
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            


            {filteredBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onActionClick={handleActionClick}
                isRequested={requestedBookIds?.includes(book._id)}
              />
            ))}

            <div ref={sentinelRef}></div>
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
