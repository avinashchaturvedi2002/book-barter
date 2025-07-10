// src/pages/NotificationPage.jsx
import { useSocket } from "../context/socketContext";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "./ErrorPage";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function NotificationPage() {
  const { notifications, setNotifications, loading } = useSocket();
  const {showLoader, hideLoader}=useLoading();
  const [error,setError]=useState();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { ref: loadMoreRef, inView } = useInView();
  
  const navigate  = useNavigate();

  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  useEffect(() => {
    if (loading) showLoader("Loading notifications...");
    else hideLoader();
  }, [loading]);

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      fetchMoreNotifications();
    }
  }, [inView]);

  const fetchMoreNotifications = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications?page=${page + 1}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch notifications");

      setNotifications((prev) => [...prev, ...data.notifications]);
      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingMore(false);
    }
  };


  const markSingleRead = async (note) => {
    if (note.read) return;
    try{
      await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${note._id}/read`,
      { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications((prev) =>
      prev.map((n) => (n._id === note._id ? { ...n, read: true } : n))
    );
    }
    catch(err)
    {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    
  };

  const handleRedirect = async (note) => {
    try{
      await markSingleRead(note);

    switch (note.type) {
      case "incoming_request":
      case "request_cancelled":
      case "exchange_request":
        navigate("/ir");
        break;
      case "request_accepted":
      case "request_rejected":
      case "counter_offer":
      case "security_ready":
        navigate("/mr");
        break;
      default:
        break;
    }
    }
    catch(err)
    {
      setError(err?.response?.data?.message || 
  err?.message ||                 
  "Something went wrong.")
    }
    
  };

  const markAllAsRead = async () => {
    showLoader("Marking all notification as read...")
    try{
      await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/notifications/mark-all-read`,
      { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
    
  };

  if(error)
    return <ErrorPage message={error}/>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">
            No notifications yet.
          </p>
        ) : (
          notifications.map((note,i) => (
            <div
              key={note._id}
              onClick={() => handleRedirect(note)}
              className={`border p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition ${
                note.read
                  ? "bg-white dark:bg-gray-800"
                  : "bg-yellow-50 dark:bg-yellow-900"
              }`}
              ref={i === notifications.length - 1 ? loadMoreRef : null} 
            >
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {note.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
