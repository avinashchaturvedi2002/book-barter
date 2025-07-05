export default function SwapHistoryCard({ swap }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border dark:border-gray-700">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
            {swap.requestedBy.firstName?.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-800 dark:text-gray-100 text-sm font-semibold">
            {swap.requestedBy.firstName} offered a book to {swap.requestedFrom.firstName}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          {swap.offeredBook && (
            <div className="text-center flex-1">
              <img src={swap.offeredBook.imageUrl} alt={swap.offeredBook.title} className="w-20 h-28 object-cover rounded-lg mx-auto mb-2 border" />
              <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{swap.offeredBook.title}</p>
            </div>
          )}
          {swap.offeredBook && (
            <div className="text-xl text-blue-600 dark:text-blue-400 font-bold">⇄</div>
          )}
          <div className="text-center flex-1">
            <img src={swap.requestedBook.imageUrl} alt={swap.requestedBook.title} className="w-20 h-28 object-cover rounded-lg mx-auto mb-2 border" />
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{swap.requestedBook.title}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
          Status: <span className="capitalize font-medium text-green-600">{swap.status}</span> <br />
          {new Date(swap.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
