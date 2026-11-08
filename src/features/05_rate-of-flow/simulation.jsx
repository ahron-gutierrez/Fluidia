import { useEffect, useRef, useState } from "react";
import BgMusic from "../../components/BgMusic";

const DEFAULTS = { left: 0.25, right: 0.15, speed: 5 };
const PX = 300, PAD = 20, PIPE = 160, SLOPE = 80;
const X0 = PAD, X1 = X0 + PIPE, X2 = X1 + SLOPE, X3 = X2 + PIPE;
const W = X3 + PAD, H = PX + PAD * 2, CY = H / 2;
const PARTICLES = 70, VISUAL_SPEED = 30, MAX_SPEED = 900, WING_X = W / 2, WING_SPAN = 115;

const radiusAt = (x, left, right) => x <= X1 ? left : x >= X2 ? right : left + (right - left) * ((x - X1) / SLOPE);
const pipeSpeed = (x, left, right, speed) => Math.min(speed * (left / radiusAt(x, left, right)) ** 2 * VISUAL_SPEED, MAX_SPEED);
const makeParticle = (randomX = true) => ({ x: randomX ? X0 + Math.random() * (X3 - X0) : X0, lane: Math.random() * 1.7 - 0.85 });
const resetParticles = () => Array.from({ length: PARTICLES }, () => makeParticle());

function wingSpeed(x, lane, speed, angle) {
  const nearWing = Math.exp(-(((x - WING_X) / WING_SPAN) ** 2));
  return Math.min(speed * VISUAL_SPEED * (1 + nearWing * (lane < 0 ? 0.55 + Math.max(0, angle) * 0.018 : 0.16)), MAX_SPEED);
}

function wingY(x, lane, angle) {
  const safeLane = Math.abs(lane) < 0.14 ? (lane < 0 ? -0.14 : 0.14) : lane;
  const nearWing = Math.exp(-(((x - WING_X) / WING_SPAN) ** 2));
  return CY + safeLane * 122 + (safeLane < 0 ? -1 : 1) * nearWing * (28 + Math.max(0, angle) * 1.2) + nearWing * ((x - WING_X) / WING_SPAN) * angle * 0.65;
}

function RateOfFlowSimulation() {
  const [leftRadius, setLeftRadius] = useState(DEFAULTS.left);
  const [rightRadius, setRightRadius] = useState(DEFAULTS.right);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [running, setRunning] = useState(true);
  const [mode, setMode] = useState("flow");
  const [angle, setAngle] = useState(6);
  const [particles, setParticles] = useState(resetParticles);
  const paramsRef = useRef({});
  paramsRef.current = { leftRadius, rightRadius, speed, mode, angle };

  useEffect(() => {
    if (!running) return undefined;
    let frameId, last = null;
    const tick = (now) => {
      if (last === null) last = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const current = paramsRef.current;
      setParticles((previous) => previous.map((particle) => {
        const velocity = current.mode === "flow"
          ? pipeSpeed(particle.x, current.leftRadius, current.rightRadius, current.speed)
          : wingSpeed(particle.x, particle.lane, current.speed, current.angle);
        const x = particle.x + velocity * dt;
        return x > X3 ? makeParticle(false) : { ...particle, x };
      }));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);

  const leftHeight = leftRadius * PX, rightHeight = rightRadius * PX;
  const pipePath = [`M ${X0} ${CY - leftHeight}`, `L ${X1} ${CY - leftHeight}`, `L ${X2} ${CY - rightHeight}`, `L ${X3} ${CY - rightHeight}`, `L ${X3} ${CY + rightHeight}`, `L ${X2} ${CY + rightHeight}`, `L ${X1} ${CY + leftHeight}`, `L ${X0} ${CY + leftHeight}`, "Z"].join(" ");
  const upperSpeed = speed * (1.35 + Math.max(0, angle) * 0.015), lowerSpeed = speed * 1.08;
  const pressureDifference = Math.max(0, (upperSpeed - lowerSpeed) * 1.8);
  const liftLength = 36 + Math.min(74, pressureDifference * 7);
  const airfoilPath = `M ${WING_X - 120} ${CY + 5} Q ${WING_X - 18} ${CY - 58} ${WING_X + 118} ${CY - 4} Q ${WING_X - 18} ${CY + 30} ${WING_X - 120} ${CY + 5} Z`;
  const reset = () => { setLeftRadius(DEFAULTS.left); setRightRadius(DEFAULTS.right); setSpeed(DEFAULTS.speed); setAngle(6); setParticles(resetParticles()); };
  const switchMode = (nextMode) => { setMode(nextMode); setParticles(resetParticles()); };

  return (
    <div className="flow-simulation">
      <BgMusic track="quiz"/>
      <div className="flow-simulation__mode-toggle" role="group" aria-label="Simulation mode">
        <button type="button" className={`btn ${mode === "flow" ? "is-active" : ""}`} onClick={() => switchMode("flow")} aria-pressed={mode === "flow"}>Fluid Flow</button>
        <button type="button" className={`btn ${mode === "wing" ? "is-active" : ""}`} onClick={() => switchMode("wing")} aria-pressed={mode === "wing"}>Airplane Wing</button>
      </div>
      <div className="flow-simulation__workspace">
        <div className="flow-simulation__visual">
          {mode === "flow" ? <>
            <svg className="flow-simulation__pipe" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Pipe narrowing from radius ${leftRadius} metres to ${rightRadius} metres`}>
              <defs><clipPath id="pipe-clip"><path d={pipePath} /></clipPath></defs><path d={pipePath} fill="#d7eefa" />
              <g clipPath="url(#pipe-clip)">{particles.map((particle, index) => <circle key={index} cx={particle.x} cy={CY + particle.lane * radiusAt(particle.x, leftRadius, rightRadius) * PX} r="3" fill="#1d7fb8" opacity="0.85" />)}</g>
              <path d={pipePath} fill="none" stroke="#023047" strokeWidth="2" strokeLinejoin="round" />
            </svg><p className="flow-simulation__legend">Blue particles show the direction and relative speed of the fluid.</p>
          </> : <>
            <svg className="flow-simulation__airfoil" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Air flowing around a wing at ${angle} degrees angle of attack`}>
              <defs><marker id="lift-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 10 L 5 0 L 10 10 Z" fill="#1e8449" /></marker></defs><rect width={W} height={H} fill="#f7fafc" />
              {particles.map((particle, index) => <circle key={index} cx={particle.x} cy={wingY(particle.x, particle.lane, angle)} r="3" fill="#1d7fb8" opacity="0.85" />)}
              <g transform={`rotate(${-angle} ${WING_X} ${CY})`}><path d={airfoilPath} fill="#d8a96f" stroke="#023047" strokeWidth="3" strokeLinejoin="round" /></g>
              <line x1={WING_X} y1={CY + 26} x2={WING_X} y2={CY + 26 - liftLength} stroke="#1e8449" strokeWidth="4" markerEnd="url(#lift-arrow)" /><text x={WING_X + 12} y={CY + 20 - liftLength} fill="#17643a" fontSize="13" fontWeight="700">LIFT</text><text x={WING_X - 110} y={CY - 106} fill="#216b91" fontSize="12" fontWeight="700">LOW PRESSURE</text><text x={WING_X - 112} y={CY + 116} fill="#4c6372" fontSize="12" fontWeight="700">HIGHER PRESSURE</text>
            </svg><p className="flow-simulation__legend">Particles speed up over the curved upper surface, creating lower pressure and lift.</p>
          </>}
        </div>
        <section className="flow-simulation__controls" aria-label={mode === "flow" ? "Flow experiment controls" : "Airplane wing controls"}>
          <div className="flow-simulation__actions"><button type="button" className="btn flow-simulation__run" onClick={() => setRunning((isRunning) => !isRunning)}>{running ? "Pause flow" : "Start flow"}</button>{mode === "flow" && <button type="button" className="btn flow-simulation__swap" onClick={() => { setLeftRadius(rightRadius); setRightRadius(leftRadius); }}>Swap sides</button>}<button type="button" className="btn flow-simulation__reset" onClick={reset}>Reset</button></div>
          {mode === "flow" ? <>
            <Slider id="left-pipe-radius" label={`Left pipe radius: ${leftRadius.toFixed(2)} m`} value={leftRadius} min="0.05" max="0.5" step="0.01" onChange={setLeftRadius} />
            <Slider id="right-pipe-radius" label={`Right pipe radius: ${rightRadius.toFixed(2)} m`} value={rightRadius} min="0.05" max="0.5" step="0.01" onChange={setRightRadius} />
            <Slider id="initial-flow-speed" label={`Initial speed: ${speed.toFixed(1)} m/s`} value={speed} min="0" max="20" step="0.1" onChange={setSpeed} />
            <div className="flow-simulation__preset-group"><span className="form-label">Experiment preset</span><div className="flow-simulation__preset-buttons"><button type="button" className="btn flow-simulation__preset" onClick={() => { setLeftRadius(0.25); setRightRadius(0.15); setSpeed(5); }}>Default Preset</button></div></div>
          </> : <>
            <Slider id="wing-air-speed" label={`Airflow speed: ${speed.toFixed(1)} m/s`} value={speed} min="0" max="20" step="0.1" onChange={setSpeed} />
            <Slider id="angle-of-attack" label={`Angle of attack: ${angle.toFixed(0)}°`} value={angle} min="-8" max="18" step="1" onChange={setAngle} />
            <dl className="flow-simulation__wing-readouts"><div><dt>Above wing</dt><dd>{upperSpeed.toFixed(1)} m/s</dd></div><div><dt>Below wing</dt><dd>{lowerSpeed.toFixed(1)} m/s</dd></div><div><dt>Pressure difference</dt><dd>{pressureDifference.toFixed(1)} units</dd></div><div><dt>Lift</dt><dd>{pressureDifference > 0 ? "Upward" : "None"}</dd></div></dl>
          </>}
        </section>
      </div>
    </div>
  );
}

function Slider({ id, label, value, min, max, step, onChange }) {
  return <div className="flow-simulation__slider-group"><label htmlFor={id} className="form-label">{label}</label><input id={id} className="form-range" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></div>;
}

export default RateOfFlowSimulation;
