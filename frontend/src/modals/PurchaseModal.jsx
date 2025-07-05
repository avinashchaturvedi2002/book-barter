import { Link } from "react-router-dom";

export default function PurchaseModal({ selectedBook, onClose }) {
  if (!selectedBook) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h3 className="text-xl font-bold mb-4">Purchase Notification Sent</h3>
        <p className="mb-4">
          A purchase request for <strong>{selectedBook.title}</strong> has been sent to the owner.
        </p>
        <p className="mb-4">
          You can now chat with the owner to decide on payment and pickup details.
        </p>
        <div className="flex flex-col space-y-3">
          <Link
            to={`/chat/${selectedBook.owner._id}`}
            className="bg-green-600 text-white px-4 py-2 rounded text-center"
          >
            Chat with Owner
          </Link>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
