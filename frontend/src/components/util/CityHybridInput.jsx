import { useState, useEffect, useRef } from "react";

export default function CityHybridInput({ cityOptions, selectedCity, onSelectCity }) {
  const [query, setQuery] = useState(selectedCity || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (!query || cityOptions.some(opt => opt.id === query)) return;

    const controller = new AbortController();
    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: { "User-Agent": "BookBarterApp/1.0" },
          }
        );
        const json = await res.json();
        setSuggestions(
          json.map((item) => ({
            label: item.address.city || item.display_name.split(",")[0],
          }))
        );
        setShowSuggestions(true);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [query, cityOptions]);

  return (
    <div className="relative">
      <label className="block font-semibold mb-1 text-gray-700">City</label>

      {/* Dropdown selector */}
      <select
        className="w-full border rounded-lg px-4 py-2 mb-2"
        value={cityOptions.some(opt => opt.id === query) ? query : ""}
        onChange={(e) => {
          setQuery(e.target.value);
          onSelectCity(e.target.value);
        }}
      >
        {cityOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.title}
          </option>
        ))}
      </select>

      {/* Manual input */}
      <input
        ref={inputRef}
        className="w-full border rounded-lg px-4 py-2"
        type="text"
        placeholder="Or type your city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
      />

      {/* Suggestions list */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-52 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setQuery(s.label);
                setShowSuggestions(false);
                onSelectCity(s.label);
              }}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {loading && (
        <div className="text-sm text-gray-400 mt-1">Searching...</div>
      )}
    </div>
  );
}
