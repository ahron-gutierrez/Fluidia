import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AnimatedAvatar from "../components/AnimatedAvatar";
import AvatarEditor from "../components/AvatarEditor";
import FluidiaMap from "../components/FluidiaMap";
import LocationInfo from "../components/LocationInfo";
import { evaluateAchievements } from "../data/achievements";
import { DEFAULT_AVATAR_ROW } from "../data/avatarAssets";
import {
  QUESTS,
  getAvatar,
  getCurrentUser,
  getProgress,
  getQuestProgressLabel,
} from "../data/gameData";

function Dashboard() {
  const currentUser = getCurrentUser();

  // grants anything earned before achievements existed (shows the pop-ups once)
  useEffect(() => {
    if (currentUser) evaluateAchievements(currentUser.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [avatar, setAvatar] = useState(() => getAvatar(currentUser?.id));
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);

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
  const completedQuests = progress.completedQuests ?? [];
  const completedCount = completedQuests.length;
  const progressPercent = Math.round((completedCount / QUESTS.length) * 100);

  return (
    <main className="container py-5 dashboard-layout dashboard-game-layout">
      <section className="pixel-panel dashboard-welcome-bar">
        <div>
          <h1 className="pixel-heading md">Welcome to Fluidia, {currentUser.name || "Explorer"}!</h1>
          <p>Explore the map and visit each region to uncover the physics of fluids.</p>
        </div>
        <div className="dashboard-progress-summary">
          <div className="progress-summary-heading">
            <span>Journey progress</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="progress-bar" aria-label={`${progressPercent}% journey progress`}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <small>{getQuestProgressLabel(progress)}</small>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <section className="pixel-panel fluidia-map-panel" aria-label="Fluidia map">
          <FluidiaMap userId={currentUser.id} spriteId={avatar?.spriteId} onNearbyChange={setMapLocation} />
        </section>

        <aside className="dashboard-sidebar">
          <section className="pixel-panel dashboard-profile-panel">
            <div className="dashboard-profile-identity">
              <AnimatedAvatar
                className="dashboard-avatar"
                spriteId={avatar?.spriteId}
                row={avatar?.row ?? DEFAULT_AVATAR_ROW}
                animate
                size={52}
              />
              <div className="dashboard-profile-name">
                <strong>{currentUser.name || "Explorer"}</strong>
              </div>
            </div>

            <div className="dashboard-stats">
              <div className="dashboard-stat">
                <span className="stat-icon score-icon" aria-hidden="true">✦</span>
                <div><strong>{currentUser.score ?? 0}</strong><small>Total score</small></div>
              </div>
              <div className="dashboard-stat">
                <span className="stat-icon quest-icon" aria-hidden="true">◈</span>
                <div><strong>{completedCount}/{QUESTS.length}</strong><small>Quests solved</small></div>
              </div>
            </div>

            <div className="dashboard-profile-actions">
              <button
                type="button"
                className="btn btn-secondary dashboard-profile-button"
                onClick={() => setIsAvatarEditorOpen(true)}
              >
                Edit Avatar
              </button>
              <Link to="/account/edit" className="btn btn-secondary dashboard-profile-button">
                View profile
              </Link>
              <Link to="/endless" className="btn btn-secondary dashboard-profile-button">
                Endless
              </Link>
              <Link to="/achievements" className="btn btn-secondary dashboard-profile-button">
                Trophies
              </Link>
            </div>
          </section>

          <LocationInfo location={mapLocation} />
        </aside>
      </div>
      {isAvatarEditorOpen && (
        <AvatarEditor
          userId={currentUser.id}
          onClose={() => setIsAvatarEditorOpen(false)}
          onSave={(savedAvatar) => {
            setAvatar(savedAvatar);
            setIsAvatarEditorOpen(false);
          }}
        />
      )}
    </main>
  );
}

export default Dashboard;
