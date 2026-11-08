import { useEffect, useRef, useState } from "react";
import BgMusic from "../../components/BgMusic";

const DEFAULTS = { objectDensity: 600, fluidDensity: 1000, volume: 0.005 };
// do not touch (this these are the logics)
const G = 9.81;
const SUBSTEP = 1 / 480;
const DAMPING_RATIO = 0.4;     

const TANK_W = 1.0;
const TANK_H = 1.2;
const FLUID_H = 0.7;
const DROP_GAP = 0.2;     

const PX = 400;   
const PAD = 20;
const SVG_W = TANK_W * PX + PAD * 2;
const SVG_H = TANK_H * PX + PAD * 2;
const FLOOR_Y = PAD + TANK_H * PX;
const ARROW_PX_PER_N = 1.2;
const ARROW_MAX = 150;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const toY = (h) => FLOOR_Y - h * PX; 

function fluidColor(rho, dl = 0) {
  const t = clamp((rho - 500) / (14000 - 500), 0, 1);
  return `hsl(200, ${Math.round(65 * (1 - t))}%, ${Math.round(75 - 35 * t + dl)}%)`;
}
function objectDensityT(rho) {
  return clamp((rho - 100) / (8000 - 100), 0, 1);
}
function objectColor(rho, dl = 0) {
  const t = objectDensityT(rho);
  return `hsl(30, ${Math.round(55 * (1 - t) + 5)}%, ${Math.round(65 - 40 * t + dl)}%)`;
}

function ArchimedesSimulation() {
  const [objectDensity, setObjectDensity] = useState(DEFAULTS.objectDensity);
  const [fluidDensity, setFluidDensity] = useState(DEFAULTS.fluidDensity);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [released, setReleased] = useState(false);
  const [bottom, setBottom] = useState(FLUID_H + DROP_GAP);

  const yRef = useRef(FLUID_H + DROP_GAP);
  const vRef = useRef(0);
  const paramsRef = useRef({});
  paramsRef.current = { rhoO: objectDensity, rhoF: fluidDensity, vol: volume };

  useEffect(() => {
    if (!released) return;
    let last = Date.now();

    const tick = () => {
      const now = Date.now();
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      const { rhoO, rhoF, vol } = paramsRef.current;
      const side = Math.cbrt(vol);
      const mass = rhoO * vol;
      const omega = Math.sqrt((rhoF * G) / (rhoO * side));
      let y = yRef.current;
      let v = vRef.current;

      const steps = Math.max(1, Math.ceil(dt / SUBSTEP));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) { // <-- AI logic
        const frac = clamp((FLUID_H - y) / side, 0, 1);       // submerged fraction
        const buoyancy = rhoF * G * vol * frac;                // Archimedes' principle
        const drag = 0.05 + frac * 2 * DAMPING_RATIO * omega;  // per-second damping
        const a = (buoyancy - mass * G) / mass - drag * v;
        v += a * h;
        y += v * h;

        if (y <= 0) { y = 0; if (v < 0) v = 0; }                         // tank floor
        if (y + side >= TANK_H) { y = TANK_H - side; if (v > 0) v = 0; } // tank top
      }

      yRef.current = y;
      vRef.current = v;
      setBottom(y);
    };

    const timerId = setInterval(tick, 16);
    return () => clearInterval(timerId);
  }, [released]);

  const drop = () => {
    yRef.current = FLUID_H + DROP_GAP;
    vRef.current = 0;
    setBottom(yRef.current);
    setReleased(true);
  };

  const reset = () => {
    setObjectDensity(DEFAULTS.objectDensity);
    setFluidDensity(DEFAULTS.fluidDensity);
    setVolume(DEFAULTS.volume);
    yRef.current = FLUID_H + DROP_GAP;
    vRef.current = 0;
    setBottom(yRef.current);
    setReleased(false);
  };

  const side = Math.cbrt(volume);
  const y = released ? bottom : FLUID_H + DROP_GAP;
  const submerged = clamp((FLUID_H - y) / side, 0, 1);
  const buoyantForce = fluidDensity * G * volume * submerged;
  const weight = objectDensity * volume * G;

  let result = "Neutrally buoyant";
  if (objectDensity < fluidDensity - 0.5) result = "Floats";
  else if (objectDensity > fluidDensity + 0.5) result = "Sinks";

  const surfaceY = toY(FLUID_H);
  const surfacePath = `M ${PAD} ${surfaceY} q 25 -4 50 0` + " t 50 0".repeat(7);

  const sidePx = side * PX;
  const objX = PAD + (TANK_W * PX) / 2 - sidePx / 2;
  const objY = toY(y + side);
  const centerX = objX + sidePx / 2;
  const centerY = objY + sidePx / 2;
  const weightLen = Math.min(weight * ARROW_PX_PER_N, ARROW_MAX);
  const buoyLen = Math.min(buoyantForce * ARROW_PX_PER_N, ARROW_MAX);


  // actual UI side
  return (
    <div className="archimedes-simulation">
      <BgMusic track="quest1"/>
      <div className="archimedes-simulation__workspace">
        <div className="archimedes-simulation__visual">
      <svg
        className="archimedes-simulation__tank"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{
          borderRadius: 12,
          border: "1px solid #d5e0ea",
          background: "linear-gradient(#f7fafc, #e7eff5)",
        }}
        role="img"
        aria-label={`A ${objectDensity} kilogram per cubic metre block in a fluid of ${fluidDensity} kilograms per cubic metre`}
      >
        <defs>
          <linearGradient id="fluid-grad" gradientUnits="userSpaceOnUse" x1="0" y1={toY(FLUID_H)} x2="0" y2={FLOOR_Y}>
            <stop offset="0" stopColor={fluidColor(fluidDensity, 6)} />
            <stop offset="1" stopColor={fluidColor(fluidDensity, -14)} />
          </linearGradient>
          <linearGradient id="object-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={objectColor(objectDensity, 12)} />
            <stop offset="1" stopColor={objectColor(objectDensity, -10)} />
          </linearGradient>
          <marker id="arrow-weight" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#c0392b" />
          </marker>
          <marker id="arrow-buoyancy" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e8449" />
          </marker>
        </defs>

        {/* height ruler on the left wall */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map((i) => {
          const major = i % 5 === 0;
          return (
            <g key={i}>
              <line x1={PAD + 3} x2={PAD + (major ? 17 : 9)} y1={toY(i / 10)} y2={toY(i / 10)} stroke="#8fa3b3" strokeWidth="1.5" />
              {major && (
                <text x={PAD + 22} y={toY(i / 10) + 4} fontSize="11" fill="#7a8d9c">{i / 10} m</text>
              )}
            </g>
          );
        })}

        {/* object */}
        <rect
          x={objX}
          y={objY}
          width={sidePx}
          height={sidePx}
          rx="6"
          fill="url(#object-grad)"
          stroke={objectColor(objectDensity, -22)}
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY + 4}
          textAnchor="middle"
          fontSize={Math.min(14, sidePx * 0.28)}
          fontWeight="600"
          fill={objectDensityT(objectDensity) > 0.45 ? "#fff" : "#2a1d10"}
        >
          {objectDensity}
        </text>

        {/* fluid drawn over the object, so the submerged part looks tinted */}
        <path
          d={`${surfacePath} L ${PAD + TANK_W * PX} ${FLOOR_Y} L ${PAD} ${FLOOR_Y} Z`}
          fill="url(#fluid-grad)"
          opacity="0.72"
        />
        <path d={surfacePath} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.85" strokeLinecap="round" />

        {/* tank */}
        <rect x={PAD - 4} y={FLOOR_Y - 2} width={TANK_W * PX + 8} height="10" rx="4" fill="#5b6b7a" />
        <path
          d={`M ${PAD} ${PAD} L ${PAD} ${FLOOR_Y} L ${PAD + TANK_W * PX} ${FLOOR_Y} L ${PAD + TANK_W * PX} ${PAD}`}
          fill="none"
          stroke="#7f97a8"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* force arrows */}
        {weightLen > 2 && (
          <line
            x1={centerX - 8} y1={centerY}
            x2={centerX - 8} y2={centerY + weightLen}
            stroke="#c0392b" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrow-weight)"
          />
        )}
        {buoyLen > 2 && (
          <line
            x1={centerX + 8} y1={centerY}
            x2={centerX + 8} y2={centerY - buoyLen}
            stroke="#1e8449" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrow-buoyancy)"
          />
        )}

        {!released && (
          <text x={SVG_W / 2} y={PAD + 18} textAnchor="middle" fontSize="14" fill="#5d6f7e">
            Held above the fluid. Press Drop / Release.
          </text>
        )}
      </svg>

      <p className="archimedes-simulation__legend">
        <span className="archimedes-simulation__legend-item archimedes-simulation__legend-item--weight">Weight: down</span>
        <span className="archimedes-simulation__legend-item archimedes-simulation__legend-item--buoyancy">Buoyant force: up</span>
      </p>
        </div>

        <div className="archimedes-simulation__panel">
      <section className="archimedes-simulation__controls" aria-label="Experiment controls">
         <div className="archimedes-simulation__actions">
          <button type="button" className="btn archimedes-simulation__release" onClick={drop}>Drop / Release</button>
          <button type="button" className="btn archimedes-simulation__reset" onClick={reset}>Reset</button>
        </div>
        <div className="archimedes-simulation__slider-group">
          <label htmlFor="object-density" className="form-label">
            Object density: {objectDensity} kg/m³
          </label>
          <input
            id="object-density"
            className="form-range"
            type="range"
            min="100"
            max="8000"
            step="1"
            value={objectDensity}
            onChange={(e) => setObjectDensity(Number(e.target.value))}
          />
        </div>

        <div className="archimedes-simulation__slider-group">
          <label htmlFor="fluid-density" className="form-label">
            Fluid density: {fluidDensity} kg/m³
          </label>
          <input
            id="fluid-density"
            className="form-range"
            type="range"
            min="500"
            max="14000"
            step="1"
            value={fluidDensity}
            onChange={(e) => setFluidDensity(Number(e.target.value))}
          />
        </div>

        <div className="archimedes-simulation__slider-group">
          <label htmlFor="object-volume" className="form-label">
            Object volume: {volume.toFixed(3)} m³
          </label>
          <input
            id="object-volume"
            className="form-range"
            type="range"
            min="0.001"
            max="0.01"
            step="0.001"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>

        <div className="archimedes-simulation__preset-group">
          <span className="form-label">Fluid presets</span>
          <div className="archimedes-simulation__preset-buttons">
            <button type="button" className="btn archimedes-simulation__fluid-preset" onClick={() => setFluidDensity(800)}>Oil</button>
            <button type="button" className="btn archimedes-simulation__fluid-preset" onClick={() => setFluidDensity(1000)}>Water</button>
            <button type="button" className="btn archimedes-simulation__fluid-preset" onClick={() => setFluidDensity(1025)}>Salt water</button>
            <button type="button" className="btn archimedes-simulation__fluid-preset" onClick={() => setFluidDensity(13600)}>Mercury</button>
          </div>
        </div>

        <div className="archimedes-simulation__preset-group">
          <span className="form-label">Object presets</span>
          <div className="archimedes-simulation__preset-buttons">
            <button type="button" className="btn archimedes-simulation__object-preset" onClick={() => setObjectDensity(600)}>Wood</button>
            <button type="button" className="btn archimedes-simulation__object-preset" onClick={() => setObjectDensity(917)}>Ice</button>
            <button type="button" className="btn archimedes-simulation__object-preset" onClick={() => setObjectDensity(2700)}>Aluminum</button>
            <button type="button" className="btn archimedes-simulation__object-preset" onClick={() => setObjectDensity(7870)}>Iron</button>
          </div>
        </div>
      </section>

      <section className="archimedes-simulation__readouts" aria-labelledby="archimedes-readouts">
        <dl>
          <div><dt>Submerged</dt><dd>{(submerged * 100).toFixed(0)} %</dd></div>
          <div><dt>Buoyant force</dt><dd>{buoyantForce.toFixed(1)} N</dd></div>
          <div><dt>Weight</dt><dd>{weight.toFixed(1)} N</dd></div>
          <div className={`archimedes-simulation__result archimedes-simulation__result--${result.toLowerCase().replaceAll(" ", "-")}`}><dt>Result</dt><dd>{result}</dd></div>
        </dl>
        <p>
          Compare buoyant force with weight to see why an object floats or sinks.
        </p>
      </section>
        </div>
      </div>
    </div>
  );
}

export default ArchimedesSimulation;
