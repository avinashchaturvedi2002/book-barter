// src/components/ui/button.jsx
export function Button({ children, className = "", variant = "default", ...props }) {
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-100",
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
