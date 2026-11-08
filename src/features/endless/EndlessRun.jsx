import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useBlocker, useParams } from "react-router-dom";
import BgMusic from "../../components/BgMusic";

import AnimatedAvatar from "../../components/AnimatedAvatar";
import ConfirmLeave from "../../components/ConfirmLeave";
import { recordEndlessRun } from "../../data/achievements";
import { AVATAR_POSES, DEFAULT_AVATAR_ID } from "../../data/avatarAssets";
import { addScore, getAvatar, getCurrentUser, getProgress } from "../../data/gameData";
import * as fx from "../../utils/pixelFx";
import { playSfx } from "../../utils/sfx";
import { ENDLESS_TOPICS, START_LIVES, makeQuestion, pointsFor, secondsFor } from "./generators";
import "../../styles/Summary.css";
import "../../styles/Endless.css";

const POSE = Object.fromEntries(AVATAR_POSES.map((p) => [p.label, p.row]));
const AUTO_NEXT_MS = 1300;

const freshRun = () => ({ lives: START_LIVES, level: 0, correct: 0, streak: 0, bestStreak: 0, score: 0, perfectLevel: 0 });

function EndlessRun() {
  const { questId } = useParams();
  const topic = ENDLESS_TOPICS[questId];
  const user = getCurrentUser();

  const run = useRef(freshRun());
  const [runView, setRunView] = useState(freshRun()); // what the screen shows (run.current is the live copy)
  const redraw = () => setRunView({ ...run.current });
  const [phase, setPhase] = useState("ready"); // ready | playing | feedback | over
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null); // option index, or -1 when time ran out
  const [limit, setLimit] = useState(40);
  const [timeLeft, setTimeLeft] = useState(40);
  const [pose, setPose] = useState("Idle");
  const [gain, setGain] = useState(0);
  const [summary, setSummary] = useState(null);
  const deadline = useRef(0);
  const autoNext = useRef(0);
  const avatarRef = useRef(null);

  const inRun = phase === "playing" || phase === "feedback";
  const blocker = useBlocker(({ currentLocation, nextLocation }) => inRun && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!inRun) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [inRun]);

  useEffect(() => () => clearTimeout(autoNext.current), []);

  const nextQuestion = () => {
    const r = run.current;
    const seconds = secondsFor(r.level);
    setQuestion(makeQuestion(questId, r.level));
    setPicked(null);
    setPose("Idle");
    setLimit(seconds);
    setTimeLeft(seconds);
    deadline.current = performance.now() + seconds * 1000;
    setPhase("playing");
  };

  const start = () => {
    run.current = freshRun();
    redraw();
    setSummary(null);
    nextQuestion();
  };

  const finishRun = () => {
    const r = run.current;
    const account = r.score > 0 ? addScore(user.id, r.score) : null;
    const previousBest = getProgress(user.id).endless?.[questId]?.best ?? 0;
    recordEndlessRun(user.id, questId, {
      correct: r.correct, level: r.level, bestStreak: r.bestStreak, score: r.score, perfectLevel: r.perfectLevel,
    });
    setSummary({
      ...r,
      before: account?.before ?? user.score ?? 0,
      after: account?.after ?? user.score ?? 0,
      newBest: r.score > previousBest,
    });
    setPhase("over");
    const w = window.innerWidth;
    const h = window.innerHeight;
    setTimeout(() => { fx.confetti(0, h, -Math.PI / 3, 0.7); fx.confetti(w, h, (-2 * Math.PI) / 3, 0.7); }, 400);
  };

  const advance = () => {
    clearTimeout(autoNext.current);
    if (run.current.lives <= 0) finishRun();
    else nextQuestion();
  };

  const answer = (index) => {
    if (phase !== "playing" || !question) return;
    const r = run.current;
    const correct = index >= 0 && question.options[index].correct;
    const spot = avatarRef.current ? fx.centerOf(avatarRef.current) : { x: 200, y: 200 };
    setPicked(index);
    setPhase("feedback");

    if (correct) {
      r.streak += 1;
      r.bestStreak = Math.max(r.bestStreak, r.streak);
      const points = pointsFor(r.level, r.streak);
      r.score += points;
      r.correct += 1;
      r.level += 1;
      if (r.lives === START_LIVES) r.perfectLevel = r.level;
      setGain(points);
      setPose("Jump");
      fx.sparkle(spot.x, spot.y - 10);
      playSfx("correct");
      autoNext.current = setTimeout(advance, AUTO_NEXT_MS);
    } else {
      r.streak = 0;
      r.lives -= 1;
      setGain(0);
      setPose(r.lives <= 0 ? "Fall" : "Shocked");
      fx.sparks(spot.x, spot.y - 20);
      fx.puff(spot.x, spot.y + 30, ["#c46b5f", "#9c4a42", "#f4e9c9"]);
      playSfx("wrong");
    }
    redraw();
  };

  // countdown
  useEffect(() => {
    if (phase !== "playing") return undefined;
    const id = setInterval(() => {
      const left = (deadline.current - performance.now()) / 1000;
      if (left <= 0) { clearInterval(id); setTimeLeft(0); answer(-1); }
      else setTimeLeft(left);
    }, 100);
    return () => clearInterval(id);
  });

  // keyboard: 1-4 to answer, Enter / Space to continue
  useEffect(() => {
    const onKey = (e) => {
      if (phase === "playing" && /^[1-4]$/.test(e.key) && question?.options[Number(e.key) - 1]) answer(Number(e.key) - 1);
      else if (phase === "feedback" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!topic) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Mode not found</h1>
          <Link to="/endless" className="btn btn-primary">Back to endless mode</Link>
        </div>
      </main>
    );
  }
  if (!user || !(getProgress(user.id).completedQuests ?? []).includes(questId)) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Locked</h1>
          <p>{user ? "Complete this quest in Adventure Mode first." : "Please log in to play."}</p>
          <Link to={user ? "/endless" : "/login"} className="btn btn-primary">{user ? "Back" : "Log in"}</Link>
        </div>
      </main>
    );
  }

  const r = runView;
  const spriteId = getAvatar(user.id)?.spriteId ?? DEFAULT_AVATAR_ID;
  const wasCorrect = picked !== null && picked >= 0 && question.options[picked].correct;
  const urgent = timeLeft / limit < 0.25;

  return (
    <main className="container py-4">
      <BgMusic track="endless"/>
      {blocker.state === "blocked" && <ConfirmLeave onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />}

      <div className="pixel-panel endless-panel" style={{ "--accent": topic.accent }}>
        <p className="eyebrow accent">Endless · {topic.name}</p>

        <div className="endless-hud">
          <div className="endless-lives" aria-label={`${r.lives} lives left`}>
            {Array.from({ length: START_LIVES }, (_, i) => (
              <span key={i} className={i < r.lives ? "alive" : "lost"}>{i < r.lives ? "♥" : "♡"}</span>
            ))}
          </div>
          <div>Level <strong>{r.level + 1}</strong></div>
          <div>Score <strong>{r.score}</strong></div>
          <div>Streak <strong>{r.streak}</strong></div>
        </div>

        <div className={`endless-stage topic-${questId}`}>
          <div ref={avatarRef} className="endless-avatar">
            <AnimatedAvatar spriteId={spriteId} row={POSE[pose]} animate size={96} />
          </div>
          {phase === "feedback" && wasCorrect && <div className="endless-gain">+{gain}</div>}
        </div>

        {phase === "ready" && (
          <div className="endless-ready">
            <p>
              {START_LIVES} lives. Questions get harder every few levels, the timer shrinks, and each right answer is
              worth more. Keys <kbd>1</kbd>–<kbd>4</kbd> answer fast.
            </p>
            <button type="button" className="btn btn-primary" onClick={start}>Start the run</button>
            <Link to="/endless" className="btn btn-secondary ms-2">Back</Link>
          </div>
        )}

        {(phase === "playing" || phase === "feedback") && question && (
          <div className="endless-question">
            <div className={`endless-timer${urgent ? " urgent" : ""}`} aria-hidden="true">
              <span style={{ width: `${phase === "feedback" ? (picked === -1 ? 0 : (timeLeft / limit) * 100) : (timeLeft / limit) * 100}%` }} />
            </div>
            <p className="endless-prompt">{question.prompt}</p>
            <p className="endless-formula">{question.formula}</p>
            <div className="endless-options">
              {question.options.map((option, i) => {
                let state = "";
                if (phase === "feedback") state = option.correct ? " right" : i === picked ? " wrong" : " dim";
                return (
                  <button key={i} type="button" className={`endless-option${state}`} disabled={phase === "feedback"} onClick={() => answer(i)}>
                    <kbd>{i + 1}</kbd> {option.text}
                  </button>
                );
              })}
            </div>

            {phase === "feedback" && (
              <div className={`quest-feedback ${wasCorrect ? "ok" : "bad"}`}>
                <strong>{wasCorrect ? `Correct! +${gain} points` : picked === -1 ? "Time's up!" : "Not quite."}</strong>
                <div>{question.explain}</div>
                {!wasCorrect && (
                  <button type="button" className="btn btn-primary mt-2" onClick={advance}>
                    {r.lives <= 0 ? "See results" : "Continue"} <kbd>Enter</kbd>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {phase === "over" && summary && createPortal(
        <div className="summary-overlay" role="dialog" aria-modal="true">
          <div className="summary-hero">
            <AnimatedAvatar spriteId={spriteId} row={POSE[summary.correct >= 8 ? "Jump" : "Fall"]} animate size={160} />
          </div>
          <div className="pixel-panel summary-card">
            <p className="eyebrow accent">{summary.newBest ? "New personal best!" : "Run over"}</p>
            <h2 className="pixel-heading md">Endless · {topic.name}</h2>
            <div className="summary-row"><span>Questions answered right</span><strong>{summary.correct}</strong></div>
            <div className="summary-row"><span>Level reached</span><strong>{summary.level + 1}</strong></div>
            <div className="summary-row"><span>Best streak</span><strong>{summary.bestStreak}</strong></div>
            <div className="summary-total">
              <small>Points added to your account</small>
              <div className="summary-total-number">+{summary.score}</div>
              <small>Account score: {summary.before} → <strong>{summary.after}</strong></small>
            </div>
            <div className="inline-actions mt-3" style={{ justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={start}>Run again</button>
              <Link to="/endless" className="btn btn-secondary">Endless hub</Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </main>
  );
}

export default EndlessRun;
