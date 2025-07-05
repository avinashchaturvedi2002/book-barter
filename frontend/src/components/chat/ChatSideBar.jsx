import { useNavigate, useParams } from "react-router-dom";

export default function ChatSidebar({ users, currentUserId }) {
  const navigate = useNavigate();
  const { userId } = useParams();

  return (
    <div className="col-span-1 border rounded-md bg-white h-[80vh] overflow-y-auto">
      <h3 className="text-md font-semibold p-3 border-b bg-gray-100">Inbox</h3>

      {users.map((user) => {
        const otherUser = user.participants.find((u) => u._id !== currentUserId);
        return (
          <div
            key={user._id}
            onClick={() => navigate(`/chat/${otherUser._id}`)}
            className={`p-3 cursor-pointer hover:bg-blue-100 transition flex items-start gap-2 ${
              otherUser._id === userId ? "bg-blue-50" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center bg-gray-200 font-bold text-gray-600 text-sm">
              {otherUser.profileImage ? (
                <img
                  src={otherUser.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                `${otherUser.firstName?.charAt(0) ?? ""}${otherUser.lastName?.charAt(0) ?? ""}`.toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[160px]">
                {user.lastMessage?.content || "No messages yet"}
              </p>
            </div>

            {user.unseenCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full self-center ml-auto">
                {user.unseenCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
