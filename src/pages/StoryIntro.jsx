import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AnimatedAvatar from "../components/AnimatedAvatar";
import SpriteSlot from "../components/SpriteSlot";
import { DEFAULT_AVATAR_ID, AVATAR_POSES } from "../data/avatarAssets";
import { getAvatar, getCurrentUser, getProgress } from "../data/gameData";
import "../styles/Lobby.css";

//fun
import BackgroundMusicIntro from "../components/BgMusic";

const IDLE_ROW = AVATAR_POSES.find((p) => p.label === "Idle").row;
const WALK_ROW = AVATAR_POSES.find((p) => p.label === "Walk").row;

// Stage coordinates are percentages of the lobby stage.
const FLOOR = { minX: 5, maxX: 95, minY: 60, maxY: 92 };
const CURTAIN_MS = 800; // curtain fall / scroll-away duration
const WELCOME_MS = 1800; // how long "Welcome" is shown
const SPEED = 38; // % of stage per second
const NEAR_DISTANCE = 9; // how close (in % x) you must be to a door

// Where you appear in each scene (% of stage).
const SPAWN = {
  outside: { x: 26, y: 87 },
  exit: { x: 38, y: 80 }, // just outside the castle gate, after leaving through the Exit door
  account: { x: 20, y: 68 }, // in front of the Edit Account door, after leaving that page // story starts outside the castle
  inside: { x: 50, y: 88 }, // just inside the entrance
};

// Outside scene: only the castle entrance. Walk up and enter to reveal the lobby.
const OUTSIDE_DOORS = [
  // Quizzes: always open. Re-uses the laboratory sprite (swap in your own PNG later).
  { id: "quiz", label: "Quiz Hall", x: 12, src: "/lobby/laboratory.png", png: "laboratory.png", house: true, route: "/quiz" },
  { id: "castle", label: "Enter Castle", x: 38, src: "/lobby/castle.png", png: "castle.png", large: true },
  // Unlocks after the first quest (Hydrostatic Pressure) is completed.
  {
    id: "plumber", label: "Plumber House", x: 66, src: "/lobby/plumber-house.png", png: "plumber-house.png",
    house: true, route: "/quest/plumber-house",
    lockHint: "Finish the Hydrostatic Pressure quest to unlock the Plumber House.",
  },
  // Unlocks after the Plumber quest is completed.
  {
    id: "lab", label: "Laboratory", x: 87, src: "/lobby/laboratory.png", png: "laboratory.png",
    house: true, route: "/quest/laboratory",
    lockHint: "Finish the Plumber quest to unlock the Laboratory.",
  },
];

// Inside scene. x = door center (% of stage width). src = PNG you drop into /public/lobby.
const INSIDE_DOORS = [
  { id: "account", label: "Edit Account", x: 20, src: "/lobby/door-account.png" },
  { id: "quest", label: "Quest", x: 50, src: "/lobby/door-quest.png" },
  { id: "exit", label: "Exit", x: 80, src: "/lobby/door-exit.png" },
];

// Your own characters. Add more entries to place more. idk why i bother adding this if im the only one reading it
// x / y = feet position (% of stage). src = PNG you drop into /public/lobby.
const CHARACTERS = [
  {
    id: "custom",
    name: "Waffles Fox",
    x: 32,
    y: 78,
    src: "/lobby/character.png",
    line: "Hello! Welcome to Fluidia~ Our Final Project for Calphy",
  },
  {
    id: "guide",
    name: "Pressure Guide",
    x: 63,
    y: 76,
    src: "/lobby/guide.png",
    line: "Hydrostatic pressure is the push of a fluid's weight: the deeper you go, the harder it pushes. Step through the Quest door and test it!",
  },
  {
    id: "labnpc",
    scene: "outside",
    show: "labInvite",
    arrive: true,
    name: "Lab Assistant",
    x: 77,
    y: 84,
    src: "/lobby/lab-assistant.png",
    line: "Hey, you've been a good help, I've heard. Will you come help me inside our laboratory?",
  },
];
const TALK_DISTANCE = 12;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function StoryIntro() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  // Coming back from the Edit Account page: stand in front of that door, inside the castle.
  const cameFromAccount = location.state?.spawn === "account";

  const avatar = currentUser ? getAvatar(currentUser.id) : null;
  const spriteId = avatar?.spriteId ?? DEFAULT_AVATAR_ID;

  const [scene, setScene] = useState(cameFromAccount ? "inside" : "outside"); // "outside" | "inside"
  const [pos, setPos] = useState(cameFromAccount ? SPAWN.account : SPAWN.outside);
  const [walking, setWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);

  // Castle transition: null -> "cover" -> "welcome" -> "reveal" -> null
  const [phase, setPhase] = useState(null);
  const phaseRef = useRef(null);
  const timersRef = useRef([]);

  const goToPhase = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const posRef = useRef(cameFromAccount ? SPAWN.account : SPAWN.outside);
  const keysRef = useRef(new Set());
  const targetRef = useRef(null); // click/tap-to-walk destination
  const stageRef = useRef(null);

  const inside = scene === "inside";
  const progress = currentUser ? getProgress(currentUser.id) : null;
  const completed = progress?.completedQuests ?? [];
  const plumberUnlocked = completed.includes("village-beneath-water");
  const plumberDone = completed.includes("windmills-secret");
  const labDone = completed.includes("sunken-cargo");
  const labInvite = plumberDone && !labDone; // the lab assistant steps outside to invite you

  const doors = inside
    ? INSIDE_DOORS
    : OUTSIDE_DOORS.map((d) => {
        if (d.id === "plumber") return { ...d, locked: !plumberUnlocked, fresh: plumberUnlocked && !plumberDone };
        if (d.id === "lab") return { ...d, locked: !plumberDone, fresh: plumberDone && !labDone };
        return d;
      });
  const characters = CHARACTERS.filter(
    (c) => (c.scene ?? "inside") === scene && (c.show !== "labInvite" || labInvite),
  );

  const nearCharacter =
    characters.find(
      (c) => Math.hypot((c.x - pos.x), (c.y - pos.y) * 1.5) <= TALK_DISTANCE,
    ) ?? null;

  const nearDoor =
    doors.find((door) => Math.abs(door.x - pos.x) <= NEAR_DISTANCE) ?? null;

  const enterDoor = useCallback(
    (door) => {
      if (!door || door.locked || phaseRef.current) return;

      if (door.id === "castle") {
        targetRef.current = null;
        keysRef.current.clear();
        setWalking(false);
        goToPhase("cover"); // black curtain falls from the top
        timersRef.current.push(
          setTimeout(() => {
            // screen is fully black: swap to the inside scene
            posRef.current = SPAWN.inside;
            setPos(SPAWN.inside);
            setScene("inside");
            goToPhase("welcome");
          }, CURTAIN_MS),
          setTimeout(() => goToPhase("reveal"), CURTAIN_MS + WELCOME_MS),
          setTimeout(() => goToPhase(null), CURTAIN_MS + WELCOME_MS + CURTAIN_MS),
        );
      } else if (door.route) {
        targetRef.current = null;
        keysRef.current.clear();
        setWalking(false);
        goToPhase("cover"); // same curtain, then walk into the house
        timersRef.current.push(setTimeout(() => navigate(door.route), CURTAIN_MS));
      } else if (door.id === "exit") {
        targetRef.current = null;
        keysRef.current.clear();
        setWalking(false);
        goToPhase("cover"); // curtain falls, you reappear outside the castle gate
        timersRef.current.push(
          setTimeout(() => {
            posRef.current = SPAWN.exit;
            setPos(SPAWN.exit);
            setScene("outside");
            goToPhase("reveal");
          }, CURTAIN_MS),
          setTimeout(() => goToPhase(null), CURTAIN_MS * 2),
        );
      } else if (door.id === "account") {
        // remember where we left from, so Back (button or browser) returns to this door
        navigate("/intro", { replace: true, state: { spawn: "account" } });
        navigate("/account/edit", { state: { fromLobby: true } });
      } else if (door.id === "quest") {
        navigate("/quest/hydrostatic-pressure");
      }
    },
    [navigate],
  );

  // Keyboard: arrows / WASD to move, E / Enter / Space to use a door.
  useEffect(() => {
    if (!currentUser) return undefined;

    const moveKeys = {
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right",
      ArrowUp: "up", w: "up", W: "up",
      ArrowDown: "down", s: "down", S: "down",
    };

    const onKeyDown = (event) => {
      if (phaseRef.current) return;
      if (event.target.closest?.("input, textarea, select")) return;

      if (moveKeys[event.key]) {
        event.preventDefault();
        targetRef.current = null;
        keysRef.current.add(moveKeys[event.key]);
        return;
      }

      if (["e", "E", "Enter", " "].includes(event.key)) {
        const door = doors.find(
          (d) => Math.abs(d.x - posRef.current.x) <= NEAR_DISTANCE,
        );
        if (door) {
          event.preventDefault();
          enterDoor(door);
        }
      }
    };

    const onKeyUp = (event) => {
      if (moveKeys[event.key]) keysRef.current.delete(moveKeys[event.key]);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [currentUser, enterDoor, doors]);

  // Movement loop.
  useEffect(() => {
    if (!currentUser) return undefined;

    let frameId;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (phaseRef.current) {
        keysRef.current.clear();
        targetRef.current = null;
      }

      const keys = keysRef.current;
      let dx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
      let dy = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);

      const target = targetRef.current;
      if (target && dx === 0 && dy === 0) {
        const tx = target.x - posRef.current.x;
        const ty = target.y - posRef.current.y;
        const dist = Math.hypot(tx, ty);
        if (dist < 0.6) {
          targetRef.current = null;
        } else {
          dx = tx / dist;
          dy = ty / dist;
        }
      } else if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
      }

      const moving = dx !== 0 || dy !== 0;

      if (moving) {
        const next = {
          x: clamp(posRef.current.x + dx * SPEED * dt, FLOOR.minX, FLOOR.maxX),
          y: clamp(posRef.current.y + dy * SPEED * dt * 0.6, FLOOR.minY, FLOOR.maxY),
        };
        posRef.current = next;
        setPos(next);
        if (Math.abs(dx) > 0.05) setFacingLeft(dx < 0);
      }

      setWalking((prev) => (prev === moving ? prev : moving));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [currentUser]);

  const walkTo = (clientX, clientY) => {
    const rect = stageRef.current.getBoundingClientRect();
    targetRef.current = {
      x: clamp(((clientX - rect.left) / rect.width) * 100, FLOOR.minX, FLOOR.maxX),
      y: clamp(((clientY - rect.top) / rect.height) * 100, FLOOR.minY, FLOOR.maxY),
    };
  };

  if (!currentUser) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Access required</h1>
          <p>Please log in to enter the lobby.</p>
          <Link to="/login" className="btn btn-primary">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div
        className="lobby-stage"
        ref={stageRef}
        onPointerDown={(event) => {
          if (phaseRef.current || event.target.closest(".lobby-door")) return;
          walkTo(event.clientX, event.clientY);
        }}
      >
        {/* Background PNG placeholder (changes per scene) */}
        <SpriteSlot
          key={scene}
          src={inside ? "/lobby/background.png" : "/lobby/outside.png"}
          label={inside ? "background.png" : "outside.png"}
          className="lobby-background"
        />

        {/* Doors */}
        {doors.map((door) => (
          <button
            key={door.id}
            type="button"
            className={`lobby-door${door.large ? " lobby-door-large" : ""}${door.house ? " lobby-door-house" : ""}${door.locked ? " is-locked" : ""}${door.fresh ? " is-new" : ""}${nearDoor?.id === door.id ? " is-near" : ""}`}
            style={{ left: `${door.x}%` }}
            onClick={() =>
              nearDoor?.id === door.id
                ? enterDoor(door)
                : (targetRef.current = { x: door.x, y: FLOOR.minY })
            }
            aria-label={door.label}
          >
            <SpriteSlot
              src={door.src}
              label={door.png ?? `door-${door.id}.png`}
              className="lobby-door-sprite"
            />
            <span className="lobby-door-label">{door.locked ? "🔒 " : door.fresh ? "✨ " : ""}{door.label}</span>
          </button>
        ))}

        {/* Your characters (placeholder PNGs) */}
        {characters.map((c) => (
          <div
            key={c.id}
            className={`lobby-character${c.arrive ? " is-arriving" : ""}`}
            style={{ left: `${c.x}%`, top: `${c.y}%`, zIndex: Math.round(c.y) }}
          >
            {nearCharacter?.id === c.id && (
              <div className="lobby-speech">
                <strong>{c.name}</strong>: {c.line}
              </div>
            )}
            <SpriteSlot src={c.src} label={c.src.split("/").pop()} className="lobby-character-sprite" />
          </div>
        ))}

        {/* Player avatar (uses the player's chosen sprite sheet) */}
        <div
        
          className="lobby-avatar"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            zIndex: Math.round(pos.y),
          }}
        ><BackgroundMusicIntro track="home"/> 
          <div style={{ transform: facingLeft ? "scaleX(-1)" : undefined }}>
            <AnimatedAvatar
              spriteId={spriteId}
              row={walking ? WALK_ROW : IDLE_ROW}
              animate={walking}
              size={96}
            />
          </div>
        </div>

        {nearDoor && (
          <div className="lobby-prompt">
            {nearDoor.locked ? (
              <>🔒 Locked. {nearDoor.lockHint}</>
            ) : (
              <>Press <kbd>E</kbd> or tap the door to enter: {nearDoor.label}</>
            )}
          </div>
        )}
      </div>

      {phase &&
        createPortal(
          <div className={`lobby-curtain phase-${phase}`}>
            {phase === "welcome" && <span className="lobby-welcome">Welcome</span>}
          </div>,
          document.body,
        )}

      <p className="lobby-help">
        Move with <kbd>WASD</kbd> / arrow keys, or tap the floor to walk.
      </p>
    </main>
  );
}

export default StoryIntro;
