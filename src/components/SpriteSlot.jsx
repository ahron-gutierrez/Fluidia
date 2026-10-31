import { useState } from "react";

// Shows your PNG; if the file isn't there yet, shows a labeled placeholder box.
function SpriteSlot({ src, label, className = "" }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return <div className={`sprite-slot-placeholder ${className}`}>{label}</div>;
  }

  return (
    <img
      className={`sprite-slot-img ${className}`}
      src={src}
      alt={label}
      draggable={false}
      onError={() => setMissing(true)}
    />
  );
}

export default SpriteSlot;
