import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import AnimatedAvatar from "./AnimatedAvatar";
import { AVATAR_POSES } from "../data/avatarAssets";
import * as fx from "../utils/pixelFx";
import { playSfx } from "../utils/sfx";

const WALK_ROW = AVATAR_POSES.find((p) => p.label === "Walk").row;

const SLIDE_MS = 2600; // avatar slides in + "Round N"
const START_MS = 1000; // "START!"
const EXIT_MS = 700; // everything slides off

// Full-screen "Round N ... START!" intro. Calls onDone when finished.
function RoundIntro({ round, spriteId, onDone }) {
  const [phase, setPhase] = useState("slide"); // "slide" -> "start" -> "exit"

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    playSfx("whoosh");
    const roundSfx = setTimeout(() => playSfx("round"), 500);
    const toStart = setTimeout(() => {
      setPhase("start");
      playSfx("start");
      fx.sparkle(window.innerWidth / 2, window.innerHeight / 2);
    }, SLIDE_MS);
    const toExit = setTimeout(() => {
      setPhase("exit");
      playSfx("whoosh");
    }, SLIDE_MS + START_MS);
    const done = setTimeout(() => onDoneRef.current(), SLIDE_MS + START_MS + EXIT_MS);

    return () => [roundSfx, toStart, toExit, done].forEach(clearTimeout);
  }, []);

  return createPortal(
    <div className={`round-intro phase-${phase}`}>
      <div className="round-intro-backdrop" />
      <div className="round-intro-stage">
        <div className="round-intro-avatar">
          <AnimatedAvatar spriteId={spriteId} row={WALK_ROW} animate size={160} />
        </div>
        {phase === "slide" && <div className="round-intro-title">Round {round}</div>}
        {phase !== "slide" && <div className="round-intro-start">START!</div>}
      </div>
    </div>,
    document.body,
  );
}

export default RoundIntro;
