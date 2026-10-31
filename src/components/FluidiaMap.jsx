import { useEffect, useRef, useState } from "react";

import AnimatedAvatar from "./AnimatedAvatar";
import SpriteSlot from "./SpriteSlot";
import { AVATAR_POSES, DEFAULT_AVATAR_ID } from "../data/avatarAssets";
import { MAP_LOCATIONS } from "../data/mapLocations";
import "../styles/Map.css";

const IDLE_ROW = AVATAR_POSES.find((p) => p.label === "Idle").row;
const WALK_ROW = AVATAR_POSES.find((p) => p.label === "Walk").row;

const BOUNDS = { minX: 3, maxX: 97, minY: 8, maxY: 96 };
const SPEED = 30; // % of map per second
const NEAR = 9; // how close counts as "at" a location
const ASPECT = 1.6; // map is 16:10, so x% is wider than y%

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const distance = (a, b) => Math.hypot((a.x - b.x) * ASPECT, a.y - b.y);

const loadVisited = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(`fluidia-map-visited-${userId}`)) ?? [];
  } catch {
    return [];
  }
};

function FluidiaMap({ userId, spriteId, onNearbyChange }) {
  const sprite = spriteId ?? DEFAULT_AVATAR_ID;

  const [pos, setPos] = useState({ x: 50, y: 48 });
  const [walking, setWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [visited, setVisited] = useState(() => loadVisited(userId));

  const posRef = useRef(pos);
  const keysRef = useRef(new Set());
  const targetRef = useRef(null);
  const mapRef = useRef(null);

  const nearby = MAP_LOCATIONS.find((loc) => distance(loc, pos) <= NEAR) ?? null;

  // Tell the parent which location (if any) the avatar is standing at.
  const nearbyId = nearby?.id ?? null;
  useEffect(() => {
    onNearbyChange?.(nearby);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearbyId]);

  // Remember each location the first time you reach it.
  useEffect(() => {
    if (!nearby || visited.includes(nearby.id)) return;
    const next = [...visited, nearby.id];
    setVisited(next);
    try {
      localStorage.setItem(`fluidia-map-visited-${userId}`, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [nearby, visited, userId]);

  // Keyboard: arrows / WASD.
  useEffect(() => {
    const dirs = {
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right",
      ArrowUp: "up", w: "up", W: "up",
      ArrowDown: "down", s: "down", S: "down",
    };
    const blocked = (e) =>
      e.target.closest?.("input, textarea, select") || document.querySelector(".avatar-editor-overlay");

    const down = (e) => {
      if (!dirs[e.key] || blocked(e)) return;
      e.preventDefault();
      targetRef.current = null;
      keysRef.current.add(dirs[e.key]);
    };
    const up = (e) => dirs[e.key] && keysRef.current.delete(dirs[e.key]);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Movement loop.
  useEffect(() => {
    let frameId;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const keys = keysRef.current;
      let dx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
      let dy = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);

      const target = targetRef.current;
      if (target && !dx && !dy) {
        const tx = target.x - posRef.current.x;
        const ty = target.y - posRef.current.y;
        const dist = Math.hypot(tx, ty);
        if (dist < 0.6) targetRef.current = null;
        else {
          dx = tx / dist;
          dy = ty / dist;
        }
      } else if (dx || dy) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
      }

      const moving = dx !== 0 || dy !== 0;
      if (moving) {
        const next = {
          x: clamp(posRef.current.x + dx * SPEED * dt, BOUNDS.minX, BOUNDS.maxX),
          y: clamp(posRef.current.y + dy * SPEED * dt * ASPECT * 0.8, BOUNDS.minY, BOUNDS.maxY),
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
  }, []);

  const walkTo = (clientX, clientY) => {
    const rect = mapRef.current.getBoundingClientRect();
    targetRef.current = {
      x: clamp(((clientX - rect.left) / rect.width) * 100, BOUNDS.minX, BOUNDS.maxX),
      y: clamp(((clientY - rect.top) / rect.height) * 100, BOUNDS.minY, BOUNDS.maxY),
    };
  };

  return (
    <div className="fluidia-map-wrap">
      <div className="fluidia-map-topbar">
        <span>Explored: <strong>{visited.length}/{MAP_LOCATIONS.length}</strong></span>
        <small>Move with WASD / arrows, or tap the map. Visit places to learn about fluids!</small>
      </div>

      <div
        className="fluidia-map"
        ref={mapRef}
        onPointerDown={(e) => {
          if (e.target.closest("a, button")) return;
          walkTo(e.clientX, e.clientY);
        }}
      >
        <SpriteSlot src="/map/background.png" label="map/background.png" className="fluidia-map-bg" />

        {MAP_LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            type="button"
            className={`fluidia-pin${visited.includes(loc.id) ? " visited" : ""}${nearby?.id === loc.id ? " active" : ""}`}
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            onClick={() => (targetRef.current = { x: loc.x, y: Math.min(loc.y + 7, BOUNDS.maxY) })}
            aria-label={`Walk to ${loc.name}`}
          >
            <span className="fluidia-pin-icon">{loc.icon}</span>
            <span className="fluidia-pin-name">{loc.name}</span>
          </button>
        ))}

        <div
          className="fluidia-map-avatar"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: Math.round(pos.y) + 5 }}
        >
          <div style={{ transform: facingLeft ? "scaleX(-1)" : undefined }}>
            <AnimatedAvatar spriteId={sprite} row={walking ? WALK_ROW : IDLE_ROW} animate={walking} size={56} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default FluidiaMap;
