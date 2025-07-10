import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token, user, loading } = useAuth();

  const [socket, setSocket] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState(0);
  const [loadingSocketData, setLoadingSocketData] = useState(true);

  
  useEffect(() => {
    if (loading || !token || !user) return;           // wait for auth

    console.log("⚡ Connecting socket…");
    const s = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
      autoConnect: true,
    });


    setSocket(s);

    /* clean up on logout / token change */
    return () => {
      s.disconnect();
      setSocket(null);
      setNotifications([]);
      setUnseenMessages(0);
      setLoadingSocketData(true);
    };
  }, [loading, token, user]);

  /* ------------------------------------------------------------------ */
  /* 2️⃣  FETCH INITIAL COUNTS AS SOON AS SOCKET EXISTS                  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!socket || !token) return;

    const fetchInitial = async () => {
      try {
        /* notifications list */
        const nRes = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/notifications?page=1&limit=10`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const nData = await nRes.json();
setNotifications(nData.notifications || []);

        /* unseen‑message count */
        const mRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/conversations/unseen-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const mData = await mRes.json();
        setUnseenMessages(mData.count || 0);
      } catch (err) {
        console.error("❌ SocketContext initial fetch failed", err);
      } finally {
        setLoadingSocketData(false);
      }
    };

    fetchInitial();
  }, [socket, token]);

 
 /* join personal room once socket exists */
useEffect(() => {
  if (!socket || !user?._id) return;

  const join = () => {
    console.log("🚀 Emitting join_personal_room");
    socket.emit("join_personal_room");
  };

  // If the socket is already connected (very likely after a hard refresh)
  if (socket.connected) join();

  // Also handle future reconnects
  socket.on("connect", join);

  return () => socket.off("connect", join);
}, [socket, user?._id]);



  useEffect(() => {
    if (!socket) return;

    /* ---------- helper listeners ---------- */
    const handleNotification = (notif) => {
      console.log("🔔 New notification", notif);
      setNotifications((prev) => [notif, ...prev]);
    };

    const handleMessage = (msg) => {
      const me = user?._id;
      if (msg.sender === me) return;            // ignore own echo

      const onChatWith = window.location.pathname.startsWith(
        `/chat/${msg.sender}`
      );

      if (!onChatWith) {
        setUnseenMessages((c) => c + 1);
      } else {
        socket.emit("mark_seen", { conversationId: msg.conversationId });
      }
    };

    const refetchUnseen = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/conversations/unseen-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setUnseenMessages(data.count || 0);
      } catch (err) {
        console.error("❌ Failed to refresh unseen count", err);
      }
    };

    /* ---------- register ---------- */
    socket.on("new_notification", handleNotification);
    socket.on("new_message", handleMessage);
    socket.on("update_conversations", refetchUnseen);

    console.log("✅ Socket listeners attached");

    /* ---------- cleanup ---------- */
    return () => {
      socket.off("new_notification", handleNotification);
      socket.off("new_message", handleMessage);
      socket.off("update_conversations", refetchUnseen);
    };
  }, [socket, token, user]);

  /* ------------------------------------------------------------------ */
  /* 4️⃣  CONTEXT VALUE                                                  */
  /* ------------------------------------------------------------------ */
  const ctxValue = {
    socket,
    notifications,
    setNotifications,
    unseenMessages,
    setUnseenMessages,
    loading: loadingSocketData,
  };

  return <SocketContext.Provider value={ctxValue}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}
