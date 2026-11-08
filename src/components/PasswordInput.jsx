import { useState } from "react";

import "../styles/PasswordInput.css";

// Pixel eye, drawn from a tiny bitmap. '#' = outline, 'o' = pupil.
const EYE = [
  "...######...",
  "..#......#..",
  ".#...oo...#.",
  "#....oo....#",
  ".#...oo...#.",
  "..#......#..",
  "...######...",
];
// the slash across the eye when the password is hidden
const SLASH = Array.from({ length: 12 }, (_, x) => [x, 6 - Math.round((x * 6) / 11)]);

function EyeIcon({ open }) {
  const rects = [];
  EYE.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell === "#") rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />);
      else if (cell === "o" && open) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#c46b5f" />);
    })
  );
  if (!open) {
    SLASH.forEach(([x, y]) => rects.push(<rect key={`s${x}`} x={x} y={y} width="1.2" height="1.2" fill="#c46b5f" />));
  }
  return (
    <svg viewBox="0 0 12 7" width="26" height="15" shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  );
}

// A password box with a show / hide eye button. Takes the same props as an <input>.
function PasswordInput({ className = "form-control", ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input {...inputProps} className={className} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

export default PasswordInput;
