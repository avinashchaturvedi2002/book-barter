import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function ChatHeader({
  userId,
  isMobile,
  isOnline,
  rPic,
  receiver,
  onBack,          // ⇠ NEW
}) {
  const navigate = useNavigate();

  return (
    <div className="p-3 sm:p-4 border-b flex items-center gap-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-t-md">
      {/* mobile back arrow */}
      {isMobile && (
        <button
          onClick={onBack ?? (() => navigate("/chat"))}
          className="text-gray-700 hover:text-blue-600 flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* online dot */}
      <span
        className={`w-2 h-2 rounded-full ${
          isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      />

      {/* avatar + name */}
      <Link to={`/profile/${userId}`} className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center bg-gray-200 font-bold text-gray-600">
          {rPic ? (
            <img
              src={rPic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            receiver?.charAt(0).toUpperCase()
          )}
        </span>
        <p className="text-sm sm:text-base font-semibold text-gray-800">
          {receiver}
        </p>
      </Link>
    </div>
  );
}
