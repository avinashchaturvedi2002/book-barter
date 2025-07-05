import moment from "moment";

export default function MessageBubble({ msg }) {
  return (
    <div
      className={`max-w-[80%] text-sm ${msg.fromSelf ? "ml-auto text-white" : "mr-auto text-gray-900"}`}
    >
      <div
        className={`p-2 rounded-lg whitespace-pre-wrap break-words ${
          msg.fromSelf ? "bg-blue-600" : "bg-white border"
        }`}
      >
        {msg.content}
      </div>
      {msg.fromSelf && (
        <div className="text-[10px] text-right text-green-500 pr-1">
          {msg.seen ? "Seen" : ""}
        </div>
      )}
      <div
        className={`text-[10px] mt-1 ${
          msg.fromSelf ? "text-right text-gray-200" : "text-left text-gray-500"
        }`}
      >
        {moment(msg.createdAt).format("h:mm A")}
      </div>
    </div>
  );
}
