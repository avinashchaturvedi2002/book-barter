import { useState, useEffect, useRef } from "react";

export default function CityAutocompleteInput({ onSelect }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [hasSelected, setHasSelected] = useState(false); // 🔸 control fetch after selection
  const wrapperRef = useRef(null);
  const controllerRef = useRef(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!query.trim() || hasSelected) {
      setOptions([]);
      return;
    }

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
            query.trim()
          )}`,
          {
            signal: controllerRef.current.signal,
            headers: {
              "User-Agent": "BookBarterApp/1.0",
            },
          }
        );

        const json = await res.json();

        setOptions(
          json.map((p) => ({
            label:
              (p.address?.city ||
                p.address?.town ||
                p.address?.village ||
                p.display_name.split(",")[0]) +
              (p.address?.state ? `, ${p.address.state}` : ""),
            lat: parseFloat(p.lat),
            lon: parseFloat(p.lon),
          }))
        );

        setShowOptions(true);
      } catch (_) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query, hasSelected]);

  useEffect(() => {
  if (!query.trim()) {
    setHasSelected(false);
    onSelect(""); // reset city filter if input is cleared
  }
}, [query]);

  const handleSelect = (option) => {
    setQuery(option.label);
    setHasSelected(true);
    setShowOptions(false);
    onSelect(option);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHasSelected(false); // reset when typing
          setShowOptions(true);
        }}
        placeholder="Enter your city"
        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
      />

      {loading && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-700 text-sm p-2 text-gray-500 dark:text-gray-300">
          Searching...
        </div>
      )}

      {!loading && showOptions && options.length > 0 && (
        <ul className="absolute z-10 top-full left-0 w-full border rounded-lg bg-white dark:bg-gray-700 max-h-60 overflow-y-auto mt-1 shadow-lg">
          {options.map((opt, index) => (
            <li
              key={index}
              onClick={() => handleSelect(opt)}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-800 dark:text-gray-200"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
