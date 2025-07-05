import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/socketContext";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications } = useSocket();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
  console.log("🔔 NotificationBell updated:", notifications);
}, [notifications]);


  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]); // ✅ Recalculate when notifications change

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      title="Notifications"
    >
      <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
