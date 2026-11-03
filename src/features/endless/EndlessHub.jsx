import { Link } from "react-router-dom";

import { getCurrentUser, getProgress } from "../../data/gameData";
import { ENDLESS_TOPICS, START_LIVES } from "./generators";
import "../../styles/Endless.css";

// Lists the endless modes. Each one unlocks when its quest has been completed.
function EndlessHub() {
  const user = getCurrentUser();

  if (!user) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Access required</h1>
          <p>Please log in to play endless mode.</p>
          <Link to="/login" className="btn btn-primary">Log in</Link>
        </div>
      </main>
    );
  }

  const progress = getProgress(user.id);
  const completed = progress.completedQuests ?? [];

  return (
    <main className="container py-4">
      <div className="pixel-panel endless-panel">
        <p className="eyebrow accent">Endless mode</p>
        <h1 className="pixel-heading md">How far can you go?</h1>
        <p className="lead">
          Random questions that get harder and worth more points every level. You have {START_LIVES} lives: a wrong
          answer or running out of time costs one. Lose them all and the run is over.
        </p>

        <div className="endless-grid">
          {Object.entries(ENDLESS_TOPICS).map(([id, topic]) => {
            const open = completed.includes(id);
            const best = progress.endless?.[id];
            return (
              <article key={id} className={`endless-card${open ? "" : " locked"}`} style={{ "--accent": topic.accent }}>
                <div className="endless-card-icon">{open ? topic.icon : "🔒"}</div>
                <h2>{topic.name}</h2>
                {open ? (
                  <>
                    <p className="endless-stats">
                      {best
                        ? <>Best score <strong>{best.best}</strong> · best level <strong>{best.bestLevel}</strong> · {best.runs} run{best.runs === 1 ? "" : "s"}</>
                        : "No runs yet. Set the first record!"}
                    </p>
                    <Link to={`/endless/${id}`} className="btn btn-primary">Start a run</Link>
                  </>
                ) : (
                  <p className="endless-stats">Complete this quest in Adventure Mode to unlock it.</p>
                )}
              </article>
            );
          })}
        </div>

        <div className="inline-actions mt-3">
          <Link to="/achievements" className="btn btn-secondary">Achievements</Link>
          <Link to="/intro" className="btn btn-secondary">Adventure Mode</Link>
        </div>
      </div>
    </main>
  );
}

export default EndlessHub;
