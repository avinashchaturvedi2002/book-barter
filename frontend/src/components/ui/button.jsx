// src/components/ui/button.jsx
export function Button({ children, className = "", variant = "default", ...props }) {
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-100",
    outline:
    "border border-blue-500 text-blue-600 bg-transparent hover:bg-blue-100 dark:hover:bg-gray-800",
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
