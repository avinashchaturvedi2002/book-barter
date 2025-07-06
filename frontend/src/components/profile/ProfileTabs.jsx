export default function ProfileTabs({ activeTab, setActiveTab, isOwnProfile }) {
  const tabs = ["uploaded", "history", "rating", ...(isOwnProfile ? ["borrowed", "lent"] : [])];

  const tabLabels = {
    uploaded: "Uploaded Books",
    history: "Swap History",
    rating: "User Ratings",
    borrowed: "Borrowed Books",
    lent: "Lent Books",
  };

  return (
    <div className="mb-6">
      {/* Mobile */}
      <div className="sm:hidden mb-4">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white"
        >
          {tabs.map((tab) => (
            <option key={tab} value={tab}>
              {tabLabels[tab]}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex flex-wrap gap-4 border-b text-sm font-medium">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-3 ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>
    </div>
  );
}
