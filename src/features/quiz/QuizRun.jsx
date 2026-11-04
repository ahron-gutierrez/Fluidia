import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useBlocker, useParams } from "react-router-dom";

import AnimatedAvatar from "../../components/AnimatedAvatar";
import ConfirmLeave from "../../components/ConfirmLeave";
import { recordQuizResult } from "../../data/achievements";
import { AVATAR_POSES, DEFAULT_AVATAR_ID } from "../../data/avatarAssets";
import { addScore, getAvatar, getCurrentUser, getProgress } from "../../data/gameData";
import * as fx from "../../utils/pixelFx";
import { playSfx } from "../../utils/sfx";
import { shuffle } from "../endless/generators";
import { LETTERS, POINTS_PER_CORRECT, QUIZ_BY_ID } from "./quizData";
import "../../styles/Summary.css";
import "../../styles/Endless.css";

const POSE = Object.fromEntries(AVATAR_POSES.map((p) => [p.label, p.row]));
const AUTO_NEXT_MS = 1100;

// shuffled question order + shuffled choices (except choices that refer to each other, like "Both A and B")
const prepare = (quiz) =>
  shuffle(quiz.questions).map((item) => {
    const options = item.options.map((text, i) => ({ text, correct: i === item.answer }));
    return { text: item.text, options: item.keepOrder ? options : shuffle(options) };
  });

// A quiz run, built on the endless-mode screen: same stage, options and summary card.
function QuizRun() {
  const { quizId } = useParams();
  const quiz = QUIZ_BY_ID[quizId];
  const user = getCurrentUser();

  const [phase, setPhase] = useState("ready"); // ready | playing | feedback | over
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [pose, setPose] = useState("Idle");
  const [tally, setTally] = useState({ correct: 0, missed: [] });
  const [summary, setSummary] = useState(null);
  const tallyRef = useRef(tally);
  const advanceRef = useRef(null);
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

  const start = () => {
    tallyRef.current = { correct: 0, missed: [] };
    setTally(tallyRef.current);
    setItems(prepare(quiz));
    setIndex(0);
    setPicked(null);
    setPose("Idle");
    setSummary(null);
    setPhase("playing");
  };

  const finish = () => {
    const { correct, missed } = tallyRef.current;
    const total = quiz.questions.length;
    const previous = getProgress(user.id).quizzes?.[quizId]?.best ?? 0;
    const gained = Math.max(0, correct - previous) * POINTS_PER_CORRECT; // only improvements earn points
    const account = gained > 0 ? addScore(user.id, gained) : null;
    recordQuizResult(user.id, quizId, correct, total);
    setSummary({
      correct, total, missed, gained, previous,
      before: account?.before ?? user.score ?? 0,
      after: account?.after ?? user.score ?? 0,
    });
    setPhase("over");
    if (correct / total >= 0.8) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setTimeout(() => { fx.confetti(0, h, -Math.PI / 3, 0.7); fx.confetti(w, h, (-2 * Math.PI) / 3, 0.7); }, 400);
    }
  };

  const advance = () => {
    clearTimeout(autoNext.current);
    if (index + 1 >= items.length) {
      finish();
    } else {
      setIndex(index + 1);
      setPicked(null);
      setPose("Idle");
      setPhase("playing");
    }
  };

  useEffect(() => {
    advanceRef.current = advance;
  });

  const answer = (choice) => {
    if (phase !== "playing") return;
    const item = items[index];
    const right = item.options[choice].correct;
    const spot = avatarRef.current ? fx.centerOf(avatarRef.current) : { x: 200, y: 200 };
    setPicked(choice);
    setPhase("feedback");

    if (right) {
      tallyRef.current = { ...tallyRef.current, correct: tallyRef.current.correct + 1 };
      setPose("Jump");
      fx.sparkle(spot.x, spot.y - 10);
      playSfx("correct");
      autoNext.current = setTimeout(() => advanceRef.current(), AUTO_NEXT_MS);
    } else {
      tallyRef.current = {
        ...tallyRef.current,
        missed: [...tallyRef.current.missed, { text: item.text, answer: item.options.find((o) => o.correct).text }],
      };
      setPose("Shocked");
      fx.sparks(spot.x, spot.y - 20);
      playSfx("wrong");
    }
    setTally(tallyRef.current);
  };

  // keyboard: A-D or 1-4 to answer, Enter / Space to continue
  useEffect(() => {
    const onKey = (e) => {
      if (phase === "playing") {
        const key = e.key.toLowerCase();
        const choice = /^[1-4]$/.test(key) ? Number(key) - 1 : "abcd".indexOf(key);
        if (choice >= 0 && choice < 4 && items[index]?.options[choice]) answer(choice);
      } else if (phase === "feedback" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!quiz) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Quiz not found</h1>
          <Link to="/quiz" className="btn btn-primary">Back to the Quiz Hall</Link>
        </div>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Access required</h1>
          <p>Please log in to take the quiz.</p>
          <Link to="/login" className="btn btn-primary">Log in</Link>
        </div>
      </main>
    );
  }

  const item = items[index];
  const spriteId = getAvatar(user.id)?.spriteId ?? DEFAULT_AVATAR_ID;
  const wasCorrect = picked !== null && item?.options[picked].correct;
  const right = item?.options.findIndex((o) => o.correct);

  return (
    <main className="container py-4">
      {blocker.state === "blocked" && <ConfirmLeave onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />}

      <div className="pixel-panel endless-panel" style={{ "--accent": quiz.accent }}>
        <p className="eyebrow accent">Quiz · {quiz.title}</p>

        <div className="endless-hud">
          <div>Question <strong>{phase === "ready" ? 0 : index + 1}</strong> / {quiz.questions.length}</div>
          <div>Correct <strong>{tally.correct}</strong></div>
          <div>Missed <strong>{tally.missed.length}</strong></div>
        </div>

        <div className="endless-stage topic-quiz">
          <div ref={avatarRef} className="endless-avatar">
            <AnimatedAvatar spriteId={spriteId} row={POSE[pose]} animate size={96} />
          </div>
        </div>

        {phase === "ready" && (
          <div className="endless-ready">
            <p>
              {quiz.questions.length} questions in a random order, with the choices shuffled. Keys <kbd>A</kbd>–<kbd>D</kbd> (or{" "}
              <kbd>1</kbd>–<kbd>4</kbd>) answer fast. There's no timer, so take your time.
            </p>
            <button type="button" className="btn btn-primary" onClick={start}>Start the quiz</button>
            <Link to="/quiz" className="btn btn-secondary ms-2">Back</Link>
          </div>
        )}

        {(phase === "playing" || phase === "feedback") && item && (
          <div className="endless-question">
            <div className="endless-timer" aria-hidden="true">
              <span style={{ width: `${((index + (phase === "feedback" ? 1 : 0)) / items.length) * 100}%` }} />
            </div>
            <p className="endless-prompt">{item.text}</p>
            <div className="endless-options quiz-options">
              {item.options.map((option, i) => {
                let state = "";
                if (phase === "feedback") state = option.correct ? " right" : i === picked ? " wrong" : " dim";
                return (
                  <button key={i} type="button" className={`endless-option${state}`} disabled={phase === "feedback"} onClick={() => answer(i)}>
                    <kbd>{LETTERS[i]}</kbd> {option.text}
                  </button>
                );
              })}
            </div>

            {phase === "feedback" && (
              <div className={`quest-feedback ${wasCorrect ? "ok" : "bad"}`}>
                <strong>{wasCorrect ? "Correct!" : `Not quite. The answer is ${LETTERS[right]}.`}</strong>
                {!wasCorrect && (
                  <div>
                    <button type="button" className="btn btn-primary mt-2" onClick={advance}>
                      {index + 1 >= items.length ? "See results" : "Next question"} <kbd>Enter</kbd>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {phase === "over" && summary && createPortal(
        <div className="summary-overlay" role="dialog" aria-modal="true">
          <div className="summary-hero">
            <AnimatedAvatar spriteId={spriteId} row={POSE[summary.correct / summary.total >= 0.6 ? "Jump" : "Shocked"]} animate size={160} />
          </div>
          <div className="pixel-panel summary-card">
            <p className="eyebrow accent">
              {summary.correct === summary.total ? "Perfect score!" : summary.correct / summary.total >= 0.8 ? "Great job!" : summary.correct / summary.total >= 0.6 ? "Nice work" : "Keep practicing"}
            </p>
            <h2 className="pixel-heading md">{quiz.title}</h2>
            <div className="summary-row"><span>Correct answers</span><strong>{summary.correct} / {summary.total}</strong></div>
            <div className="summary-row"><span>Accuracy</span><strong>{Math.round((summary.correct / summary.total) * 100)}%</strong></div>
            <div className="summary-row"><span>Previous best</span><strong>{summary.previous} / {summary.total}</strong></div>
            <div className="summary-total">
              <small>{summary.gained > 0 ? "Points added to your account" : "No new points (beat your best to earn more)"}</small>
              <div className="summary-total-number">+{summary.gained}</div>
              <small>Account score: {summary.before} → <strong>{summary.after}</strong></small>
            </div>

            {summary.missed.length > 0 && (
              <details className="quiz-missed">
                <summary>Review {summary.missed.length} missed question{summary.missed.length === 1 ? "" : "s"}</summary>
                <ul>
                  {summary.missed.map((m, i) => (
                    <li key={i}>
                      <div>{m.text}</div>
                      <div className="quiz-missed-answer">✔ {m.answer}</div>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="inline-actions mt-3" style={{ justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={start}>Retake</button>
              <Link to="/quiz" className="btn btn-secondary">Quiz Hall</Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </main>
  );
}

export default QuizRun;
