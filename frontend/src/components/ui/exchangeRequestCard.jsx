import { Link } from "react-router-dom";
import ActionButton from "../helper/actionButton";
export default function ExchangeRequestCard({ req, onAccept, onReject, onCounter, onLendSecurity, onChat }) {
  const { _id, offeredBook, requestedBook, status, createdAt, requestedBy } = req;
  const securityPhase = status === "security_pending" || status === "security_paid";
  const statusColour =
    status === "accepted" ? "text-green-600" : status === "Rejected" ? "text-red-600" : "text-yellow-600";

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
      <div className="flex flex-col md:flex-row gap-4">
        {/* covers */}
        <div className="flex gap-4 justify-center items-center">
          <img loading="lazy" src={requestedBook.imageUrl} alt={requestedBook.title} className="w-24 h-32 object-cover rounded" />
          {!securityPhase && (
            <img loading="lazy" src={offeredBook.imageUrl} alt={offeredBook.title} className="w-24 h-32 object-cover rounded" />
          )}
        </div>
        {/* details */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{requestedBook.title}</h3>
          <p className="text-sm text-gray-600">by {requestedBook.author}</p>
          <p className="text-sm text-gray-500 mt-1">Requested on: {new Date(createdAt).toLocaleDateString()}</p>
          {!securityPhase && (
            <p className="text-sm mt-2">
              <strong className="text-gray-700">Offering:</strong> <em>{offeredBook.title}</em> by {offeredBook.author}
            </p>
          )}
          <Link to={`/profile/${requestedBy._id}`}> <p className="mt-2 text-sm text-blue-600 hover:underline cursor-pointer"><strong className="text-gray-700">Requester:</strong> {requestedBy.firstName}</p></Link>
          <p className="text-sm mt-2">
              <strong className="text-gray-700">Duration:</strong> {req.durationInDays + " days"} 
            </p>
          <p className={`mt-2 font-medium ${statusColour}`}>Status: {status}</p>
        </div>
        {/* actions */}
        <div className="flex flex-col gap-2 md:w-52">
          {status === "pending" ? (
            <>
              <ActionButton label="Accept" variant="green" onClick={() => onAccept(_id)} />
              <ActionButton label="Reject" variant="red" onClick={() => onReject(_id)} />
              <ActionButton label="Explore Other Books" variant="yellow" onClick={() => onCounter(_id, requestedBy._id)} />
              <ActionButton label="Lend for security money" variant="green" onClick={() => onLendSecurity(_id)} />
            </>
          ) : (
            (status === "accepted" || status === "security_paid") && (
              <>
              <ActionButton label={`Chat with ${requestedBy.firstName}`} variant="blue" onClick={() => onChat(requestedBy._id)} />
              <ActionButton label="Reject" variant="red" onClick={() => onReject(_id)} />
              </>
              
            )
          )}
        </div>
      </div>
    </div>
  );
}