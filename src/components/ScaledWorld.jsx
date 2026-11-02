import { useEffect, useRef, useState } from "react";

import "../styles/Platformer.css";

// A fixed-size game world (width x height logical px) that scales to fit its container.
// `toScreenRef.current(wx, wy)` converts world coordinates to screen pixels (for pixel effects).
function ScaledWorld({ width, height, toScreenRef, children, className = "" }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / width, 1.4)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  useEffect(() => {
    if (!toScreenRef) return;
    toScreenRef.current = (wx, wy) => {
      const r = wrapRef.current.getBoundingClientRect();
      return { x: r.left + wx * scale, y: r.top + wy * scale };
    };
  });

  return (
    <div className="plat-wrap" ref={wrapRef} style={{ height: height * scale }}>
      <div className={`plat-world ${className}`} style={{ width, height, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

export default ScaledWorld;
