import { useEffect, useRef } from "react";

const MAP = {
  a: "left", A: "left", ArrowLeft: "left",
  d: "right", D: "right", ArrowRight: "right",
  w: "up", W: "up", ArrowUp: "up", " ": "up",
  s: "down", S: "down", ArrowDown: "down",
  e: "act", E: "act",
};

// Keyboard state for the character: ref.current = { keys: Set (held), pressed: Set (this frame) }.
// Call ref.current.pressed.clear() at the end of every frame.
export function useGameKeys() {
  const state = useRef({ keys: new Set(), pressed: new Set() });

  useEffect(() => {
    const s = state.current;
    const down = (e) => {
      const k = MAP[e.key];
      if (!k || e.target.closest?.("input, textarea, select") || document.querySelector(".summary-overlay")) return;
      e.preventDefault();
      if (!s.keys.has(k)) s.pressed.add(k);
      s.keys.add(k);
    };
    const up = (e) => MAP[e.key] && s.keys.delete(MAP[e.key]);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return state;
}
