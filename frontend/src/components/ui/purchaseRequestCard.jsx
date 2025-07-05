import { Link } from "react-router-dom";
import ActionButton from "../helper/actionButton";
export default function PurchaseRequestCard({ req, onAccept, onReject, onChat }) {
  const { _id, book, buyer, status, createdAt } = req;
  const statusLower = status.toLowerCase();
  const colour = { accepted: "text-green-600", rejected: "text-red-600", completed: "text-green-600" }[statusLower] || "text-yellow-600";

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition flex flex-col md:flex-row gap-4">
      <img loading="lazy" src={book.imageUrl} alt={book.title} className="w-24 h-32 object-cover rounded" />
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-sm text-gray-600">by {book.author}</p>
        <p className="text-sm text-gray-500 mt-1">Requested on: {new Date(createdAt).toLocaleDateString()}</p>
        <Link to={`/profile/${buyer._id}`} className="mt-2 inline-block text-sm text-blue-600 hover:underline">
          Buyer: {buyer.firstName}
        </Link>
        <p className={`mt-2 font-medium ${colour}`}>Status: {status}</p>
      </div>
      <div className="flex flex-col gap-2 md:w-52">
        {statusLower === "pending" && (
          <>
            <ActionButton label="Accept" variant="green" onClick={() => onAccept(_id)} />
            <ActionButton label="Reject" variant="red" onClick={() => onReject(_id)} />
          </>
        )}
        {statusLower === "accepted" && (
          <ActionButton label={`Chat with ${buyer.firstName}`} variant="blue" onClick={() => onChat(buyer._id)} />
        )}
        {statusLower === "completed" && <p className="text-sm font-medium text-green-700">✅ Sale Completed</p>}
        {statusLower === "rejected" && <p className="text-sm font-medium text-red-600">Request Rejected</p>}
      </div>
    </div>
  );
}