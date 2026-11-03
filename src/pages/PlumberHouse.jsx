import { useEffect, useRef, useState } from "react";
import { Link, useBlocker } from "react-router-dom";

import AnimatedAvatar from "../components/AnimatedAvatar";
import ConfirmLeave from "../components/ConfirmLeave";
import Dialogue from "../components/Dialogue";
import HintHelper from "../components/HintHelper";
import PageReveal from "../components/PageReveal";
import RoundIntro from "../components/RoundIntro";
import SpriteSlot from "../components/SpriteSlot";
import { AVATAR_POSES, DEFAULT_AVATAR_ID } from "../data/avatarAssets";
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
import * as fx from "../utils/pixelFx";
import { playSfx } from "../utils/sfx";
import "../styles/Plumber.css";

const QUEST_ID = "windmills-secret"; // the fluid-flow quest
const POSE = Object.fromEntries(AVATAR_POSES.map((p) => [p.label, p.row]));

const TALK = [
  "AAAAH! Oh thank goodness, someone's here!",
  "My pipes have gone completely haywire! The water pressure is far too wrong: way too high in some pipes, barely a trickle in others!",
  "Pipes are rattling, water's spraying everywhere... I can't fix this alone!",
];
const ASK = "Will you help me fix my plumbing?";

// Avatar reactions: [pose, milliseconds]
const SEQUENCES = {
  win: [["Jump", 800], ["Punch", 1000]],
  cheer: [["Jump", 650], ["Jump", 650], ["Punch", 900], ["Jump", 650]],
  fail: [["Shocked", 900], ["Fall", 1100]],
};

const fmt = (n, d = 1) => Number(n).toFixed(d);
const areaCm = (dCm) => (Math.PI * (dCm / 100) ** 2) / 4; // m²

/* ---------- Stage: your avatar reacts with jump / punch / shocked / fall ---------- */
function ActionStage({ outcome, spriteId, mood }) {
  const [step, setStep] = useState("Idle");
  const heroRef = useRef(null);
  const valveRef = useRef(null);

  useEffect(() => {
    if (!outcome) return undefined;
    const timers = [];
    let t = 0;

    // pixel effects that go with each pose
    const effectFor = (pose) => {
      const hero = heroRef.current;
      const valve = valveRef.current;
      if (pose === "Punch" && valve) {
        const c = fx.centerOf(valve);
        fx.waterSpray(c.x, c.y - 10, 1);
        fx.waterSpray(c.x, c.y - 10, -1);
        fx.sparkle(c.x, c.y);
        playSfx("splash");
      } else if (pose === "Jump" && hero) {
        const c = fx.feetOf(hero);
        fx.puff(c.x, c.y);
      } else if (pose === "Shocked" && hero) {
        const c = fx.centerOf(hero);
        fx.sparks(c.x, c.y - 20);
      } else if (pose === "Fall" && hero) {
        const c = fx.feetOf(hero);
        fx.puff(c.x, c.y, ["#9aa5ad", "#f4e9c9"]);
      }
    };

    playSfx(outcome.kind === "fail" ? "wrong" : "correct");
    if (outcome.kind === "cheer" && heroRef.current) {
      const c = fx.centerOf(heroRef.current);
      fx.confetti(c.x - 40, c.y);
      fx.confetti(c.x + 140, c.y);
    }

    SEQUENCES[outcome.kind].forEach(([pose, ms]) => {
      timers.push(setTimeout(() => { setStep(pose); effectFor(pose); }, t));
      t += ms;
    });
    timers.push(setTimeout(() => setStep("Idle"), t));
    return () => timers.forEach(clearTimeout);
  }, [outcome]);

  return (
    <div className="plumber-stage">
      <SpriteSlot src="/lobby/plumber-interior.png" label="plumber-interior.png" className="plumber-stage-bg" />
      <div ref={heroRef} className={`plumber-hero step-${step.toLowerCase()}`}>
        <AnimatedAvatar spriteId={spriteId} row={POSE[step]} animate size={112} />
      </div>
      <div ref={valveRef} className={`plumber-valve${step === "Punch" ? " hit" : ""}`}>🚰</div>
      <div className={`plumber-npc ${mood}`}>
        <SpriteSlot src="/lobby/plumber.png" label="plumber.png" />
      </div>
    </div>
  );
}

/* ---------- Round 1: continuity (squeeze the pipe) ---------- */
const SQ = { d1: 10, v1: 2, d2: 5 };

function SqueezeRound({ onOutcome, onResult }) {
  const [v2, setV2] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [firstTry, setFirstTry] = useState(true);
  const [solved, setSolved] = useState(false);

  const q1 = areaCm(SQ.d1) * SQ.v1 * 1000; // L/s
  const q2 = areaCm(SQ.d2) * v2 * 1000;
  const correct = SQ.v1 * (SQ.d1 / SQ.d2) ** 2;
  const dur = (v) => Math.max(1.6 / Math.max(v, 0.3), 0.1);

  const lock = () => {
    if (Math.abs(q2 - q1) / q1 <= 0.05) {
      setSolved(true);
      setFeedback({ ok: true, text: `Flow matches! ${fmt(v2)} m/s in the narrow pipe (exact: ${fmt(correct)} m/s).` });
      onOutcome("win");
    } else {
      setFirstTry(false);
      setFeedback({ ok: false, text: q2 > q1 ? "Too fast: the narrow pipe would carry more water than comes in!" : "Too slow: water would back up before the squeeze!" });
      onOutcome("fail");
    }
  };

  return (
    <div>
      <HintHelper paused={solved}>
        The same volume per second must pass through every part of the pipe:{" "}
        <strong>Q = A × v</strong>, so <strong>A₁v₁ = A₂v₂</strong> (with A = π d² ÷ 4).<br />
        So v₂ = {SQ.v1} × ({SQ.d1} ÷ {SQ.d2})².
      </HintHelper>
      <p>
        Round 1: water enters the {SQ.d1} cm pipe at {SQ.v1} m/s, then squeezes into a {SQ.d2} cm pipe. Set the
        speed in the narrow pipe so the flow rate <strong>Q</strong> stays the same.
      </p>
      <svg viewBox="0 0 520 130" className="plumber-svg" role="img" aria-label="Pipe narrowing from 10 cm to 5 cm">
        <rect x="20" y="20" width="200" height="90" fill="#7d8a93" stroke="#253d43" strokeWidth="3" />
        <polygon points="220,20 280,42 280,88 220,110" fill="#7d8a93" stroke="#253d43" strokeWidth="3" />
        <rect x="280" y="42" width="220" height="46" fill="#7d8a93" stroke="#253d43" strokeWidth="3" />
        <line x1="22" y1="65" x2="220" y2="65" className="pipe-flow" style={{ animationDuration: `${dur(SQ.v1)}s` }} />
        <line x1="282" y1="65" x2="498" y2="65" className="pipe-flow"
          style={{ animationDuration: `${dur(v2)}s`, animationPlayState: v2 === 0 ? "paused" : "running" }} />
        <text x="120" y="125" fontSize="12" textAnchor="middle" fill="#1b2d2f">{SQ.d1} cm · {SQ.v1} m/s</text>
        <text x="390" y="110" fontSize="12" textAnchor="middle" fill="#1b2d2f">{SQ.d2} cm · {fmt(v2)} m/s</text>
      </svg>

      <div className="plumber-bars">
        <div>Q₁ (in): <strong>{fmt(q1)} L/s</strong><div className="bar"><span style={{ width: `${(q1 / 40) * 100}%` }} /></div></div>
        <div>Q₂ (narrow): <strong>{fmt(q2)} L/s</strong><div className="bar"><span className={Math.abs(q2 - q1) / q1 <= 0.05 ? "ok" : ""} style={{ width: `${(q2 / 40) * 100}%` }} /></div></div>
      </div>

      <input type="range" className="form-range" min="0" max="20" step="0.5" value={v2} disabled={solved}
        onChange={(e) => setV2(Number(e.target.value))} aria-label="Speed in the narrow pipe" />

      {feedback && <p className={`quest-feedback ${feedback.ok ? "ok" : "bad"}`}>{feedback.text}</p>}
      {solved ? (
        <button type="button" className="btn btn-primary" onClick={() => onResult(firstTry)}>Next</button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={lock}>Open valve</button>
      )}
    </div>
  );
}

/* ---------- Round 2: flow rate (fill the tank) ---------- */
const FILL = { vol: 2.4, d: 20, v: 1.5 };

function FillRound({ onOutcome, onResult }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [firstTry, setFirstTry] = useState(true);
  const [solved, setSolved] = useState(false);

  const q = areaCm(FILL.d) * FILL.v; // m³/s
  const correct = FILL.vol / q;

  const check = () => {
    const t = Number(answer);
    if (!answer || Number.isNaN(t)) return;
    if (Math.abs(t - correct) / correct <= 0.05) {
      setSolved(true);
      setFeedback({ ok: true, text: `Yes! Q = ${fmt(q * 1000)} L/s, so it takes about ${fmt(correct)} s.` });
      onOutcome("win");
    } else {
      setFirstTry(false);
      setFeedback({ ok: false, text: t > correct ? "Too long: the pipe delivers water faster than that." : "Too short: the pipe isn't that fast." });
      onOutcome("fail");
    }
  };

  return (
    <div>
      <HintHelper paused={solved}>
        First the flow rate: <strong>Q = A × v = (π d² ÷ 4) × v</strong>. Then the time: <strong>t = V ÷ Q</strong>.<br />
        Here d = {FILL.d / 100} m, v = {FILL.v} m/s, V = {FILL.vol} m³.
      </HintHelper>
      <p>
        Round 2: a {FILL.d} cm pipe carries water at {FILL.v} m/s into an empty {FILL.vol} m³ tank. How many
        <strong> seconds</strong> until it's full?
      </p>
      <svg viewBox="0 0 520 150" className="plumber-svg" role="img" aria-label="Pipe filling a tank">
        <rect x="20" y="55" width="260" height="40" fill="#7d8a93" stroke="#253d43" strokeWidth="3" />
        <line x1="22" y1="75" x2="278" y2="75" className="pipe-flow" style={{ animationDuration: `${1.6 / FILL.v}s` }} />
        <rect x="300" y="10" width="160" height="130" fill="#e9eef0" stroke="#253d43" strokeWidth="3" />
        <rect x="302" y="138" width="156" height="0" fill="#4ca9c7" className={`tank-water${solved ? " full" : ""}`} />
        <text x="380" y="80" fontSize="12" textAnchor="middle" fill="#1b2d2f">{FILL.vol} m³</text>
      </svg>

      <div className="d-flex gap-2 align-items-center mb-2">
        <input type="number" className="form-control plumber-input" value={answer} disabled={solved}
          placeholder="seconds" onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()} aria-label="Time in seconds" />
        <span>s</span>
      </div>

      {feedback && <p className={`quest-feedback ${feedback.ok ? "ok" : "bad"}`}>{feedback.text}</p>}
      {solved ? (
        <button type="button" className="btn btn-primary" onClick={() => onResult(firstTry)}>Next</button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={check}>Check</button>
      )}
    </div>
  );
}

/* ---------- Round 3: Bernoulli (find the lowest-pressure section) ---------- */
const BERN = { sections: [12, 6, 9], v1: 2, p1: 200 }; // diameters (cm), speed (m/s), pressure (kPa)
const bern = BERN.sections.map((d) => {
  const v = BERN.v1 * (BERN.sections[0] / d) ** 2;
  return { d, v, p: BERN.p1 + (0.5 * 1000 * (BERN.v1 ** 2 - v ** 2)) / 1000 };
});
const LOWEST = bern.reduce((best, s, i) => (s.p < bern[best].p ? i : best), 0);

function BernoulliRound({ onOutcome, onResult }) {
  const [picked, setPicked] = useState(null);
  const revealed = picked !== null;
  const correct = picked === LOWEST;

  const pick = (i) => {
    if (revealed) return;
    setPicked(i);
    onOutcome(i === LOWEST ? "win" : "fail");
  };

  return (
    <div>
      <HintHelper paused={revealed}>
        In a level pipe, <strong>P + ½ρv²</strong> stays constant (Bernoulli): faster water means lower pressure.
        And by continuity (A₁v₁ = A₂v₂), the narrowest part has the fastest water.
      </HintHelper>
      <p>
        Round 3: water flows left to right through three pipe sections. One of them is the weak spot where the
        pressure drops the most and the pipe cracks. Tap it!
      </p>
      <svg viewBox="0 0 540 190" className="plumber-svg" role="img" aria-label="Three pipe sections of different widths">
        {bern.map((s, i) => {
          const h = s.d * 8;
          const x = 20 + i * 170;
          return (
            <g key={s.d} onClick={() => pick(i)} style={{ cursor: revealed ? "default" : "pointer" }}>
              <rect x={x} y={90 - h / 2} width="160" height={h}
                fill={revealed && i === LOWEST ? "#d7a85f" : picked === i ? "#c46b5f" : "#7d8a93"}
                stroke="#253d43" strokeWidth="3" />
              <line x1={x + 2} y1="90" x2={x + 158} y2="90" className="pipe-flow"
                style={{ animationDuration: `${revealed ? Math.max(1.6 / s.v, 0.1) : 0.8}s` }} />
              <text x={x + 80} y="178" fontSize="12" textAnchor="middle" fill="#1b2d2f">
                {revealed ? `${s.d} cm · ${fmt(s.v)} m/s · ${fmt(s.p, 0)} kPa` : `${s.d} cm`}
              </text>
            </g>
          );
        })}
      </svg>

      {revealed && (
        <>
          <p className={`quest-feedback ${correct ? "ok" : "bad"}`}>
            {correct ? "Spot on! " : "Not quite. "}
            The {bern[LOWEST].d} cm section is narrowest, so the water is fastest there ({fmt(bern[LOWEST].v)} m/s)
            and the pressure drops to {fmt(bern[LOWEST].p, 0)} kPa.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => onResult(correct)}>Finish</button>
        </>
      )}
    </div>
  );
}

const ROUNDS = [SqueezeRound, FillRound, BernoulliRound];
const TOTAL = ROUNDS.length;

/* ---------- Page ---------- */
function PlumberHouse() {
  const currentUser = getCurrentUser();
  // "talk" | "ask" | "declined" | "yes" | 0..2 (rounds) | "done"
  const [stage, setStage] = useState("talk");
  const [line, setLine] = useState(0);
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState(null);
  const [introDone, setIntroDone] = useState(-1);
  const [outcome, setOutcome] = useState(null);

  const inRound = typeof stage === "number";
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => inRound && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!inRound) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [inRound]);

  if (!currentUser) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Access required</h1>
          <p>Please log in to visit the plumber.</p>
          <Link to="/login" className="btn btn-primary">Log in</Link>
        </div>
      </main>
    );
  }

  const spriteId = getAvatar(currentUser.id)?.spriteId ?? DEFAULT_AVATAR_ID;
  const showIntro = inRound && introDone !== stage;
  const Round = inRound ? ROUNDS[stage] : null;

  const react = (kind) => setOutcome({ kind, id: Date.now() });

  const finish = (points) => {
    const progress = getProgress(currentUser.id);
    const firstCompletion = !(progress.completedQuests ?? []).includes(QUEST_ID);
    setProgress(currentUser.id, {
      ...progress,
      completedQuests: [...new Set([...(progress.completedQuests ?? []), QUEST_ID])],
      unlockedQuests: [...new Set([...(progress.unlockedQuests ?? []), QUEST_ID])],
    });
    setScore(points);
    setStage("done");
    react("cheer");

    const breakdown = calculateQuestScore(TOTAL, points);
    const account = firstCompletion ? addScore(currentUser.id, breakdown.total) : null;
    recordQuestResult(currentUser.id, QUEST_ID, points, TOTAL, firstCompletion);
    const now = currentUser.score ?? 0;
    // let the avatar celebrate on stage first, then show the summary screen
    setTimeout(
      () =>
        setSummary({
          title: "The Plumber's Pipe Panic",
          summary: firstCompletion ? breakdown : { completion: 0, rounds: 0, bonus: 0, total: 0 },
          totalRounds: TOTAL,
          firstTryRounds: points,
          before: account?.before ?? now,
          after: account?.after ?? now,
          replay: !firstCompletion,
        }),
      2200,
    );
  };

  const advance = (success) => {
    const points = score + (success ? 1 : 0);
    if (stage + 1 >= TOTAL) finish(points);
    else {
      setScore(points);
      setStage(stage + 1);
    }
  };

  const mood = stage === "done" ? "joyful" : inRound || stage === "yes" ? "hopeful" : "distressed";

  let speech = null;
  if (stage === "talk") {
    speech = (
      <Dialogue key={line} text={TALK[line]} onNext={() => (line + 1 < TALK.length ? setLine(line + 1) : setStage("ask"))} />
    );
  } else if (stage === "yes") {
    speech = (
      <Dialogue key="yes" text="Thank you, thank you! Let's start with how water flows through pipes. Show me what you've got!"
        nextLabel="Let's go!" onNext={() => setStage(0)} />
    );
  } else if (stage === "declined") {
    speech = <div className="plumber-speech"><strong>Plumber:</strong> Oh... that's okay. I'll be here, bailing water. Come back if you change your mind!</div>;
  } else if (stage === "done") {
    speech = (
      <div className="plumber-speech">
        <strong>Plumber:</strong> {score === TOTAL ? "Perfect! Every pipe is flowing just right!" : "The pipes are flowing again. You saved my house!"}
      </div>
    );
  }

  return (
    <main className="container py-4">
      <PageReveal />
      {summary && (
        <QuestSummary {...summary} spriteId={spriteId} onContinue={() => setSummary(null)} />
      )}
      {blocker.state === "blocked" && (
        <ConfirmLeave onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />
      )}

      <div className="pixel-panel quest-panel">
        <h1 className="pixel-heading md">The Plumber's Pipe Panic</h1>
        <ActionStage outcome={outcome} spriteId={spriteId} mood={mood} />

        {speech}

        {stage === "ask" && (
          <div className="plumber-speech">
            <strong>Plumber:</strong> {ASK}
            <div className="mt-2">
              <button type="button" className="btn btn-primary me-2" onClick={() => setStage("yes")}>Yes, I'll help!</button>
              <button type="button" className="btn btn-secondary" onClick={() => setStage("declined")}>Not right now</button>
            </div>
          </div>
        )}

        {stage === "declined" && <Link to="/intro" className="btn btn-primary mt-2">Back to lobby</Link>}

        {showIntro && <RoundIntro key={stage} round={stage + 1} spriteId={spriteId} onDone={() => setIntroDone(stage)} />}
        {inRound && !showIntro && <Round key={stage} onOutcome={react} onResult={advance} />}

        {stage === "done" && (
          <div className="mt-2">
            <p>First-try score: <strong>{score}/{TOTAL}</strong>. Quest saved!</p>
            <Link to="/intro" className="btn btn-primary">Back to lobby</Link>
            <Link to={`/endless/${QUEST_ID}`} className="btn btn-secondary ms-2">Endless mode</Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default PlumberHouse;
