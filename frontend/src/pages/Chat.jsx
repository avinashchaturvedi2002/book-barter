import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useLoading } from "../context/LoadingContext";
import ErrorPage from "./ErrorPage";
import { useSocket } from "../context/socketContext";
import ChatSidebar from "../components/chat/ChatSideBar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [rPic, setRPic] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [users, setUsers] = useState([]);
  const { showLoader, hideLoader } = useLoading();
  const { socket, setUnseenMessages } = useSocket();

  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const typingTimeoutRef = useRef(null);
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;

  const isMobile = window.innerWidth < 640;
  const [showSidebar, setShowSidebar] = useState(isMobile && !userId);

  const [error, setError] = useState(null);

  const fetchOlderMessages = async () => {
    if (!conversationId || isLoadingMore || !messages.length) return;
    setIsLoadingMore(true);

    const oldest = messages[0]?.createdAt;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/conversations/${userId}?before=${oldest}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const olderMessages = data.messages.map((msg) => ({
        ...msg,
        fromSelf: msg.sender === decoded?.id,
      }));

      if (olderMessages.length === 0) setHasMore(false);

      setMessages((prev) => [...olderMessages, ...prev]);
    } catch (err) {
      console.error("Error fetching older messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMsg = (msg) => {
      const fromSelf = msg.sender === decoded?.id;
      setMessages((prev) => [...prev, { ...msg, fromSelf }]);
      if (!fromSelf) setShouldScrollToBottom(true);

      if (!fromSelf && msg.conversationId === conversationId) {
        socket.emit("mark_seen", { conversationId });
        setUsers((prev) =>
          prev.map((conv) =>
            conv._id === msg.conversationId
              ? {
                  ...conv,
                  lastMessage: msg,
                  unseenCount:
                    msg.sender === decoded?.id ? 0 : (conv.unseenCount || 0) + 1,
                }
              : conv
          )
        );
        return;
      }

      if (!fromSelf && msg.conversationId !== conversationId) {
        setUnseenMessages((c) => c + 1);
      }
    };

    socket.on("new_message", handleNewMsg);
    socket.on("typing", ({ from }) => from !== decoded?.id && setIsTyping(true));
    socket.on("stop_typing", ({ from }) => from !== decoded?.id && setIsTyping(false));
    socket.on("user_online", ({ userId: onlineId }) => {
      if (onlineId === userId) setIsOnline(true);
    });
    socket.on("user_offline", ({ userId: offlineId }) => {
      if (offlineId === userId) setIsOnline(false);
    });
    socket.on("message_seen", ({ userId: seenBy }) => {
      if (seenBy === userId) {
        setMessages((prev) => prev.map((m) => (m.fromSelf ? { ...m, seen: true } : m)));
      }
    });

    return () => {
      socket.off("new_message", handleNewMsg);
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("message_seen");
    };
  }, [socket, userId, conversationId, decoded?.id]);

  useEffect(() => {
    const fetchInboxUsers = async () => {
      showLoader("Getting your inbox users...");
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch (err) {
        setError(err?.message || "Something went wrong.");
      } finally {
        hideLoader();
      }
    };

    if (token) fetchInboxUsers();
  }, [token]);

  useEffect(() => {
    if (!userId || !socket) return;

    const fetchOrCreateConversation = async () => {
      showLoader("Loading chat...");
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/conversations/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setConversationId(data.conversation._id);
        setRPic(data.receiver.profileImage);
        setReceiver(data.receiver?.firstName || "Unknown");

        setMessages(
          data.messages.map((msg) => ({
            ...msg,
            fromSelf: msg.sender === decoded?.id,
          }))
        );

        // ✅ Reset scroll state and pagination flags
        setHasMore(true);
        setIsLoadingMore(false);
        setShouldScrollToBottom(true);

        socket.emit("join_conversation", data.conversation._id);
      } catch (err) {
        setError(err?.message || "Something went wrong.");
      } finally {
        hideLoader();
      }
    };

    fetchOrCreateConversation();
  }, [userId, token, socket]);

  useEffect(() => {
    if (conversationId && socket) {
      socket.emit("mark_seen", { conversationId });
      setUnseenMessages(0);
      setUsers((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, unseenCount: 0 } : c
        )
      );
    }
  }, [conversationId, socket, setUnseenMessages]);

  const sendMessage = () => {
    if (!input.trim() || !conversationId || !socket) return;

    socket.emit("send_message", {
      conversationId,
      content: input,
    });
    setShouldScrollToBottom(true);

    setUsers((prev) =>
      prev.map((conv) =>
        conv._id === conversationId
          ? {
              ...conv,
              lastMessage: {
                content: input,
                createdAt: new Date().toISOString(),
              },
              unseenCount: 0,
            }
          : conv
      )
    );

    socket.emit("stop_typing", { conversationId });
    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit("typing", { conversationId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId });
    }, 1500);
  };

  const openChat = (uid) => {
    navigate(`/chat/${uid}`);
    if (isMobile) setShowSidebar(false);
  };

  const backToSidebar = () => {
    navigate("/chat");
    if (isMobile) setShowSidebar(true);
  };

  if (error) return <ErrorPage message={error} />;

  return (
    <div className="max-w-6xl mx-auto px-2 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {(window.innerWidth >= 640 || showSidebar) && (
          <div className="sm:col-span-1">
            <ChatSidebar
              users={users}
              currentUserId={decoded?.id}
              onChatSelect={openChat}
            />
          </div>
        )}

        {(window.innerWidth >= 640 || (!showSidebar && userId)) && (
          <div className="col-span-3 w-full">
            {userId ? (
              <div className="bg-white shadow-lg rounded-lg flex flex-col h-[80vh] border border-gray-200">
                <ChatHeader
                  userId={userId}
                  isMobile={isMobile}
                  isOnline={isOnline}
                  rPic={rPic}
                  receiver={receiver}
                  onBack={backToSidebar}
                />
                <MessageList
                  messages={messages}
                  isTyping={isTyping}
                  onLoadMore={fetchOlderMessages}
                  hasMore={hasMore}
                  isLoadingMore={isLoadingMore}
                  shouldScrollToBottom={shouldScrollToBottom}
                  setShouldScrollToBottom={setShouldScrollToBottom}
                />
                <MessageInput
                  input={input}
                  onChange={handleTyping}
                  onSend={sendMessage}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[80vh] border rounded-lg bg-white">
                <p className="text-gray-500">Select a chat to start a conversation</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
