import { useEffect, useRef, useState } from "react";

export default function BookCarousel3D({ books = [], onSelect, selectedId }) {
  const wrapRef = useRef(null);
  const [centerIdx, setCenterIdx] = useState(0);

  /** Detect which card is closest to the viewport centre */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollLeft, offsetWidth } = el;
      const center = scrollLeft + offsetWidth / 2;

      // find item whose middle is nearest to centre
      const children = Array.from(el.children);
      let closest = 0;
      let smallestDist = Infinity;

      children.forEach((child, idx) => {
        const { offsetLeft, offsetWidth } = child;
        const childCenter = offsetLeft + offsetWidth / 2;
        const dist = Math.abs(center - childCenter);
        if (dist < smallestDist) {
          smallestDist = dist;
          closest = idx;
        }
      });
      setCenterIdx(closest);
    };

    handleScroll();                 // initial
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="flex overflow-x-auto gap-6 px-4 py-6 snap-x snap-mandatory 
                 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
    >
      {books.map((b, idx) => {
        const isCenter = idx === centerIdx;
        return (
          <div
            key={b._id}
            onClick={() => onSelect(b._id)}
            className={`snap-center flex-shrink-0 cursor-pointer 
                        transition-transform duration-300
                        ${isCenter ? "scale-110 z-20" : "scale-90"} 
                        ${isCenter ? "rotate-y-0" : idx < centerIdx ? "-rotate-y-6" : "rotate-y-6"}
                        perspective-1000`}
            style={{ width: "150px" }}       /* equal width */
          >
            <img
              src={b.imageUrl}
              alt={b.title}
              className="w-full h-56 object-cover rounded-lg shadow-lg"
            />
            {/* tick badge */}
            {selectedId === b._id && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                ✓
              </div>
            )}
            <div className="mt-2 text-center">
              <p className="text-sm font-medium truncate">{b.title}</p>
              <p className="text-xs text-gray-500 truncate">{b.author}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
