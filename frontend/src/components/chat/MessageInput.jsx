export default function MessageInput({ input, onChange, onSend }) {
  return (
    <div className="p-3 border-t bg-white flex items-center gap-2">
      <input
        value={input}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSend();
          }
        }}
        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Type a message..."
      />
      <button
        onClick={onSend}
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 text-sm rounded-md"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
}
