import { Link } from "react-router-dom";
export default function BookCard({ book, onActionClick, isRequested = false, ownUser = false, showOwner=true }) {
  console.log(book);
  return (
    
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition flex flex-col h-full">
      {/* Book Image */}
      <img
        src={book.imageUrl}
        alt={book.title}
        className="w-full h-48 object-contain rounded mb-4"
      />

      {/* Content area */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-sm text-gray-500">by {book.author}</p>
        <p className="text-sm text-gray-600 mt-1">Category: {book.category}</p>
        {(showOwner)&&(<Link to={`/profile/${book.owner._id}`}>
          <p className="text-sm text-blue-600 mt-1">Owner: {book.owner.firstName +" "+book.owner.lastName}</p>
        
        </Link>)}
        <p className="text-sm text-gray-600 mt-1">City: {book.city}</p>

        {/* Price (only for sale books) */}
        {book.mode === "sale" && book.available && (
          <p className="text-lg font-bold text-green-600 mt-2">
            {book.price.toFixed(2)} INR
          </p>
        )}

        <p
          className={`text-sm mt-1 font-medium ${
            book.available ? "text-green-600" : "text-red-500"
          }`}
        >
          {book.available
            ? book.mode === "lend"
              ? "Available to borrow"
              : "Available for purchase"
            : "Currently unavailable"}
        </p>
      </div>

      {/* Action Button */}
      {!ownUser && (
        isRequested ? (
          <button
            className="mt-4 w-full py-2 rounded bg-gray-400 text-white cursor-not-allowed"
            disabled
          >
            Already Requested
          </button>
        ) : (
          <button
            className={`mt-4 w-full py-2 rounded text-white ${
              book.available
                ? book.mode === "lend"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!book.available}
            onClick={() => onActionClick(book)}
          >
            {book.mode === "lend" ? "Request to Borrow" : `Buy Now for ₹ ${book.sellingPrice} `}
          </button>
        )
      )}
    </div>
  );
}
