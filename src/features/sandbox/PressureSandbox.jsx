import { useEffect, useRef, useState } from "react";

import AnimatedAvatar from "../../components/AnimatedAvatar";
import PixelWater from "../../components/PixelWater";
import ScaledWorld from "../../components/ScaledWorld";
import { AVATAR_POSES } from "../../data/avatarAssets";
import * as fx from "../../utils/pixelFx";
import { playSfx } from "../../utils/sfx";
import { useGameKeys } from "../../utils/useGameKeys";

const POSE = Object.fromEntries(AVATAR_POSES.map((p) => [p.label, p.row]));
const W = 800;
const H = 450;
const SURFACE = 110; // water surface = top of the dock
const TANK_X = 210;
const METER = 10; // px per metre of depth
const G = 9.81;
const ATMOSPHERE = 101.3; // kPa

export const PRESSURE_FLUIDS = [
  { id: "water", name: "Fresh water", rho: 1000, color: "#4ca9c7" },
  { id: "sea", name: "Seawater", rho: 1025, color: "#2f7fa3" },
  { id: "oil", name: "Olive oil", rho: 920, color: "#d7a85f" },
  { id: "brine", name: "Salt brine", rho: 1200, color: "#3f9d8f" },
  { id: "mercury", name: "Mercury", rho: 13600, color: "#9aa5ad" },
];

// Free play: jump off the dock and swim around; the gauge shows the pressure where you are.
function PressureSandbox({ spriteId }) {
  const [fluidId, setFluidId] = useState("water");
  const [absolute, setAbsolute] = useState(false);
  const [snap, setSnap] = useState(null);
  const keys = useGameKeys();
  const toScreen = useRef(null);
  const fluid = PRESSURE_FLUIDS.find((f) => f.id === fluidId);

  useEffect(() => {
    const p = { x: 70, y: SURFACE, vx: 0, vy: 0, face: 1, ground: true, wet: false };
    let last = performance.now();
    let frameId;
    let lastBubble = 0;

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      const { keys: held, pressed } = keys.current;
      const dir = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
      if (dir) p.face = dir;
      const prevY = p.y;

      if (!p.wet) {
        p.vx = dir * 170;
        if (pressed.has("up") && p.ground) { p.vy = -540; p.ground = false; }
        p.vy += 1400 * dt;
      } else {
        p.vx = dir * 130;
        p.vy += 260 * dt; // slowly sinks
        if (held.has("up")) p.vy -= 900 * dt;
        if (held.has("down")) p.vy += 700 * dt;
        p.vy = Math.max(-170, Math.min(170, p.vy)) * 0.99;
      }

      p.x = Math.max(16, Math.min(W - 16, p.x + p.vx * dt));
      p.y += p.vy * dt;

      if (p.y > SURFACE + 6 && p.x < TANK_X + 14) p.x = TANK_X + 14; // the dock's wall
      p.ground = false;
      if (p.vy >= 0 && p.x <= TANK_X + 6 && prevY <= SURFACE + 0.5 && p.y >= SURFACE) {
        p.y = SURFACE; p.vy = 0; p.ground = true;
      }
      p.y = Math.min(p.y, H - 6);

      // entering / leaving the water
      const wet = p.x > TANK_X + 8 && p.y - 28 > SURFACE;
      if (wet !== p.wet) {
        const s = toScreen.current?.(p.x, SURFACE);
        if (s) { fx.splash(s.x, s.y, fluid.color); playSfx("splash", 0.4); }
        p.wet = wet;
        if (wet) p.vy *= 0.4;
      }
      if (p.wet && (dir || Math.abs(p.vy) > 40) && now - lastBubble > 140) {
        lastBubble = now;
        const s = toScreen.current?.(p.x, p.y - 36);
        if (s) fx.bubbles(s.x, s.y, 2);
      }

      pressed.clear();
      const depth = Math.max(0, (p.y - 28 - SURFACE) / METER);
      const moving = dir !== 0 || (p.wet && Math.abs(p.vy) > 30);
      setSnap({
        x: p.x, y: p.y, face: p.face, depth, wet: p.wet,
        pose: !p.wet && !p.ground ? "Jump" : moving ? "Walk" : "Idle",
      });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [keys, fluid.color]);

  const depth = snap?.depth ?? 0;
  const gauge = (fluid.rho * G * depth) / 1000; // kPa
  const shown = gauge + (absolute ? ATMOSPHERE : 0);
  const arrow = 9 + Math.min(gauge / 40, 20);

  return (
    <div>
      <div className="sandbox-controls">
        <label>
          Liquid{" "}
          <select className="form-select" value={fluidId} onChange={(e) => { setFluidId(e.target.value); e.target.blur(); }}>
            {PRESSURE_FLUIDS.map((f) => <option key={f.id} value={f.id}>{f.name} (ρ = {f.rho})</option>)}
          </select>
        </label>
        <label className="sandbox-check">
          <input type="checkbox" checked={absolute} onChange={(e) => { setAbsolute(e.target.checked); e.target.blur(); }} />
          {" "}Include the atmosphere (+{ATMOSPHERE} kPa)
        </label>
      </div>

      <div className="plat-hud">
        <div>
          Depth: <strong>{depth.toFixed(1)} m</strong>
          <div>P = ρ·g·h = {fluid.rho} × {G} × {depth.toFixed(1)}</div>
        </div>
        <div className="plat-hud-item">
          {absolute ? "Absolute" : "Gauge"} pressure
          <div className="sandbox-big">{shown.toFixed(1)} kPa</div>
        </div>
      </div>

      <ScaledWorld width={W} height={H} toScreenRef={toScreen}>
        <div className="sb-sky" />
        <div className="sb-dock" style={{ width: TANK_X, top: SURFACE, height: H - SURFACE }} />
        <div className="plat-tank sb-tank" style={{ left: TANK_X, top: SURFACE - 25, width: W - TANK_X, height: H - SURFACE + 25 }}>
          <PixelWater color={fluid.color} width={118} height={72} />
          <div className="sb-dark" style={{ opacity: Math.min(depth / 45, 0.55) }} />
        </div>
        <svg className="sb-ruler" width={W} height={H} aria-hidden="true">
          {Array.from({ length: 31 }, (_, m) => m).filter((m) => m % 5 === 0).map((m) => (
            <g key={m}>
              <line x1={TANK_X} x2={TANK_X + 22} y1={SURFACE + m * METER} y2={SURFACE + m * METER} stroke="#f7f3e6" strokeWidth="3" />
              <text x={TANK_X + 28} y={SURFACE + m * METER + 4} fontSize="12" fill="#f7f3e6">{m} m</text>
            </g>
          ))}
        </svg>

        {snap && (
          <>
            {snap.wet && [0, 90, 180, 270].map((deg) => (
              <span
                key={deg}
                className="sb-arrow"
                style={{
                  left: snap.x, top: snap.y - 28, fontSize: arrow,
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateX(${40 + arrow / 2}px) rotate(180deg)`,
                }}
              >▶</span>
            ))}
            <div className="plat-player" style={{ left: snap.x - 28, top: snap.y - 56 }}>
              <div style={{ transform: snap.face < 0 ? "scaleX(-1)" : undefined }}>
                <AnimatedAvatar spriteId={spriteId} row={POSE[snap.pose]} animate size={56} />
              </div>
            </div>
          </>
        )}
      </ScaledWorld>

      <p className="plat-help">
        <kbd>A</kbd>/<kbd>D</kbd> move · <kbd>W</kbd>/<kbd>Space</kbd> jump (swim up in water) · <kbd>S</kbd> swim down.
        Jump off the dock, dive deep, and watch the pressure arrows grow.
      </p>
    </div>
  );
}

export default PressureSandbox;
