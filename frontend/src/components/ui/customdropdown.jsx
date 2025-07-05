import { useState, useEffect, useRef } from "react";

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "-- Select --",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
  options.find((opt) => (opt.id || opt.value)?.toString() === value?.toString()) || null;


  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        className={`w-full bg-white border border-gray-300 rounded-full shadow-sm px-4 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedOption ? selectedOption.title || selectedOption.label : placeholder}
        <span className="float-right">&#9662;</span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const optValue = (option.id || option.value)?.toString();
            console.log(option);
            return (
              <li
                key={option.id}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-600 hover:text-white ${
                  value === optValue ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => {
                  onChange(option.id||option.value);
                  setIsOpen(false);
                }}
              >
                {option.title || option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
