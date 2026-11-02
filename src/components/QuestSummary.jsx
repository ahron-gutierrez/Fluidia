import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import AnimatedAvatar from "./AnimatedAvatar";
import { AVATAR_POSES } from "../data/avatarAssets";
import * as fx from "../utils/pixelFx";
import { playSfx } from "../utils/sfx";
import "../styles/Summary.css";

const JUMP_ROW = AVATAR_POSES.find((p) => p.label === "Jump").row;
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 53) % 20) / 10,
  color: ["#d7a85f", "#4ca9c7", "#6aa86b", "#c46b5f", "#fff"][i % 5],
}));

function useCountUp(target, startDelayMs, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / durationMs, 1);
        setValue(Math.round(target * (1 - (1 - t) ** 3)));
        if (t < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }, startDelayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [target, startDelayMs, durationMs]);

  return value;
}

// Full-screen "Quest Complete" screen. Your character overlays the card.
// summary: { completion, rounds, bonus, total }  (all 0 on a replay)
function QuestSummary({ title, spriteId, summary, totalRounds, firstTryRounds, before, after, replay, onContinue }) {
  const shownTotal = useCountUp(summary.total, 1900);
  const shownAccount = before + shownTotal;

  useEffect(() => {
    playSfx("fanfare");
    const w = window.innerWidth;
    const h = window.innerHeight;
    const timers = [
      setTimeout(() => {                                   // confetti cannons from the bottom corners
        fx.confetti(0, h, -Math.PI / 3, 0.7);
        fx.confetti(w, h, (-2 * Math.PI) / 3, 0.7);
      }, 500),
      setTimeout(() => {                                   // sparkle burst when the score lands
        fx.sparkle(w / 2, h / 2);
        fx.confetti(w / 2, h / 2);
        playSfx("correct");
      }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return createPortal(
    <div className="summary-overlay" role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div className="summary-confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span key={i} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, background: c.color }} />
        ))}
      </div>

      <div className="summary-hero">
        <AnimatedAvatar spriteId={spriteId} row={JUMP_ROW} animate size={160} />
      </div>

      <div className="pixel-panel summary-card">
        <p className="eyebrow accent">Quest complete!</p>
        <h2 id="summary-title" className="pixel-heading md">{title}</h2>

        {replay ? (
          <p className="summary-row" style={{ animationDelay: "0.6s" }}>
            You've cleared this quest before, so no new points this time. Nice practice!
          </p>
        ) : (
          <>
            <div className="summary-row" style={{ animationDelay: "0.6s" }}>
              <span>Quest cleared</span><strong>+{summary.completion}</strong>
            </div>
            <div className="summary-row" style={{ animationDelay: "1s" }}>
              <span>Rounds solved ({totalRounds} × 50)</span><strong>+{summary.rounds}</strong>
            </div>
            <div className="summary-row" style={{ animationDelay: "1.4s" }}>
              <span>First-try bonus ({firstTryRounds} × 50)</span><strong>+{summary.bonus}</strong>
            </div>
          </>
        )}

        <div className="summary-total" style={{ animationDelay: "1.8s" }}>
          <small>Total score added to your account</small>
          <div className="summary-total-number">+{shownTotal}</div>
          <small>Account score: {before} → <strong>{replay ? after : shownAccount}</strong></small>
        </div>

        <button type="button" className="btn btn-primary mt-3 summary-continue" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default QuestSummary;
