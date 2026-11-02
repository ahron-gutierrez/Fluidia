import { useEffect, useRef, useState } from "react";

import AnimatedAvatar from "../../components/AnimatedAvatar";
import ScaledWorld from "../../components/ScaledWorld";
import { AVATAR_POSES } from "../../data/avatarAssets";
import * as fx from "../../utils/pixelFx";
import { playSfx } from "../../utils/sfx";
import { useGameKeys } from "../../utils/useGameKeys";

const POSE = Object.fromEntries(AVATAR_POSES.map((p) => [p.label, p.row]));
const W = 800;
const H = 450;
const GROUND = 385;
const PIPE_Y = 150;
const CM = 7; // px per cm of pipe diameter
const SECTION_X = [40, 280, 520]; // each section is 240px long
const SIZES = [4, 6, 8, 10, 12]; // cm
const SPEEDS = [1, 2, 3, 4, 5]; // m/s at the inlet
const P_IN = 300; // kPa at the start of the first section
const RHO = 1000;

// Stations the avatar can punch with E: the pump (inlet speed) and one valve per pipe section.
const STATIONS = [
  { id: "pump", x: 62, label: "Pump", icon: "⚙️" },
  { id: "v0", x: 160, label: "Valve 1", icon: "🔧" },
  { id: "v1", x: 400, label: "Valve 2", icon: "🔧" },
  { id: "v2", x: 640, label: "Valve 3", icon: "🔧" },
];

const dur = (v) => Math.max(1.6 / Math.max(v, 0.3), 0.1);

// Free play with pipe flow: change the pump and pipe widths, read speed and pressure everywhere.
function FlowSandbox({ spriteId }) {
  const [sizes, setSizes] = useState([10, 6, 8]);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [snap, setSnap] = useState(null);
  const keys = useGameKeys();
  const toScreen = useRef(null);
  const apply = useRef(null);

  // the loop calls this to change a setting
  useEffect(() => {
    apply.current = (id) => {
      if (id === "pump") setSpeedIdx((i) => (i + 1) % SPEEDS.length);
      else {
        const section = Number(id.slice(1));
        setSizes((s) => s.map((d, i) => (i === section ? SIZES[(SIZES.indexOf(d) + 1) % SIZES.length] : d)));
      }
    };
  });

  useEffect(() => {
    const p = { x: 110, y: GROUND, vx: 0, vy: 0, face: 1, ground: true };
    let pose = null;
    let last = performance.now();
    let frameId;

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      const { keys: held, pressed } = keys.current;
      const dir = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
      if (dir) p.face = dir;
      p.vx = dir * 180;
      if (pressed.has("up") && p.ground) { p.vy = -540; p.ground = false; }
      p.vy += 1400 * dt;
      p.x = Math.max(20, Math.min(W - 20, p.x + p.vx * dt));
      p.y += p.vy * dt;
      if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.ground = true; }

      const near = STATIONS.find((s) => Math.abs(s.x - p.x) <= 38) ?? null;
      if (pressed.has("act") && near && p.ground) {
        apply.current(near.id);
        pose = { name: "Punch", until: now + 320 };
        const s = toScreen.current?.(near.x, GROUND - 24);
        if (s) { fx.waterSpray(s.x, s.y, 1); fx.waterSpray(s.x, s.y, -1); fx.sparkle(s.x, s.y); }
        playSfx("pickup");
      }
      pressed.clear();

      let name = "Idle";
      if (pose && now < pose.until) name = pose.name;
      else if (!p.ground) name = "Jump";
      else if (dir) name = "Walk";
      setSnap({ x: p.x, y: p.y, face: p.face, pose: name, near: near?.id ?? null });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [keys]);

  // physics: continuity + Bernoulli along the pipe
  const vIn = SPEEDS[speedIdx];
  const sections = sizes.map((d, i) => {
    const v = vIn * (sizes[0] / d) ** 2;
    const pressure = P_IN + (0.5 * RHO * (vIn ** 2 - v ** 2)) / 1000;
    return { d, v, pressure, x: SECTION_X[i], h: d * CM, warn: pressure <= 0 ? "cavitation" : v > 25 ? "too fast" : null };
  });
  const flow = ((Math.PI * (sizes[0] / 100) ** 2) / 4) * vIn * 1000; // L/s

  return (
    <div>
      <div className="plat-hud">
        <div>
          Inlet: <strong>{vIn} m/s</strong> through {sizes[0]} cm · flow rate Q = A·v = <strong>{flow.toFixed(1)} L/s</strong>
          <div>Start pressure fixed at {P_IN} kPa. Squeeze a pipe and watch what happens to speed and pressure.</div>
        </div>
        <div className="plat-hud-item">
          Same Q everywhere<div>A₁v₁ = A₂v₂ = A₃v₃</div>
        </div>
      </div>

      <ScaledWorld width={W} height={H} toScreenRef={toScreen}>
        <div className="sb-room" />
        <div className="sb-floor" style={{ top: GROUND, height: H - GROUND }} />

        <svg className="sb-ruler" width={W} height={H} aria-hidden="true">
          {sections.map((s, i) => (
            <g key={i}>
              <rect x={s.x + (i ? 12 : 0)} y={PIPE_Y - s.h / 2} width={240 - (i ? 12 : 0) - (i < 2 ? 12 : 0)} height={s.h}
                fill={s.warn ? "#c46b5f" : "#7d8a93"} stroke="#253d43" strokeWidth="4" />
              <line x1={s.x + 6} x2={s.x + 234} y1={PIPE_Y} y2={PIPE_Y} className="pipe-flow" style={{ animationDuration: `${dur(s.v)}s` }} />
              {i < 2 && (
                <polygon
                  points={`${s.x + 228},${PIPE_Y - s.h / 2} ${s.x + 252},${PIPE_Y - sections[i + 1].h / 2} ${s.x + 252},${PIPE_Y + sections[i + 1].h / 2} ${s.x + 228},${PIPE_Y + s.h / 2}`}
                  fill="#7d8a93" stroke="#253d43" strokeWidth="4" />
              )}
            </g>
          ))}
        </svg>

        {sections.map((s, i) => (
          <div key={i} className={`flow-gauge${s.warn ? " warn" : ""}`} style={{ left: s.x + 120, top: PIPE_Y - s.h / 2 - 78 }}>
            <strong>{s.d} cm</strong>
            <div>v = {s.v.toFixed(1)} m/s</div>
            <div>P = {s.pressure.toFixed(0)} kPa</div>
            {s.warn && <div className="flow-warn">{s.warn === "cavitation" ? "Pressure collapsed!" : "Way too fast!"}</div>}
          </div>
        ))}

        {STATIONS.map((st) => {
          const value = st.id === "pump" ? `${vIn} m/s` : `${sizes[Number(st.id.slice(1))]} cm`;
          return (
            <div key={st.id} className={`flow-station${snap?.near === st.id ? " near" : ""}`} style={{ left: st.x, top: GROUND - 64 }}>
              <span className="flow-station-icon">{st.icon}</span>
              <span className="flow-station-label">{st.label}: {value}</span>
              {snap?.near === st.id && <span className="flow-station-tip">Press E</span>}
            </div>
          );
        })}

        {snap && (
          <div className="plat-player" style={{ left: snap.x - 28, top: snap.y - 56 }}>
            <div style={{ transform: snap.face < 0 ? "scaleX(-1)" : undefined }}>
              <AnimatedAvatar spriteId={spriteId} row={POSE[snap.pose]} animate size={56} />
            </div>
          </div>
        )}
      </ScaledWorld>

      <p className="plat-help">
        <kbd>A</kbd>/<kbd>D</kbd> move · <kbd>W</kbd>/<kbd>Space</kbd> jump · <kbd>E</kbd> punch a valve or the pump to change it.
      </p>
    </div>
  );
}

export default FlowSandbox;
