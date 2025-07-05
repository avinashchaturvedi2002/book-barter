import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import StarDisplay from "../common/StarDisplay";

export default function ProfileHeader({
  userData,
  isOwnProfile,
  profilePic,
  handleProfilePicChange,
  userId,
  navigate,
  setActiveTab
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border flex items-center justify-center bg-gray-200 text-4xl font-bold text-gray-600">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            (`${userData.firstName?.[0] ?? ""}${userData.lastName?.[0] ?? ""}`).toUpperCase()
          )}
        </div>

        {isOwnProfile ? (
          <>
            <label
              htmlFor="profilePicInput"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700"
              title="Change Profile Picture"
            >
              📷
            </label>
            <input
              id="profilePicInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
            />
          </>
        ) : (
          <button
            onClick={() => navigate(`/chat/${userId}`)}
            title="Chat with this user"
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white
                       rounded-full p-3 shadow-lg transition transform hover:scale-110"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col justify-center items-center space-y-1 sm:justify-start sm:items-start">
        <h3 className="text-2xl font-semibold">
          {userData.firstName} {userData.lastName}
        </h3>
        <p className="text-gray-600">{userData.email}</p>
        <div onClick={() => setActiveTab("rating")} className="hover:cursor-pointer">
          <StarDisplay rating={userData.rating} size={20} />
          <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
            {userData.rating?.toFixed(1) || "0.0"} / 5
            <span className="text-xs text-gray-500 ml-1">({userData.reviewCount || 0} reviews)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
