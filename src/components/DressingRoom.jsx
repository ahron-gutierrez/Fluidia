import { useEffect, useRef, useState } from "react";

import AnimatedAvatar from "./AnimatedAvatar";
import { AVATAR_SPRITES, DEFAULT_AVATAR_ROW } from "../data/avatarAssets";
import { recordLookChange } from "../data/achievements";
import { getAvatar, setAvatar } from "../data/gameData";
import * as fx from "../utils/pixelFx";
import { playSfx } from "../utils/sfx";
import "../styles/DressingRoom.css";

const CLOSE_MS = 700; // curtain slides across
const HOLD_MS = 350; // closed, character swaps behind it

// Your character in a dressing room. The arrows close the curtain, change the
// character behind it, then open it again. Every change is saved straight away.
function DressingRoom({ userId }) {
  const saved = getAvatar(userId);
  const [index, setIndex] = useState(() =>
    Math.max(0, AVATAR_SPRITES.findIndex((sprite) => sprite.id === saved?.spriteId))
  );
  const [curtain, setCurtain] = useState("open"); // "open" | "closed"
  const busy = useRef(false);
  const timers = useRef([]);
  const stageRef = useRef(null);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const change = (direction) => {
    if (busy.current) return;
    busy.current = true;
    const next = (index + direction + AVATAR_SPRITES.length) % AVATAR_SPRITES.length;

    setCurtain("closed");
    playSfx("whoosh");
    timers.current.push(
      setTimeout(() => {
        setIndex(next); // swap while nobody can see
        setAvatar(userId, { spriteId: AVATAR_SPRITES[next].id, row: saved?.row ?? DEFAULT_AVATAR_ROW });
        recordLookChange(userId);
      }, CLOSE_MS + HOLD_MS / 2),
      setTimeout(() => {
        setCurtain("open");
        playSfx("whoosh");
      }, CLOSE_MS + HOLD_MS),
      setTimeout(() => {
        busy.current = false;
        if (stageRef.current) {
          const c = fx.centerOf(stageRef.current);
          fx.sparkle(c.x + 20, c.y);
        }
      }, CLOSE_MS * 2 + HOLD_MS)
    );
  };

  return (
    <section className="dressing-room" aria-label="Dressing room">
      <div className="dressing-stage" ref={stageRef}>
        <div className="dressing-wall" />
        <div className="dressing-floor" />
        <div className="dressing-podium" />
        <div className="dressing-avatar">
          <AnimatedAvatar spriteId={AVATAR_SPRITES[index].id} animate size={160} />
        </div>
        <div className="dressing-rod" />
        <div className={`dressing-curtain ${curtain}`} aria-hidden="true">
          <span className="dressing-tassel" />
        </div>
      </div>

      <div className="dressing-controls">
        <button type="button" className="dressing-arrow" onClick={() => change(-1)} aria-label="Previous character">
          ◀
        </button>
        <span className="dressing-count">Look {index + 1} / {AVATAR_SPRITES.length}</span>
        <button type="button" className="dressing-arrow" onClick={() => change(1)} aria-label="Next character">
          ▶
        </button>
      </div>
      <p className="dressing-note">Your look saves automatically.</p>
    </section>
  );
}

export default DressingRoom;
