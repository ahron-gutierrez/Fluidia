import { useEffect, useState } from "react";
import { Link, useBlocker } from "react-router-dom";

import BuoyancyPlatformer from "../components/BuoyancyPlatformer";
import ConfirmLeave from "../components/ConfirmLeave";
import Dialogue from "../components/Dialogue";
import HintHelper from "../components/HintHelper";
import PageReveal from "../components/PageReveal";
import QuestSummary from "../components/QuestSummary";
import RoundIntro from "../components/RoundIntro";
import SpriteSlot from "../components/SpriteSlot";
import { DEFAULT_AVATAR_ID } from "../data/avatarAssets";
import {
  addScore,
  calculateQuestScore,
  getAvatar,
  getCurrentUser,
  getProgress,
  setProgress,
} from "../data/gameData";
import "../styles/Plumber.css";

const QUEST_ID = "sunken-cargo"; // the buoyancy quest

const TALK = [
  "Welcome to the laboratory! I'm so glad you came.",
  "Today's experiment is about buoyancy: whether something floats or sinks depends on its density compared to the liquid it's in.",
  "Each tank has a different liquid. Find the object that floats at just the right level! Drop objects into the tank to test them.",
];

// Each round: a different liquid, a target "% submerged", one right object and some decoys.
const ROUNDS = [
  { fluid: { name: "Fresh water", rho: 1000, color: "#4ca9c7" }, target: 0.5, right: "pine", decoys: ["cork", "oak", "ice", "aluminum"] },
  { fluid: { name: "Seawater", rho: 1025, color: "#2f7fa3" }, target: 0.75, right: "oak", decoys: ["pine", "cork", "ice", "brick"] },
  { fluid: { name: "Salt-saturated brine", rho: 1200, color: "#3f9d8f" }, target: 0.9, right: "rubber", decoys: ["ice", "oak", "pine", "steel"] },
];
const TOTAL = ROUNDS.length;
const pct = (f) => Math.round(f * 100);

function LabRound({ round, spriteId, onResult }) {
  const [feedback, setFeedback] = useState(null);
  const [solved, setSolved] = useState(false);
  const [firstTry, setFirstTry] = useState(null); // result of the first object dropped

  const handle = (r) => {
    if (r.fell) {
      setFeedback({ ok: false, text: "You fell into the tank! Back to the start. (Any object you carried returns to its spot.)" });
      return;
    }
    setFirstTry((prev) => (prev === null ? r.good : prev));
    if (r.good) {
      setSolved(true);
      setFeedback({ ok: true, text: `${r.name} (ρ = ${r.rho}) floats with ${pct(r.frac)}% underwater. That's the one! Fraction submerged = ρ_object ÷ ρ_fluid.` });
    } else if (r.sinks) {
      setFeedback({ ok: false, text: `${r.name} (ρ = ${r.rho}) sank! It's denser than the liquid, so it can't float.` });
    } else {
      setFeedback({ ok: false, text: `${r.name} (ρ = ${r.rho}) floats with ${pct(r.frac)}% underwater, but the goal is about ${pct(round.target)}%. Try another object.` });
    }
  };

  return (
    <div>
      <HintHelper delayMs={45000} paused={solved}>
        A floating object sinks until the water it pushes aside weighs as much as it does, so the fraction underwater is{" "}
        <strong>ρ_object ÷ ρ_fluid</strong>.<br />
        You need ρ_object ≈ {round.target} × {round.fluid.rho} kg/m³.
      </HintHelper>

      <BuoyancyPlatformer round={round} spriteId={spriteId} solved={solved} onResult={handle} />

      {feedback && <p className={`quest-feedback ${feedback.ok ? "ok" : "bad"} mt-2`}>{feedback.text}</p>}
      {solved && (
        <button type="button" className="btn btn-primary" onClick={() => onResult(firstTry === true)}>
          {round === ROUNDS[TOTAL - 1] ? "Finish" : "Next"}
        </button>
      )}
    </div>
  );
}

function LaboratoryQuest() {
  const currentUser = getCurrentUser();
  const [stage, setStage] = useState("talk"); // "talk" | "ready" | 0..2 | "done"
  const [line, setLine] = useState(0);
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState(null);
  const [introDone, setIntroDone] = useState(-1);

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
          <p>Please log in to visit the laboratory.</p>
          <Link to="/login" className="btn btn-primary">Log in</Link>
        </div>
      </main>
    );
  }

  const spriteId = getAvatar(currentUser.id)?.spriteId ?? DEFAULT_AVATAR_ID;
  const showIntro = inRound && introDone !== stage;

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

    const breakdown = calculateQuestScore(TOTAL, points);
    const account = firstCompletion ? addScore(currentUser.id, breakdown.total) : null;
    const now = currentUser.score ?? 0;
    setSummary({
      title: "The Buoyancy Lab",
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
    if (stage + 1 >= TOTAL) finish(points);
    else {
      setScore(points);
      setStage(stage + 1);
    }
  };

  return (
    <main className="container py-4">
      <PageReveal />
      {summary && <QuestSummary {...summary} spriteId={spriteId} onContinue={() => setSummary(null)} />}
      {blocker.state === "blocked" && (
        <ConfirmLeave onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />
      )}

      <div className="pixel-panel quest-panel" style={{ maxWidth: 860 }}>
        <h1 className="pixel-heading md">The Buoyancy Lab</h1>

        {!inRound && (
          <div className="quest-guide">
            <div className="quest-guide-sprite">
              <SpriteSlot src="/lobby/scientist.png" label="scientist.png" />
            </div>
            <div style={{ flex: 1 }}>
              {stage === "talk" && (
                <Dialogue key={line} speaker="Scientist" text={TALK[line]}
                  onNext={() => (line + 1 < TALK.length ? setLine(line + 1) : setStage("ready"))} />
              )}
              {stage === "ready" && (
                <Dialogue key="ready" speaker="Scientist"
                  text="Controls: A/D to walk, W or Space to jump, E to pick up and drop. Mind the gap: the tank is deep!"
                  nextLabel="Let's experiment!" onNext={() => setStage(0)} />
              )}
              {stage === "done" && (
                <div className="plumber-speech">
                  <strong>Scientist:</strong> {score === TOTAL ? "Flawless! You have a real feel for density." : "Wonderful work! The experiment is a success."}
                </div>
              )}
            </div>
          </div>
        )}

        {showIntro && <RoundIntro key={stage} round={stage + 1} spriteId={spriteId} onDone={() => setIntroDone(stage)} />}
        {inRound && !showIntro && (
          <LabRound key={stage} round={ROUNDS[stage]} spriteId={spriteId} onResult={advance} />
        )}

        {stage === "done" && (
          <div className="mt-2">
            <p>First-try score: <strong>{score}/{TOTAL}</strong>. Quest saved!</p>
            <Link to="/intro" className="btn btn-primary">Back to lobby</Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default LaboratoryQuest;
