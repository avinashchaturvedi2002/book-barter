import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function BookAutocompleteInput({ onBookSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [hasSelected, setHasSelected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (hasSelected) return;

    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 100);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchText) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(searchText)}`
      );

      const items = response.data.items || [];
      const books = items.map((item) => {
        const info = item.volumeInfo;
        return {
          id: item.id,
          title: info.title,
          authors: info.authors ? info.authors.join(", ") : "Unknown",
          categories: info.categories ? info.categories.join(", ") : "Uncategorized",
        };
      });

      setSuggestions(books);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching book suggestions:", error);
    }
  };

  const handleSelect = (book) => {
    setQuery(book.title);
    setHasSelected(true);
    setSuggestions([]);
    setShowDropdown(false);
    onBookSelect(book);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHasSelected(false);
    onBookSelect({ title: value, authors: "", categories: "" });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block mb-1 font-medium">Book Title</label>
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Start typing book title..."
        value={query}
        onChange={handleInputChange}
      />

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute bg-white border rounded mt-1 w-full max-h-48 overflow-auto z-10 shadow">
          {suggestions.map((book) => (
            <li
              key={book.id}
              className="p-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => handleSelect(book)}
            >
              <strong>{book.title}</strong> by {book.authors}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
