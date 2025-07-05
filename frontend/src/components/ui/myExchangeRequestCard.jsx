import { Link } from "react-router-dom";

export default function MyExchangeRequestCard({
  req,
  onCancel,
  onChat,
  onPaySecurity,
  onValidateOtp,
  onAccept,
  onDismiss,
}) {
  const {
    _id,
    requestedBook,
    offeredBook,
    status,
    createdAt,
    securityAmount,
  } = req;

  const statusLower = status.toLowerCase();

  const statusColour = {
    accepted: "text-green-600",
    rejected: "text-red-600",
    counter_offer: "text-blue-600",
  }[statusLower] || "text-yellow-600";

  const showOfferedBook =
    statusLower !== "security_pending" && statusLower !== "security_paid";

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition flex flex-col gap-4 md:flex-row">
      {/* Book Images */}
      <div className="flex gap-4">
        {[{ img: requestedBook.imageUrl, label: "Requesting" }]
          .concat(
            showOfferedBook
              ? [{ img: offeredBook.imageUrl, label: "Offering" }]
              : []
          )
          .map(({ img, label }, i) => (
            <div key={i} className="text-center">
              <img
                src={img}
                alt={label}
                className="w-24 h-32 object-cover rounded"
              />
              <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                {label}
              </p>
            </div>
          ))}
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{requestedBook.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          by {requestedBook.author}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Requested on: {new Date(createdAt).toLocaleDateString()}
        </p>
        <Link
          to={`/profile/${requestedBook.owner._id}`}
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          Owner: {requestedBook.owner.firstName}
        </Link>

        {showOfferedBook && (
          <p className="text-sm mt-2">
            <strong className="text-gray-700 dark:text-gray-300">
              You Offered:
            </strong>{" "}
            {offeredBook.title} by {offeredBook.author}
          </p>
        )}

        <p className={`mt-2 font-medium ${statusColour}`}>Status: {status}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 md:w-52">
        {statusLower === "pending" && (
          <button
            onClick={() => onCancel(_id)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
          >
            Cancel Request
          </button>
        )}

        {statusLower === "rejected" && (
          <button
            onClick={() => onDismiss(_id)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded"
          >
            Dismiss
          </button>
        )}

        {statusLower === "accepted" && (
          <>
            <button
              onClick={() => onChat(requestedBook.owner._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
            >
              Chat with {requestedBook.owner.firstName}
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
              Cancel Request
            </button>
          </>
        )}

        {statusLower === "security_pending" && (
          <>
            <button
              onClick={() => onChat(requestedBook.owner._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
            >
              Chat with {requestedBook.owner.firstName}
            </button>
            <button
              onClick={() => onPaySecurity(_id)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded"
            >
              Pay {securityAmount} INR
            </button>
            <button
              onClick={() => onCancel(_id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
            >
              Cancel
            </button>
          </>
        )}

        {statusLower === "security_paid" && (
          <>
            <button
              onClick={() => onChat(requestedBook.owner._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
            >
              Chat with {requestedBook.owner.firstName}
            </button>
            <button
              onClick={() => onValidateOtp(_id)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded"
            >
              Validate OTP
            </button>
          </>
        )}

        {statusLower === "counter_pending" && (
          <>
            <button
              onClick={() => onAccept(_id)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded"
            >
              Accept
            </button>
            <button
              onClick={() => onCancel(_id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
