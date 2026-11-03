import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ACHIEVEMENTS, RARITY, evaluateAchievements } from "../data/achievements";
import { getCurrentUser, getProgress } from "../data/gameData";
import "../styles/Achievements.css";

const ORDER = ["legendary", "epic", "rare", "common"];

function Achievements() {
  const user = getCurrentUser();
  const [, setVersion] = useState(0);

  // grants anything earned before achievements existed
  useEffect(() => {
    if (user && evaluateAchievements(user.id).length) setVersion((v) => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Access required</h1>
          <p>Please log in to see your achievements.</p>
          <Link to="/login" className="btn btn-primary">Log in</Link>
        </div>
      </main>
    );
  }

  const earned = getProgress(user.id).achievements ?? {};
  const unlocked = ACHIEVEMENTS.filter((a) => earned[a.id]).length;
  const sorted = [...ACHIEVEMENTS].sort(
    (a, b) => Number(!!earned[b.id]) - Number(!!earned[a.id]) || ORDER.indexOf(a.rarity) - ORDER.indexOf(b.rarity)
  );

  return (
    <main className="container py-4">
      <div className="pixel-panel achievements-panel">
        <p className="eyebrow accent">Trophy room</p>
        <h1 className="pixel-heading md">Achievements</h1>
        <p className="lead">
          <strong>{unlocked}</strong> of {ACHIEVEMENTS.length} unlocked
        </p>
        <div className="progress-bar" aria-hidden="true">
          <span style={{ width: `${(unlocked / ACHIEVEMENTS.length) * 100}%` }} />
        </div>

        <div className="achievement-grid">
          {sorted.map((a) => {
            const got = Boolean(earned[a.id]);
            return (
              <article
                key={a.id}
                className={`achievement-card rarity-${a.rarity}${got ? " earned" : " locked"}`}
                style={{ "--rarity": RARITY[a.rarity].color }}
              >
                <div className="achievement-icon">{got ? a.icon : "🔒"}</div>
                <div>
                  <strong>{a.title}</strong>
                  <div className="achievement-desc">{a.desc}</div>
                  <div className="achievement-rarity">
                    {RARITY[a.rarity].label}
                    {got ? ` · ${new Date(earned[a.id]).toLocaleDateString()}` : ""}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Achievements;
