export default function ActionButton({ label, onClick, variant, subtle = false }) {
  const colour = {
    green: "green-600",
    red: "red-600",
    blue: "blue-600",
    yellow: "yellow-500",
  }[variant] || "gray-600";
  const hover = colour.replace("-600", "-700");
  const base = subtle ? `` : `bg-${colour} hover:bg-${hover} text-white`;
  return (
    <button onClick={onClick} className={`${base} px-3 py-1.5 rounded`}>
      {label}
    </button>
  );
}