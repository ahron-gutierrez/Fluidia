import { useState } from "react";
import { Link } from "react-router-dom";

import { QUESTS, getCurrentUser, getProgress, setProgress } from "../../data/gameData";
import ArchimedesSimulation from "./simulation";

function ArchimedesPage() {
  const currentUser = getCurrentUser();
  const currentProgress = currentUser ? getProgress(currentUser.id) : { completedQuests: [] };
  const [questComplete, setQuestComplete] = useState(currentProgress.completedQuests.includes("sunken-cargo"));

  const handleQuestComplete = () => {
    if (!currentUser) {
      return;
    }

    const questId = "sunken-cargo";
    const nextProgress = getProgress(currentUser.id);
    const completedQuests = [...new Set([...nextProgress.completedQuests, questId])];
    const nextQuestIndex = QUESTS.findIndex((quest) => quest.id === questId) + 1;
    const unlockedQuests = [...new Set([...nextProgress.unlockedQuests, ...QUESTS.slice(0, nextQuestIndex + 1).map((quest) => quest.id)])];

    setProgress(currentUser.id, {
      ...nextProgress,
      completedQuests,
      unlockedQuests,
      currentQuest: QUESTS[nextQuestIndex]?.id || questId,
    });
    setQuestComplete(true);
  };

  return (
    <main className="container py-5">
      <div className="pixel-panel quest-panel">
        <p className="eyebrow accent">Fluid statics</p>
        <h1 className="pixel-heading md">Buoyancy and Archimedes' Principle</h1>
        <p className="lead">
          Archimedes' principle states that an immersed object experiences an upward
          force equal to the weight of the fluid it displaces.
        </p>
        <Link to="/sandbox/archimedes" className="btn btn-primary mt-2">
          Open sandbox
        </Link>
      </div>

      <div className="quest-layout-grid">
        <section className="pixel-panel quest-card large-card">
          <h2>Buoyant force</h2>
          <p>
            An object floats when the buoyant force balances its weight. Whether an
            object floats or sinks depends on its average density relative to the fluid.
          </p>
          <p>Archimedes' principle states that a submerged object feels an upward buoyant force equal to the weight of the fluid it displaces.</p>
          <div className="stat-box">
            <strong>Buoyant force = ρfluid × g × Vdisplaced</strong>
            <span>When buoyancy exceeds weight, the object rises.</span>
          </div>
        </section>

        <section className="pixel-panel quest-card large-card simulation-card">
          <h2>Simulation</h2>
          <ArchimedesSimulation />
        </section>
      </div>

      <div className="inline-actions">
        <button type="button" className="btn btn-secondary" onClick={handleQuestComplete}>
          {questComplete ? "Lesson complete" : "Mark lesson complete"}
        </button>
      </div>
    </main>
  );
}

export default ArchimedesPage;