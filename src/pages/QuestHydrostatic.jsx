import { useEffect, useRef, useState } from "react";
import { Link, useBlocker } from "react-router-dom";

import ConfirmLeave from "../components/ConfirmLeave";
import HintHelper from "../components/HintHelper";
import PixelWater from "../components/PixelWater";
import RoundIntro from "../components/RoundIntro";
import BgMusic from "../components/BgMusic";
import SpriteSlot from "../components/SpriteSlot";
import { DEFAULT_AVATAR_ID } from "../data/avatarAssets";
import * as fx from "../utils/pixelFx";
import { playSfx } from "../utils/sfx";
import QuestSummary from "../components/QuestSummary";
import { recordQuestResult } from "../data/achievements";
import {
  addScore,
  calculateQuestScore,
  getAvatar,
  getCurrentUser,
  getProgress,
  setProgress,
} from "../data/gameData";
import "../styles/Quest.css";

const G = 9.81;
const QUEST_ID = "village-beneath-water";
const NEXT_QUEST_ID = "sunken-cargo";

const FLUIDS = {
  water: { name: "Fresh water", rho: 1000, color: "#4ca9c7" },
  sea: { name: "Seawater", rho: 1025, color: "#2f7fa3" },
  mercury: { name: "Mercury", rho: 13600, color: "#9aa5ad" },
};

// Rounds 1-3: dive to the depth that produces the target pressure.
const DIVES = [
  { fluid: "water", target: 150, maxDepth: 40, step: 0.5, showGauge: true,
    intro: "Round 1: I'll leave the gauge on. Dive until it reads the target." },
  { fluid: "sea", target: 200, maxDepth: 40, step: 0.5, showGauge: false,
    intro: "Round 2: gauge's broken! Use P = ρ·g·h to find the depth. Seawater is denser than fresh water." },
  { fluid: "mercury", target: 100, maxDepth: 5, step: 0.05, showGauge: false,
    intro: "Round 3: mercury is 13.6× denser than water. Expect a much shallower dive!" },
];

// Round 4: the clever one. Depth of each hole below the water surface (m).
const TANK_H = 10;
const HOLES = [1, 3, 5, 8, 9];
const rangeOf = (h) => 2 * Math.sqrt(h * (TANK_H - h)); // horizontal reach (m)
const BEST_HOLE = HOLES.reduce((best, h) => (rangeOf(h) > rangeOf(best) ? h : best));

const kPa = (rho, h) => (rho * G * h) / 1000;
const TOTAL = DIVES.length + 1;

function DiveRound({ round, onResult }) {
  const fluid = FLUIDS[round.fluid];
  const [depth, setDepth] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [firstTry, setFirstTry] = useState(true);
  const [solved, setSolved] = useState(false);

  const pressure = kPa(fluid.rho, depth);
  const correctDepth = (round.target * 1000) / (fluid.rho * G);
  const depthPct = (depth / round.maxDepth) * 100;

  const lastBubble = useRef(0);
  const floater = () => document.querySelector(".quest-sub");

  const moveSlider = (value) => {
    setDepth(value);
    const now = performance.now();
    const el = floater();
    if (el && now - lastBubble.current > 110) {   // bubble trail while you dive
      lastBubble.current = now;
      const c = fx.centerOf(el);
      fx.bubbles(c.x, c.y, 2);
      if (Math.random() < 0.25) playSfx("pop", 0.3);
    }
  };

  const lock = () => {
    const el = floater();
    const c = el ? fx.centerOf(el) : null;
    const error = (pressure - round.target) / round.target;
    if (Math.abs(error) <= 0.05) {
      setSolved(true);
      if (c) { fx.sparkle(c.x, c.y); fx.bubbles(c.x, c.y, 12); }
      playSfx("correct");
      setFeedback({ ok: true, text: `Locked in! ${pressure.toFixed(0)} kPa at ${depth.toFixed(2)} m. The exact answer is ${correctDepth.toFixed(2)} m.` });
    } else {
      setFirstTry(false);
      if (c) fx.puff(c.x, c.y, ["#c46b5f", "#9c4a42", "#f4e9c9"]);
      playSfx("wrong");
      setFeedback({ ok: false, text: error > 0 ? "Too much pressure. You're too deep. Come up a bit." : "Not enough pressure. Dive deeper." });
    }
  };

  return (
    <div>
      <HintHelper paused={solved}>
        Use <strong>P = ρ × g × h</strong>, so <strong>h = P ÷ (ρ × g)</strong>.<br />
        Here: h = {round.target * 1000} Pa ÷ ({fluid.rho} × {G}). Pressure must be in pascals (1 kPa = 1000 Pa).
      </HintHelper>
      <p>{round.intro}</p>
      <div className="quest-dive">
        <div className="quest-pool" style={{ "--fluid": fluid.color }}>
          <PixelWater color={fluid.color} />
          <span className="quest-pool-label">{fluid.name} (ρ = {fluid.rho} kg/m³)</span>
          <div className="quest-sub" style={{ top: `${depthPct * 0.82}%` }}>
            <span className="quest-sub-bob">🛟</span>
          </div>
        </div>
        <div className="quest-gauge">
          <div className="quest-gauge-target">Target<br /><strong>{round.target} kPa</strong></div>
          <div className="quest-gauge-reading">
            {round.showGauge ? `${pressure.toFixed(0)} kPa` : "?? kPa"}
          </div>
          <div>Depth: <strong>{depth.toFixed(2)} m</strong></div>
        </div>
      </div>

      <input
        type="range" className="form-range" min="0" max={round.maxDepth} step={round.step}
        value={depth} disabled={solved} onChange={(e) => moveSlider(Number(e.target.value))}
        aria-label="Depth"
      />

      {feedback && <p className={`quest-feedback ${feedback.ok ? "ok" : "bad"}`}>{feedback.text}</p>}

      {solved ? (
        <button type="button" className="btn btn-primary" onClick={() => onResult(firstTry)}>Next</button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={lock}>Lock depth</button>
      )}
    </div>
  );
}

function TankRound({ onResult }) {
  const [picked, setPicked] = useState(null);
  const S = 30; // px per metre
  const W = 520;
  const tankW = 60;
  const groundY = TANK_H * S + 20;

  const streamPath = (h) => {
    const y0 = 20 + h * S; // hole position (px)
    const pts = [];
    const r = rangeOf(h);
    for (let x = 0; x <= r; x += 0.25) {
      pts.push(`${tankW + x * S},${y0 + (x * x) / (4 * h) * S}`);
    }
    pts.push(`${tankW + r * S},${groundY}`);
    return pts.join(" ");
  };

  const revealed = picked !== null;
  const correct = picked === BEST_HOLE;

  const pickHole = (h, el) => {
    if (revealed) return;
    setPicked(h);
    const c = fx.centerOf(el);
    if (h === BEST_HOLE) { fx.sparkle(c.x, c.y); fx.confetti(c.x, c.y); playSfx("correct"); }
    else { fx.splash(c.x, c.y); fx.puff(c.x, c.y, ["#c46b5f", "#9c4a42", "#f4e9c9"]); playSfx("wrong"); }
  };

  return (
    <div>
      <HintHelper paused={revealed}>
        Pressure rises with depth (<strong>P = ρ × g × h</strong>), but the stream's reach is about{" "}
        <strong>2 × √(h × (H − h))</strong>, where h is the hole's depth and H = {TANK_H} m.
        Try a few holes in your head!
      </HintHelper>
      <p>
        Round 4: the Leaky Tower! Every hole is leaking. The bottom hole has the <em>most pressure</em>,
        so which stream lands <strong>farthest</strong> from the tower? Tap a hole.
      </p>
      <svg viewBox={`0 0 ${W} ${groundY + 24}`} className="quest-tank-svg" role="img" aria-label="Water tower with five holes">
        <rect x="0" y="20" width={tankW} height={TANK_H * S} fill="#4ca9c7" stroke="#253d43" strokeWidth="3" />
        <line x1="0" y1={groundY} x2={W} y2={groundY} stroke="#253d43" strokeWidth="4" />
        {revealed && HOLES.map((h) => (
          <polyline key={h} points={streamPath(h)} fill="none"
            stroke={h === BEST_HOLE ? "#d7a85f" : "#4ca9c7"} strokeWidth={h === BEST_HOLE ? 4 : 2.5} />
        ))}
        {HOLES.map((h) => (
          <g key={h} onClick={(e) => pickHole(h, e.currentTarget)} style={{ cursor: revealed ? "default" : "pointer" }}>
            <circle cx={tankW} cy={20 + h * S} r="9" fill={picked === h ? "#d7a85f" : "#1b2d2f"} stroke="#fff" strokeWidth="2" />
            <text x={tankW + 14} y={20 + h * S + 4} fontSize="11" fill="#1b2d2f">{h} m deep</text>
          </g>
        ))}
      </svg>

      {revealed && (
        <>
          <p className={`quest-feedback ${correct ? "ok" : "bad"}`}>
            {correct ? "Yes! " : "Surprise! "}
            The <strong>{BEST_HOLE} m</strong> hole wins ({rangeOf(BEST_HOLE).toFixed(1)} m). Deeper holes have more
            pressure (P = ρgh), so the water leaves faster, but it starts closer to the ground and has less time
            to travel. The best range comes from the middle.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => onResult(correct)}>Finish</button>
        </>
      )}
    </div>
  );
}

function QuestHydrostatic() {
  const currentUser = getCurrentUser();
  const [stage, setStage] = useState("intro"); // "intro" | 0..3 | "done"
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState(null);
  const inProgress = typeof stage === "number"; // a round is underway
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      inProgress && currentLocation.pathname !== nextLocation.pathname,
  );

  // Also warn on refresh / closing the tab.
  useEffect(() => {
    if (!inProgress) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [inProgress]);

  const [introDone, setIntroDone] = useState(-1); // last stage whose intro has played

  if (!currentUser) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Access required</h1>
          <p>Please log in to take on the quest.</p>
          <Link to="/login" className="btn btn-primary">Log in</Link>
        </div>
      </main>
    );
  }

  const spriteId = getAvatar(currentUser.id)?.spriteId ?? DEFAULT_AVATAR_ID;
  const inRound = typeof stage === "number";
  const showIntro = inRound && introDone !== stage;

  const finish = (points) => {
    const progress = getProgress(currentUser.id);
    const firstCompletion = !(progress.completedQuests ?? []).includes(QUEST_ID);
    const done = new Set(progress.completedQuests ?? []).add(QUEST_ID);
    const unlocked = new Set(progress.unlockedQuests ?? []).add(NEXT_QUEST_ID);
    setProgress(currentUser.id, {
      ...progress,
      completedQuests: [...done],
      unlockedQuests: [...unlocked],
      currentQuest: NEXT_QUEST_ID,
    });
    setScore(points);
    setStage("done");

    const breakdown = calculateQuestScore(TOTAL, points);
    const account = firstCompletion ? addScore(currentUser.id, breakdown.total) : null;
    recordQuestResult(currentUser.id, QUEST_ID, points, TOTAL, firstCompletion);
    const now = currentUser.score ?? 0;
    setSummary({
      title: "Hydrostatic Pressure: The Deep Dive",
      summary: firstCompletion ? breakdown : { completion: 0, rounds: 0, bonus: 0, total: 0 },
      totalRounds: TOTAL,
      firstTryRounds: points,
      before: account?.before ?? now,
      after: account?.after ?? now,
      replay: !firstCompletion,
    });
  };

  const advance = (success) => {
    const points = score + (success ? 1 : 0);
    if (stage + 1 >= TOTAL) {
      finish(points);
    } else {
      setScore(points);
      setStage(stage + 1);
    }
  };

  let guideLine = "Welcome, diver!";
  if (stage === "intro") {
    guideLine = "Hydrostatic pressure is the pressure a fluid creates just from its own weight. It grows with depth and density: P = ρ × g × h. Dive in and see it for yourself!";
  } else if (stage === "done") {
    guideLine = score === TOTAL ? "Flawless! You really understand pressure." : "Quest complete! Replay to get a perfect score.";
  } else if (stage === DIVES.length) {
    guideLine = "Careful: more pressure doesn't always mean the farthest reach!";
  }

  return (
    <main className="container py-4">
      <BgMusic track="quest1"/>
      {summary && (
        <QuestSummary {...summary} spriteId={spriteId} onContinue={() => setSummary(null)} />
      )}
      {blocker.state === "blocked" && (
        <ConfirmLeave onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />
      )}
      <div className="pixel-panel quest-panel">
        <div className="quest-guide">
          <div className="quest-guide-sprite">
            <SpriteSlot src="/lobby/guide.png" label="guide.png" />
          </div>
          <div className="quest-speech"><strong>Pressure Guide:</strong> {guideLine}</div>
        </div>

        <h1 className="pixel-heading md">Hydrostatic Pressure: The Deep Dive</h1>

        {stage === "intro" && (
          <button type="button" className="btn btn-primary" onClick={() => setStage(0)}>Start the dive</button>
        )}

        {showIntro && <RoundIntro key={stage} round={stage + 1} spriteId={spriteId} onDone={() => setIntroDone(stage)} />}

        {inRound && !showIntro && stage < DIVES.length && (
          <DiveRound key={stage} round={DIVES[stage]} onResult={advance} />
        )}

        {inRound && !showIntro && stage === DIVES.length && <TankRound key="tank" onResult={advance} />}

        {stage === "done" && (
          <div>
            <p>First-try score: <strong>{score}/{TOTAL}</strong>. Quest saved!</p>
            <button type="button" className="btn btn-secondary me-2" onClick={() => { setScore(0); setIntroDone(-1); setStage("intro"); }}>
              Play again
            </button>
            <Link to="/intro" className="btn btn-primary">Back to lobby</Link>
            <Link to={`/endless/${QUEST_ID}`} className="btn btn-secondary ms-2">Endless mode</Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default QuestHydrostatic;
