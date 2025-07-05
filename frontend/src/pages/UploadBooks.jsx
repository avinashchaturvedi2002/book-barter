import { useState, useRef } from "react";
import { UploadCloud, Camera, LocateIcon } from "lucide-react";
import BookAutocompleteInput from "../components/util/autocomplete";
import CityAutocompleteInput from "../components/util/CityAutoComplete";

import ErrorPage from "./ErrorPage";

export default function UploadBook() {
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    category: "",
    mode: "lend",
    description: "",
    securityMoney: "",
    sellingPrice: "",
    location: null,
    city: "",
  });

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error,setError]=useState(null);

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookSelect = (book) => {
    setBookData((prev) => ({
      ...prev,
      title: book.title,
      author: book.authors,
      category: book.categories,
    }));
  };

  const extractCity = (addr = {}) =>
    addr.city ||
    addr.town ||
    addr.village ||
    addr.hamlet ||
    addr.municipality ||
    addr.suburb ||
    addr.county ||
    "";

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Step 1: update coordinates first
          setBookData((prev) => ({
            ...prev,
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          }));

          // Step 2: fetch city
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            const cityName = extractCity(data?.address);

            setBookData((prev) => ({
              ...prev,
              city: cityName,
            }));
          } catch (err) {
            setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          alert("Location access denied or unavailable.");
          console.error(error);
          setLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const geocodeCity = async (city) => {
    if (!city) {
      setBookData((prev) => ({ ...prev, location: null }));
      return;
    }
    setLoadingLocation(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        setBookData((prev) => ({
          ...prev,
          location: {
            type: "Point",
            coordinates: [lon, lat],
          },
        }));
      } else {
        alert("Could not find location for the entered city.");
        setBookData((prev) => ({ ...prev, location: null }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
      setBookData((prev) => ({ ...prev, location: null }));
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCityBlur = () => {
    geocodeCity(bookData.city.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookData.location) {
      alert("Location (coordinates) are required.");
      return;
    }

    if (!bookData.city) {
      alert("City name is required. Please wait or fill it manually.");
      return;
    }

    if (!image) {
      alert("Please select an image.");
      return;
    }

    if (!token) {
      alert("Please log in first.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    for (const key in bookData) {
      if (key === "location") {
        formData.append("location", JSON.stringify(bookData.location));
      } else {
        formData.append(key, bookData[key]);
      }
    }
    formData.append("image", image);


    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/books/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message);
      }

      setShowSuccess(true);
      setBookData({
        title: "",
        author: "",
        category: "",
        mode: "lend",
        description: "",
        securityMoney: "",
        sellingPrice: "",
        location: null,
        city: "",
      });
      setImage(null);
      setPreviewUrl("");
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    } finally {
      setSubmitting(false);
    }
  };

  if (error)
    return <ErrorPage message={error}/>


  return (
    <>

      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 px-4 py-10">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <UploadCloud className="w-7 h-7" />
              List a Book
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Share your books with others — lend or exchange!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <BookAutocompleteInput onBookSelect={handleBookSelect} />

            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                name="author"
                value={bookData.author}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                name="category"
                value={bookData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <select
                name="mode"
                value={bookData.mode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="lend">Lend Temporarily</option>
                <option value="sell">Sell Book</option>
              </select>
            </div>

            {bookData.mode === "lend" && (
              <div>
                <label className="block text-sm font-medium mb-1">Security Money (₹)</label>
                <input
                  name="securityMoney"
                  type="number"
                  min="0"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {bookData.mode === "sell" && (
              <div>
                <label className="block text-sm font-medium mb-1">Selling Price (₹)</label>
                <input
                  name="sellingPrice"
                  type="number"
                  min="0"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
  name="description"
  value={bookData.description}
  onChange={handleChange}
  rows={3}
  maxLength={200}
  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
/>
<p className="text-sm text-gray-500 mt-1">
  {bookData.description.length}/200 characters
</p>
            </div>

            {/* City + coordinates */}
<div>
  
  <CityAutocompleteInput
  onSelect={(option) => {
    setBookData((prev) => ({
      ...prev,
      city: option.label,
      location: {
        type: "Point",
        coordinates: [option.lon, option.lat],
      },
    }));
  }}
/>


  {/* fallback “Use my location” button remains unchanged */}
  <button
    type="button"
    onClick={detectLocation}
    className="mt-2 flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
  >
    <LocateIcon className="w-4 h-4" />
    Use My Location
  </button>

  {bookData.location && (
    <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
      Location set to: Lat {bookData.location.coordinates[1]}, Lng{" "}
      {bookData.location.coordinates[0]}
    </p>
  )}
</div>


            <div>
              <label className="block text-sm font-medium mb-2">Book Image</label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <UploadCloud className="w-5 h-5" />
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {previewUrl && (
                <div>
                  <p className="text-sm mb-1 text-gray-600 dark:text-gray-300">Preview:</p>
                  <img src={previewUrl} alt="Preview" className="w-40 h-56 object-cover border rounded-lg shadow" />
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={submitting || loadingLocation}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                "Submit Book"
              )}
            </button>
          </form>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center max-w-sm shadow-lg">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">Book Uploaded Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Your book is now live for others to see.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
