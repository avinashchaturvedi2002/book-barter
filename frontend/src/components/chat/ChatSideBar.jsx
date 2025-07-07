import { useNavigate, useParams } from "react-router-dom";

export default function ChatSidebar({ users, currentUserId, onChatSelect }) {
  const navigate = useNavigate();
  const { userId } = useParams();

  /* 2️⃣ Render a placeholder instead of returning early */
  if (users.length === 0) {
    return (
      <div className="border rounded-md bg-white h-[80vh] flex items-center justify-center text-sm text-gray-500">
        No conversations yet
      </div>
    );
  }

  const openChat = (otherId) => {
    if (onChatSelect) onChatSelect(otherId);
    navigate(`/chat/${otherId}`);
  };

  return (
    <div className="border rounded-md bg-white h-[80vh] overflow-y-auto">
      <h3 className="text-md font-semibold p-3 border-b bg-gray-100">Inbox</h3>

      {users.map((conv) => {
        const other = conv.participants.find((u) => u._id !== currentUserId);

        return (
          <div
            key={conv._id}
            onClick={() => openChat(other._id)}
            className={`p-3 cursor-pointer hover:bg-blue-100 transition flex items-start gap-2 ${
              other._id === userId ? "bg-blue-50" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center bg-gray-200 font-bold text-gray-600 text-sm">
              {other.profileImage ? (
                <img
                  src={other.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                `${other.firstName?.[0] ?? ""}${other.lastName?.[0] ?? ""}`.toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium">
                {other.firstName} {other.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
  {String(conv.lastMessage?.content ?? "No messages yet")}
 </p>
            </div>

            {conv.unseenCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full self-center ml-auto">
                {conv.unseenCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
