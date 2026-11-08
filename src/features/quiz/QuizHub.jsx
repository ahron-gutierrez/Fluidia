import { Link } from "react-router-dom";
import BgMusic from "../../components/BgMusic";

import { getCurrentUser, getProgress } from "../../data/gameData";
import { POINTS_PER_CORRECT, QUIZZES } from "./quizData";
import "../../styles/Endless.css";

// The Quiz Hall: pick a quiz. Same look as the endless-mode hub.
function QuizHub() {
  const user = getCurrentUser();

  if (!user) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Access required</h1>
          <p>Please log in to take the quizzes.</p>
          <Link to="/login" className="btn btn-primary">Log in</Link>
        </div>
      </main>
    );
  }

  const results = getProgress(user.id).quizzes ?? {};

  return (
    <main className="container py-4">
      <BgMusic track="account"/>
      <div className="pixel-panel endless-panel">
        <p className="eyebrow accent">Quiz Hall</p>
        <h1 className="pixel-heading md">Test your knowledge</h1>
        <p className="lead">
          Five quizzes, 15 questions each. The questions and answers are shuffled every time, so no two attempts look
          the same. Earn {POINTS_PER_CORRECT} points for every correct answer you add to your personal best.
        </p>

        <div className="endless-grid">
          {QUIZZES.map((quiz) => {
            const best = results[quiz.id];
            return (
              <article key={quiz.id} className="endless-card" style={{ "--accent": quiz.accent }}>
                <div className="endless-card-icon">{quiz.icon}</div>
                <h2>{quiz.title}</h2>
                <p className="endless-stats">
                  {best ? (
                    <>
                      Best <strong>{best.best}/{quiz.questions.length}</strong> · {best.attempts} attempt{best.attempts === 1 ? "" : "s"}
                    </>
                  ) : (
                    `${quiz.questions.length} questions · not tried yet`
                  )}
                </p>
                <Link to={`/quiz/${quiz.id}`} className="btn btn-primary">{best ? "Try again" : "Start quiz"}</Link>
              </article>
            );
          })}
        </div>

        <div className="inline-actions mt-3">
          <Link to="/achievements" className="btn btn-secondary">Achievements</Link>
          <Link to="/intro" className="btn btn-secondary">Back to the castle</Link>
        </div>
      </div>
    </main>
  );
}

export default QuizHub;
