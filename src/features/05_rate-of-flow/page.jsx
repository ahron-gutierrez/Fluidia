import { useState } from "react";
import { Link } from "react-router-dom";

import { QUESTS, getCurrentUser, getProgress, setProgress } from "../../data/gameData";
import LessonBottomNavigation from "../../components/LessonBottomNavigation";
import RateOfFlowSimulation from "./simulation";

function RateOfFlowPage() {
  const currentUser = getCurrentUser();
  const currentProgress = currentUser ? getProgress(currentUser.id) : { completedQuests: [] };
  const [questComplete, setQuestComplete] = useState(currentProgress.completedQuests.includes("windmills-secret"));

  const handleQuestComplete = () => {
    if (!currentUser) {
      return;
    }

    const questId = "windmills-secret";
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
    <main className="container py-5 density-lesson flow-lesson">
      <div className="pixel-panel quest-panel">
        <p className="eyebrow accent">Fluid dynamics</p>
        <h1 className="pixel-heading md">Fluid Flow and Bernoulli's Principle</h1>
        <p className="lead">
          In steady flow, changes in fluid speed are related to changes in pressure.
          Use the continuity equation and Bernoulli's principle to analyze moving fluids.
        </p>
        <Link to="/sandbox/rate-of-flow" className="btn btn-primary mt-2">
          Open sandbox
        </Link>
      </div>

      <div className="quest-layout-grid density-lesson-grid flow-lesson-grid">
        <section className="pixel-panel quest-card large-card lesson-card">
          <div className="lesson-card-heading"><h2>Fluid flow</h2></div>
          <article className="lesson-topic">
          <h3>Scientific explanation</h3>
          <p>In a streamlined flow, fluid speeds up where the passage narrows. According to the continuity equation, if the cross-sectional area decreases, the fluid must move faster through that region.</p>
          <p>Bernoulli's principle explains that when moving fluid speed increases, static pressure typically decreases, assuming energy is conserved in steady, incompressible flow.</p>
          <p>It is important not to treat this as the sole explanation for all lift; wings and airfoils involve additional details beyond a single Bernoulli statement.</p>
          </article>
        </section>

        <section className="pixel-panel quest-card large-card lesson-card simulation-card flow-simulation-card">
          <div className="lesson-card-heading"><h2>Interactive flow lab</h2></div>
          <RateOfFlowSimulation />
        </section>
      </div>

      <div className="lesson-completion-area">
        <button type="button" className="btn btn-secondary" onClick={handleQuestComplete}>
          {questComplete ? "Lesson complete" : "Mark lesson complete"}
        </button>
      </div>
      <LessonBottomNavigation
        lessonId="rate-of-flow"
        backRoute="/fluids/archimedes"
        nextRoute="/quiz"
        nextLabel="Proceed to Quiz"
        nextDisabled={!questComplete}
      />
    </main>
  );
}

export default RateOfFlowPage;
