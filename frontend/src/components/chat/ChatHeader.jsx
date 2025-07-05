import { Link, useNavigate } from "react-router-dom";

export default function ChatHeader({ userId, isMobile, isOnline, rPic, receiver }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-100 to-blue-200 rounded-t-md">
      {isMobile && (
        <button
          onClick={() => navigate("/chat")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>
      )}

      <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />

      <Link to={`/profile/${userId}`}>
        <h2 className="text-lg font-semibold text-gray-800 flex flex-row space-x-2 items-center">
          <span className="w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center bg-gray-200 font-bold text-gray-600">
            {rPic ? (
              <img src={rPic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              `${receiver?.charAt(0) ?? ""}`.toUpperCase()
            )}
          </span>
          <p>{receiver}</p>
        </h2>
      </Link>
    </div>
  );
}
