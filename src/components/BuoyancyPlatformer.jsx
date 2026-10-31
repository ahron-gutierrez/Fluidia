import { useEffect, useRef, useState } from "react";

import AnimatedAvatar from "./AnimatedAvatar";
import PixelWater from "./PixelWater";
import SpriteSlot from "./SpriteSlot";
import { AVATAR_POSES } from "../data/avatarAssets";
import { playSfx } from "../utils/sfx";
import "../styles/Platformer.css";

const POSE = Object.fromEntries(AVATAR_POSES.map((p) => [p.label, p.row]));

// World is 800 x 450 logical px (scaled to fit the screen).
const W = 800;
const H = 450;
const SURFACE = 370; // water surface y
const TANK_X = 420; // tank spans x = TANK_X..W
const ITEM = 36; // object box size
const GRAVITY = 1400;
const SPEED = 180;
const JUMP = 540;
const TOLERANCE = 0.06; // how close the submerged fraction must be to the target

// One-way platforms (stand on top; jump up through them). y = top surface.
const PLATFORMS = [
  { x: 0, y: 320, w: 420, floor: true },
  { x: 455, y: 320, w: 80 },
  { x: 575, y: 320, w: 80 },
  { x: 695, y: 320, w: 80 },
  { x: 40, y: 235, w: 110 },
  { x: 200, y: 180, w: 110 },
  { x: 340, y: 235, w: 75 },
];
const SPAWN = { x: 60, y: 320 };
const SLOTS = [
  { x: 110, y: 320 }, { x: 320, y: 320 }, { x: 95, y: 235 }, { x: 255, y: 180 }, { x: 377, y: 235 },
];

export const MATERIALS = {
  cork: { name: "Cork", rho: 240, icon: "🍾", color: "#c9a06b" },
  pine: { name: "Pine wood", rho: 500, icon: "🪵", color: "#b9824f" },
  oak: { name: "Oak wood", rho: 750, icon: "🌳", color: "#8a5a35" },
  ice: { name: "Ice", rho: 917, icon: "🧊", color: "#bfe6f2" },
  rubber: { name: "Rubber", rho: 1100, icon: "⚫", color: "#6b6b75" },
  brick: { name: "Brick", rho: 1900, icon: "🧱", color: "#b5654a" },
  aluminum: { name: "Aluminum", rho: 2700, icon: "🥫", color: "#c4ccd2" },
  steel: { name: "Steel", rho: 7800, icon: "⚙️", color: "#7f8a93" },
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// round = { fluid: {name, rho, color}, target, right, decoys }
function BuoyancyPlatformer({ round, spriteId, solved, onResult }) {
  const [layout] = useState(() => {
    const slots = shuffle(SLOTS);
    return shuffle([round.right, ...round.decoys]).map((id, i) => ({ id, ...MATERIALS[id], home: slots[i] }));
  });
  const [snap, setSnap] = useState(null);
  const [scale, setScale] = useState(1);
  const wrapRef = useRef(null);
  const solvedRef = useRef(solved);
  const resultRef = useRef(onResult);

  useEffect(() => {
    solvedRef.current = solved;
    resultRef.current = onResult;
  });

  // Fit the 800x450 world to the available width.
  useEffect(() => {
    const el = wrapRef.current;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / W, 1.4)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The game loop.
  useEffect(() => {
    const g = {
      p: { x: SPAWN.x, y: SPAWN.y, vx: 0, vy: 0, ground: true, face: 1 },
      items: layout.map((o) => ({ ...o, x: o.home.x, y: o.home.y, vy: 0, state: "ground", frac: 0 })),
      heldId: null,
      keys: new Set(),
      pressed: new Set(),
      pose: null,
    };
    const timers = [];
    const sendBack = (it) => Object.assign(it, { state: "ground", x: it.home.x, y: it.home.y, vy: 0 });

    const keyMap = {
      a: "left", A: "left", ArrowLeft: "left", d: "right", D: "right", ArrowRight: "right",
      w: "jump", W: "jump", ArrowUp: "jump", " ": "jump", e: "act", E: "act",
    };
    const down = (e) => {
      const k = keyMap[e.key];
      if (!k || e.target.closest?.("input, textarea, select") || document.querySelector(".summary-overlay")) return;
      e.preventDefault();
      if (!g.keys.has(k)) g.pressed.add(k);
      g.keys.add(k);
    };
    const up = (e) => keyMap[e.key] && g.keys.delete(keyMap[e.key]);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const resolveDrop = (it, now) => {
      const frac = it.rho / round.fluid.rho;
      const sinks = frac >= 1;
      it.state = sinks ? "sunk" : "floating";
      it.frac = Math.min(frac, 1);
      it.y = sinks ? H - 4 : SURFACE + it.frac * ITEM;
      playSfx("splash");
      const good = !sinks && Math.abs(frac - round.target) <= TOLERANCE;
      if (good) {
        solvedRef.current = true;
        g.pose = { name: "Jump", until: Infinity };
      } else {
        g.pose = { name: "Shocked", until: now + 900 };
        timers.push(setTimeout(() => sendBack(it), 1800));
      }
      resultRef.current({ name: it.name, rho: it.rho, frac, sinks, good });
    };

    let last = performance.now();
    let frameId;

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      const p = g.p;
      const prevY = p.y;

      // --- player ---
      p.vx = (g.keys.has("right") ? SPEED : 0) - (g.keys.has("left") ? SPEED : 0);
      if (p.vx) p.face = p.vx > 0 ? 1 : -1;
      if (g.pressed.has("jump") && p.ground) {
        p.vy = -JUMP;
        p.ground = false;
      }
      p.vy += GRAVITY * dt;
      p.y += p.vy * dt;
      p.x = clamp(p.x + p.vx * dt, 16, W - 16);
      p.ground = false;
      if (p.vy >= 0) {
        for (const pl of PLATFORMS) {
          if (p.x >= pl.x - 6 && p.x <= pl.x + pl.w + 6 && prevY <= pl.y + 0.5 && p.y >= pl.y) {
            p.y = pl.y;
            p.vy = 0;
            p.ground = true;
            break;
          }
        }
      }
      if (p.y > H - 10) {
        // fell into the tank: back to the start
        Object.assign(p, { x: SPAWN.x, y: SPAWN.y, vy: 0, ground: true });
        const held = g.items.find((i) => i.id === g.heldId);
        if (held) sendBack(held);
        g.heldId = null;
        resultRef.current({ fell: true });
      }

      // --- pick up / drop with E ---
      if (g.pressed.has("act") && !solvedRef.current) {
        const held = g.items.find((i) => i.id === g.heldId);
        if (held) {
          Object.assign(held, { state: "falling", x: p.x, y: p.y - 62, vy: 0 });
          g.heldId = null;
          playSfx("drop");
        } else {
          const near = g.items
            .filter((i) => i.state === "ground" && Math.abs(i.x - p.x) <= 44 && Math.abs(i.y - p.y) <= 60)
            .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
          if (near) {
            near.state = "held";
            g.heldId = near.id;
            g.pose = { name: "Punch", until: now + 300 };
            playSfx("pickup");
          }
        }
      }
      g.pressed.clear();

      // --- objects ---
      for (const it of g.items) {
        if (it.state === "held") {
          it.x = p.x;
          it.y = p.y - 62;
        } else if (it.state === "falling") {
          const prev = it.y;
          it.vy += GRAVITY * 0.8 * dt;
          it.y += it.vy * dt;
          if (it.x >= TANK_X && it.x <= W - 8) {
            if (it.y >= SURFACE) resolveDrop(it, now);
          } else {
            const pl = PLATFORMS.find((q) => it.x >= q.x && it.x <= q.x + q.w && prev <= q.y && it.y >= q.y);
            if (pl) Object.assign(it, { state: "ground", y: pl.y, vy: 0 });
            else if (it.y > H) sendBack(it);
          }
        }
      }

      // --- snapshot for rendering ---
      let pose = "Idle";
      if (g.pose && now < g.pose.until) pose = g.pose.name;
      else if (!p.ground) pose = "Jump";
      else if (p.vx) pose = "Walk";
      const held = g.items.find((i) => i.id === g.heldId);
      const near =
        held ?? g.items.find((i) => i.state === "ground" && Math.abs(i.x - p.x) <= 60 && Math.abs(i.y - p.y) <= 60);
      setSnap({
        p: { x: p.x, y: p.y, face: p.face, pose },
        items: g.items.map(({ id, icon, color, name, x, y, state, frac }) => ({ id, icon, color, name, x, y, state, frac })),
        heldId: g.heldId,
        near: near ? { name: near.name, rho: near.rho } : null,
      });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [layout, round]);

  const { fluid, target } = round;

  return (
    <div>
      <div className="plat-hud">
        <div>
          <strong>{fluid.name}</strong> · ρ = {fluid.rho} kg/m³
          <div>Goal: find the object that floats with about <strong>{Math.round(target * 100)}%</strong> of its volume underwater.</div>
        </div>
        <div className="plat-hud-item">
          {snap?.near ? (
            <>
              {snap.heldId ? "Holding" : "Near"}: <strong>{snap.near.name}</strong>
              <div>ρ = {snap.near.rho} kg/m³</div>
            </>
          ) : (
            <span>Walk up to an object to inspect it.</span>
          )}
        </div>
      </div>

      <div className="plat-wrap" ref={wrapRef} style={{ height: H * scale }}>
        <div className="plat-world" style={{ width: W, height: H, transform: `scale(${scale})` }}>
          <SpriteSlot src="/lobby/lab-background.png" label="lab-background.png" className="plat-bg" />

          <div className="plat-tank" style={{ left: TANK_X, top: SURFACE, width: W - TANK_X, height: H - SURFACE }}>
            <PixelWater color={fluid.color} width={114} height={24} />
          </div>

          {PLATFORMS.map((pl) => (
            <div key={`${pl.x}-${pl.y}`} className={pl.floor ? "plat-floor" : "plat-plank"}
              style={{ left: pl.x, top: pl.y, width: pl.w, height: pl.floor ? H - pl.y : 10 }} />
          ))}

          {snap?.items.map((it) => (
            <div key={it.id} className={`plat-item ${it.state}`} style={{ left: it.x - ITEM / 2, top: it.y - ITEM, background: it.color }}>
              {it.icon}
              {(it.state === "floating" || it.state === "sunk") && it.frac > 0 && (
                <span className="plat-item-tag">{Math.round(it.frac * 100)}%</span>
              )}
            </div>
          ))}

          {snap && (
            <div className="plat-player" style={{ left: snap.p.x - 28, top: snap.p.y - 56 }}>
              <div style={{ transform: snap.p.face < 0 ? "scaleX(-1)" : undefined }}>
                <AnimatedAvatar spriteId={spriteId} row={POSE[snap.p.pose]} animate size={56} />
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="plat-help">
        <kbd>A</kbd>/<kbd>D</kbd> move · <kbd>W</kbd>/<kbd>Space</kbd> jump · <kbd>E</kbd> pick up / drop. Drop objects
        while standing over the tank!
      </p>
    </div>
  );
}

export default BuoyancyPlatformer;
