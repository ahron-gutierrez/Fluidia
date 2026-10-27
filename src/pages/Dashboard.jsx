import { Link, useNavigate } from "react-router-dom";

import {
  DEFAULT_PROGRESS,
  QUESTS,
  getCurrentUser,
  getProgress,
  getQuestById,
  getQuestProgressLabel,
  setCurrentUser,
} from "../data/gameData";

function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Access required</h1>
          <p>Please log in to continue your Fluidia journey.</p>
          <Link to="/login" className="btn btn-primary">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const progress = getProgress(currentUser.id);
  const unlockedIds = progress.unlockedQuests ?? DEFAULT_PROGRESS.unlockedQuests;
  const currentQuest = getQuestById(progress.currentQuest || QUESTS[0].id);

  const completedCount = progress.completedQuests?.length ?? 0;
  const progressPercent = Math.round((completedCount / QUESTS.length) * 100);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <main className="container py-5 dashboard-layout">
      <section className="pixel-panel hero-panel">
        <div>
          <p className="eyebrow accent">My Progress</p>
          <h1 className="pixel-heading md">Welcome back, {currentUser.name || "Explorer"}.</h1>
          <p className="lead">
            The laws of flow are still hidden in plain sight. Continue tracing the clues across the world map.
          </p>
        </div>
        <div className="progress-block">
          <span className="progress-label">Research progress</span>
          <strong>{progressPercent}%</strong>
          <div className="progress-bar">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <small>{getQuestProgressLabel(progress)}</small>
        </div>
      </section>

      <section className="map-grid">
        {QUESTS.map((quest) => {
          const unlocked = unlockedIds.includes(quest.id);
          const completed = progress.completedQuests?.includes(quest.id);

          return (
            <Link
              key={quest.id}
              to={unlocked ? quest.route : "#"}
              className={`quest-node ${completed ? "complete" : ""} ${unlocked ? "" : "locked"}`}
              aria-disabled={!unlocked}
              onClick={(event) => {
                if (!unlocked) {
                  event.preventDefault();
                }
              }}
            >
              <span className="marker-dot" />
              <strong>{"{Quest}"}</strong>
              <small>{quest.area}</small>
              <span className="quest-status">
                {completed ? "Solved" : unlocked ? "Unlocked" : "Locked"}
              </span>
            </Link>
          );
        })}
      </section>

      <section className="dashboard-columns">
        <article className="pixel-panel side-panel">
          <p className="eyebrow accent">Continue quest</p>
          <h2 className="pixel-heading sm">{"{Quest}"}</h2>
          <p>{"{Description}"}</p>
          <div className="inline-actions">
            <Link to={currentQuest.route} className="btn btn-primary">
              Continue
            </Link>
            <Link to="/intro" className="btn btn-secondary">
              Replay story
            </Link>
          </div>
        </article>

        <article className="pixel-panel side-panel">
          <p className="eyebrow accent">Journal</p>
          <ul className="quest-log">
            {QUESTS.map((quest) => (
              <li key={quest.id} className={progress.completedQuests?.includes(quest.id) ? "done" : ""}>
                <span>{"{Quest}"}</span>
                <strong>{progress.completedQuests?.includes(quest.id) ? "Complete" : "In progress"}</strong>
              </li>
            ))}
          </ul>
        </article>

        <aside className="pixel-panel side-panel profile-panel">
          <p className="eyebrow accent">Profile</p>
          <div className="profile-identity">
            <div className="avatar">{(currentUser.name || "A").slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{currentUser.name || "Explorer"}</strong>
              <small>{currentUser.email}</small>
            </div>
          </div>
          <div className="inline-actions stacked">
            <Link to="/account/edit" className="btn btn-secondary">
              Account settings
            </Link>
            <button type="button" className="btn btn-primary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Dashboard;
