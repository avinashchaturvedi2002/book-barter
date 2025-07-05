import { Link } from "react-router-dom";

export default function MyPurchaseCard({
  request,
  onChat,
  onCancel,
  onValidateOtp,
}) {
  const { _id, book, status, createdAt } = request;
  const statusLower = status.toLowerCase();

  const statusColour =
    {
      accepted: "text-green-600",
      rejected: "text-red-600",
      completed: "text-green-600",
    }[statusLower] || "text-yellow-600";

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition flex flex-col gap-4 md:flex-row">
      {/* ────── Cover image ────── */}
      <img
        src={book.imageUrl}
        alt={book.title}
        className="w-24 h-32 object-cover rounded"
      />

      {/* ────── Main details ────── */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          by {book.author}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Requested on: {new Date(createdAt).toLocaleDateString()}
        </p>
        <Link
          to={`/profile/${book.owner._id}`}
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          Book Owner: {book.owner.firstName}
        </Link>
        <p className={`mt-2 font-medium ${statusColour}`}>Status: {status}</p>
      </div>

      {/* ────── Action buttons ────── */}
      <div className="flex flex-col gap-2 md:w-52">
        {statusLower === "pending" && (
          <>
            <button
              onClick={() => onChat(book.owner._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
            >
              Chat with {book.owner.firstName}
            </button>
            <button
              onClick={() => onCancel(_id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
            >
              Cancel Request
            </button>
          </>
        )}

        {statusLower === "accepted" && (
          <>
            <button
              onClick={() => onChat(book.owner._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
            >
              Chat with {book.owner.firstName}
            </button>
            <button
              onClick={() => onValidateOtp(_id)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded"
            >
              Validate OTP
            </button>
            <button
              onClick={() => onCancel(_id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
            >
              Cancel
            </button>
          </>
        )}

        {statusLower === "completed" && (
          <button
            onClick={() => onChat(book.owner._id)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
          >
            Chat with Seller
          </button>
        )}

        {statusLower === "rejected" && (
          <button
            onClick={() => onCancel(_id)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
