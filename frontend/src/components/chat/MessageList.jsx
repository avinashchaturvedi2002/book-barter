import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, isTyping }) {
  const messagesEndRef = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3">
      {messages.map((msg, i) => (
        <MessageBubble key={msg._id || i} msg={msg} />
      ))}
      {isTyping && <div className="text-xs text-gray-400 italic ml-1">typing...</div>}
      <div ref={messagesEndRef} />
    </div>
  );
}
