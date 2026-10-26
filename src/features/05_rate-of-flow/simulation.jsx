import { useEffect, useRef, useState } from "react";

const DEFAULTS = { left: 0.25, right: 0.15, speed: 5 };

//  dont touch this if you dont know what ur doing
const PX_PER_METER = 300;
const PIPE_LENGTH = 160;
const SLOPE_LENGTH = 80;
const PAD = 20;

const X0 = PAD;
const X1 = X0 + PIPE_LENGTH;
const X2 = X1 + SLOPE_LENGTH;
const X3 = X2 + PIPE_LENGTH;
const SVG_WIDTH = X3 + PAD;
const SVG_HEIGHT = 0.5 * 2 * PX_PER_METER + 2 * PAD;
const CY = SVG_HEIGHT / 2;

// So that your laptop dont explode lmfao
const PARTICLE_COUNT = 70;
const VISUAL_SPEED = 30;
const MAX_VISUAL_SPEED = 900;

// Radius of the pipe at horizontal position x
function radiusAt(x, left, right) {
  if (x <= X1) return left;
  if (x >= X2) return right;
  const t = (x - X1) / SLOPE_LENGTH;
  return left + (right - left) * t;
}

// Continuity: A1*v1 = A2*v2  ->  v = v0 * (r0 / r)^2 copy pasted from a random website
function speedAt(x, left, right, v0) {
  const r = radiusAt(x, left, right);
  return Math.min(v0 * (left / r) ** 2 * VISUAL_SPEED, MAX_VISUAL_SPEED);
}

function makeParticle(randomX = true) {
  return {
    x: randomX ? X0 + Math.random() * (X3 - X0) : X0,
    lane: Math.random() * 1.7 - 0.85, // -0.85..0.85 of the local half-height
  };
}

function RateOfFlowSimulation() {
  const [leftRadius, setLeftRadius] = useState(DEFAULTS.left);
  const [rightRadius, setRightRadius] = useState(DEFAULTS.right);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [running, setRunning] = useState(true);
  const [particles, setParticles] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, () => makeParticle(true))
  );

  const paramsRef = useRef({ left: leftRadius, right: rightRadius, speed });
  paramsRef.current = { left: leftRadius, right: rightRadius, speed };

  useEffect(() => {
    if (!running) return;
    let frameId;
    let last = null;

    const tick = (now) => {
      if (last === null) last = now;
      const dt = Math.min((now - last) / 1000, 0.05); // seconds, clamped
      last = now;
      const { left, right, speed: v0 } = paramsRef.current;

      setParticles((prev) =>
        prev.map((p) => {
          const nx = p.x + speedAt(p.x, left, right, v0) * dt;
          return nx > X3 ? makeParticle(false) : { ...p, x: nx };
        })
      );
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);


  const lh = leftRadius * PX_PER_METER;   
  const rh = rightRadius * PX_PER_METER;
  const pipePath = [
    `M ${X0} ${CY - lh}`,
    `L ${X1} ${CY - lh}`,
    `L ${X2} ${CY - rh}`,
    `L ${X3} ${CY - rh}`,
    `L ${X3} ${CY + rh}`,
    `L ${X2} ${CY + rh}`,
    `L ${X1} ${CY + lh}`,
    `L ${X0} ${CY + lh}`,
    "Z",
  ].join(" ");

  const swapSides = () => {
    setLeftRadius(rightRadius);
    setRightRadius(leftRadius);
  };
  const reset = () => {
    setLeftRadius(DEFAULTS.left);
    setRightRadius(DEFAULTS.right);
    setSpeed(DEFAULTS.speed);
  };
  const venturiPreset = () => { //Default preset
    setLeftRadius(0.25);
    setRightRadius(0.15);
    setSpeed(5.0);
  };

  // Under this are things that can be touched for decoration

  return (
    <div>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        width="100%"
        style={{ maxWidth: 700 }}
        role="img"
        aria-label={`Pipe narrowing from radius ${leftRadius} metres to ${rightRadius} metres`}
      >
        <defs>
          <clipPath id="pipe-clip">
            <path d={pipePath} />
          </clipPath>
        </defs>

        {/* pipe bidy */}
        <path d={pipePath} fill="#d7eefa" />

        <g clipPath="url(#pipe-clip)">
          {particles.map((p, i) => {
            const r = radiusAt(p.x, leftRadius, rightRadius);
            const y = CY + p.lane * r * PX_PER_METER;
            return (
              <circle key={i} cx={p.x} cy={y} r="3" fill="#1d7fb8" opacity="0.85" />
            );
          })}
        </g>

        {/* pipe outline on top Customize theez*/}
        <path d={pipePath} fill="none" stroke="#023047" strokeWidth="2" strokeLinejoin="round" />
      </svg>

      <section aria-labelledby="flow-controls">
        <h3 id="flow-controls" className="h5">Controls</h3>

        <div className="mb-3">
          <label htmlFor="left-pipe-radius" className="form-label">
            Left pipe radius: {leftRadius.toFixed(2)} m
          </label>
          <input
            id="left-pipe-radius"
            className="form-range"
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            value={leftRadius}
            onChange={(e) => setLeftRadius(Number(e.target.value))}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="right-pipe-radius" className="form-label">
            Right pipe radius: {rightRadius.toFixed(2)} m
          </label>
          <input
            id="right-pipe-radius"
            className="form-range"
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            value={rightRadius}
            onChange={(e) => setRightRadius(Number(e.target.value))}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="initial-flow-speed" className="form-label">
            Initial speed: {speed.toFixed(1)} m/s
          </label>
          <input
            id="initial-flow-speed"
            className="form-range"
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause flow" : "Start flow"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={swapSides}>Swap sides</button>
          <button type="button" className="btn btn-outline-secondary" onClick={reset}>Reset</button>
          <button type="button" className="btn btn-secondary" onClick={venturiPreset}>Default Preset</button>
        </div>
      </section>
    </div>
  );
}

export default RateOfFlowSimulation;
