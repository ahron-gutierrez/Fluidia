import { useState } from "react";
import { Link } from "react-router-dom";

import { QUESTS, getCurrentUser, getProgress, setProgress } from "../../data/gameData";

const GRAVITY = 9.81;

function DensityPage() {
  const currentUser = getCurrentUser();
  const currentProgress = currentUser ? getProgress(currentUser.id) : { completedQuests: [] };
  const [depth, setDepth] = useState(2.5);
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [questComplete, setQuestComplete] = useState(currentProgress.completedQuests.includes("village-beneath-water"));

  const pressure = fluidDensity * GRAVITY * depth;

  const handleQuestComplete = () => {
    if (!currentUser) {
      return;
    }

    const questId = "village-beneath-water";
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
        <h1 className="pixel-heading md">Hydrostatic Pressure</h1>
        <p className="lead">
          Hydrostatic pressure is the pressure exerted by a fluid at rest. Calculate
          how the pressure at a point depends on fluid density and depth.
        </p>
        <Link to="/sandbox/pressure-density" className="btn btn-primary mt-2">
          Open sandbox
        </Link>
      </div>

      <div className="quest-layout-grid">
        <section className="pixel-panel quest-card large-card">
          <h2>Pressure in a fluid</h2>
          <p>
            Pressure increases with depth because a deeper point supports a taller
            column of fluid. At the same depth, a denser fluid exerts greater pressure.
          </p>
          <div className="stat-box">
            <strong>Pressure formula</strong>
            <span>P = ρgh</span>
          </div>
          <div className="sensor-sim">
            <div className="sensor-water" style={{ height: `${Math.min(100, (depth / 5) * 100)}%` }}>
              <div className="sensor-marker" style={{ bottom: `${(depth / 5) * 100}%` }} />
            </div>
          </div>
          <label htmlFor="depth-slider" className="form-label">
            Sensor depth: {depth.toFixed(1)} m
          </label>
          <input
            id="depth-slider"
            className="form-range"
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={depth}
            onChange={(event) => setDepth(Number(event.target.value))}
          />

          <label htmlFor="density-slider" className="form-label">
            Fluid density: {fluidDensity} kg/m³
          </label>
          <input
            id="density-slider"
            className="form-range"
            type="range"
            min="500"
            max="1500"
            step="10"
            value={fluidDensity}
            onChange={(event) => setFluidDensity(Number(event.target.value))}
          />

          <p className="result-line">
            Pressure at depth: <strong>{pressure.toFixed(0)} Pa</strong>
          </p>
        </section>

        <section className="pixel-panel quest-card large-card">
          <h2>Concept explanation</h2>
          <p>Fluid pressure comes from the weight of the fluid above. Increasing the density of the fluid or the depth of the measurement creates a larger pressure reading.</p>
          <p>Because the water column above the sensor weighs more when the fluid is denser or deeper, the pressure increases in a nearly linear manner.</p>
          <div className="inline-actions">
            <button type="button" className="btn btn-secondary" onClick={handleQuestComplete}>
              {questComplete ? "Lesson complete" : "Mark lesson complete"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default DensityPage;