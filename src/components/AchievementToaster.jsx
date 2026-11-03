import { useEffect, useRef, useState } from "react";

import { ACHIEVEMENTS, RARITY } from "../data/achievements";
import * as fx from "../utils/pixelFx";
import { playSfx } from "../utils/sfx";
import "../styles/Achievements.css";

// Pops up "Achievement unlocked!" whenever one is earned, anywhere in the game.
function AchievementToaster() {
  const [queue, setQueue] = useState([]);
  const boxRef = useRef(null);
  const current = queue[0] ?? null; // the one on screen; the rest wait their turn

  useEffect(() => {
    const onUnlock = (event) => {
      const found = ACHIEVEMENTS.find((a) => a.id === event.detail.id);
      if (found) setQueue((list) => (list.some((a) => a.id === found.id) ? list : [...list, found]));
    };
    window.addEventListener("fluidia-achievement", onUnlock);
    return () => window.removeEventListener("fluidia-achievement", onUnlock);
  }, []);

  useEffect(() => {
    if (!current) return undefined;
    const legendary = current.rarity === "legendary";
    playSfx(legendary ? "fanfare" : "correct");

    const burst = setTimeout(() => {
      if (!boxRef.current) return;
      const c = fx.centerOf(boxRef.current);
      fx.sparkle(c.x, c.y, [RARITY[current.rarity].color, "#fff"]);
      if (legendary) {
        fx.confetti(c.x - 120, c.y + 60);
        fx.confetti(window.innerWidth / 2, window.innerHeight);
      }
    }, 450);
    const done = setTimeout(() => setQueue((list) => list.slice(1)), legendary ? 7000 : 4500);
    return () => { clearTimeout(burst); clearTimeout(done); };
  }, [current]);

  if (!current) return null;
  const rarity = RARITY[current.rarity];

  return (
    <div className="achievement-toast-wrap" role="status" aria-live="polite">
      <div ref={boxRef} className={`achievement-toast rarity-${current.rarity}`} style={{ "--rarity": rarity.color }}>
        <div className="achievement-icon">{current.icon}</div>
        <div>
          <div className="achievement-kicker">
            {current.rarity === "legendary" ? "★ LEGENDARY ACHIEVEMENT ★" : "Achievement unlocked!"}
          </div>
          <strong>{current.title}</strong>
          <div className="achievement-desc">{current.desc}</div>
          <div className="achievement-rarity">{rarity.label}</div>
        </div>
      </div>
    </div>
  );
}

export default AchievementToaster;
