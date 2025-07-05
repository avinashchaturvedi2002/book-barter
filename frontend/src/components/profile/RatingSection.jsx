import { useState, useEffect } from "react";
import { useLoading } from "../../context/LoadingContext";
import ErrorPage from "../../pages/ErrorPage";

export default function RatingSection({ userId, isOwnProfile }) {
  const [ratingStars, setRatingStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const {showLoader,hideLoader}=useLoading();
  const [error,setError]=useState();

  const fetchReviews = async () => {
    showLoader("fetching your reviews...")
    try {
      const token=sessionStorage.getItem("token")||localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/reviews/${userId}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    finally{
      hideLoader();
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const handleSubmitReview = async () => {
    if (ratingStars === 0) {
      alert("Please select a rating");
      return;
    }

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/rate/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stars: ratingStars, reviewText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Rating submitted!");
      setRatingStars(0);
      setReviewText("");
      fetchReviews();
    } catch (err) {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
  };

  if (error) return <ErrorPage message={error}/>
  return (
    <div className="bg-white p-6 rounded-lg shadow text-gray-800">
      <p className="text-lg font-semibold mb-2">⭐ User Reviews</p>

      {!isOwnProfile && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-2">Leave a Rating & Review</h4>
          <div className="flex items-center space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} filled={star <= ratingStars} onClick={() => setRatingStars(star)} />
            ))}
          </div>
          <textarea
            className="w-full border rounded p-2 mb-3"
            rows={3}
            placeholder="Write your review here"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <button
            onClick={handleSubmitReview}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Review
          </button>
        </div>
      )}

      <div className="mt-6">
        { reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b pb-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {r.ratedBy.profileImage ? (
                      <img src={r.ratedBy.profileImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs font-bold text-gray-600">
                        {(r.ratedBy.firstName[0] + r.ratedBy.lastName[0]).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-sm">
                    {r.ratedBy.firstName} {r.ratedBy.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < r.stars ? "★" : "☆"}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 mt-1">{r.reviewText}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Star({ filled, onClick }) {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      className={`h-6 w-6 cursor-pointer ${filled ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-500 transition`}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.965c.3.92-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.965a1 1 0 00-.364-1.118L2.036 9.393c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.966z"
      />
    </svg>
  );
}
