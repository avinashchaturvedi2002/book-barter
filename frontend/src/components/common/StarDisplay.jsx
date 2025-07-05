
export default function StarDisplay({ rating, max = 5, size = 20 }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => {
        const isFilled = i < fullStars;
        const isHalf = i === fullStars && hasHalfStar;

        return (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={isFilled ? "#facc15" : isHalf ? "url(#half)" : "#d1d5db"}
            className="transition"
            style={{ width: size, height: size }}
          >
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.21 3.718a1 1 0 00.95.69h3.905c.969 0 1.371 1.24.588 1.81l-3.16 2.29a1 1 0 00-.364 1.118l1.21 3.717c.3.92-.755 1.688-1.54 1.118L10 13.348l-3.16 2.29c-.784.57-1.838-.197-1.54-1.118l1.21-3.717a1 1 0 00-.364-1.118l-3.16-2.29c-.783-.57-.38-1.81.588-1.81h3.905a1 1 0 00.95-.69l1.21-3.718z" />
          </svg>
        );
      })}
    </div>
  );
}
