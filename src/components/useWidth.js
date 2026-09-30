import { useEffect, useRef, useState } from "react";

// Measure a container so charts draw at real pixel size (text stays readable on phones).
export default function useWidth(fallback = 640) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(Math.floor(entry.contentRect.width), 280)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}
