import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
  isTyping,
  onLoadMore,
  hasMore,
  isLoadingMore,
  shouldScrollToBottom,
  setShouldScrollToBottom,
}) {
  const containerRef = useRef();
  const messagesEndRef = useRef();

  // Scroll to bottom only if flagged
  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom, setShouldScrollToBottom]);

  // Detect scroll to top for pagination
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop === 0 && hasMore && !isLoadingMore) {
        const prevHeight = el.scrollHeight;
        onLoadMore().then(() => {
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight - prevHeight;
          });
        });
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [messages, hasMore, isLoadingMore, onLoadMore]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3"
    >
      {isLoadingMore && hasMore && (
        <div className="text-center text-xs text-gray-500">Loading more...</div>
      )}

      {messages.map((msg, i) => (
        <MessageBubble key={msg._id || i} msg={msg} />
      ))}

      {isTyping && (
        <div className="text-xs text-gray-400 italic ml-1">typing...</div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
