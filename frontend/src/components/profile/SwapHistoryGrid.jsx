import SwapHistoryCard from "./SwapHistoryCard";

export default function SwapHistoryGrid({ swapHistory }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {swapHistory.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No swap history available.</p>
      ) : (
        swapHistory.map((swap) => <SwapHistoryCard key={swap._id} swap={swap} />)
      )}
    </div>
  );
}
