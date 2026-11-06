import { useState } from "react";
import { Link } from "react-router-dom";

import { QUESTS, getCurrentUser, getProgress, setProgress } from "../../data/gameData";
import LessonBottomNavigation from "../../components/LessonBottomNavigation";
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
    <main className="container py-5 density-lesson archimedes-lesson">
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

      <div className="quest-layout-grid density-lesson-grid archimedes-lesson-grid">
        <section className="pixel-panel quest-card large-card lesson-card">
          <div className="lesson-card-heading"><h2>Archimedes Principle</h2></div>
          <article className="lesson-topic">
          <h3>What is the Archimedes Principle?</h3>
          <p>
            When an object is totally or partially immersed in a fluid, it experiences an
            upward force equal to the weight of the fluid it displaces.
          </p>
          <p>
            This principle helps explain why objects float or sink and why they seem lighter
            in water. It also applies to balloons moving through air.
          </p>
          <div className="stat-box">
            <strong>Buoyant force formula:</strong>
            <span>F<sub>b</sub> = ρ<sub>fluid</sub>gV<sub>displaced</sub></span>
          </div>
          <ul className="formula-legend" aria-label="Buoyant force formula legend">
            <li><strong>F<sub>b</sub></strong> = buoyant force, or upthrust</li>
            <li><strong>ρ<sub>fluid</sub></strong> = density of the fluid</li>
            <li><strong>g</strong> = gravitational acceleration</li>
            <li><strong>V<sub>displaced</sub></strong> = volume of fluid displaced</li>
          </ul>
          </article>

          <article className="lesson-topic">
            <h3>Upthrust and buoyant force</h3>
            <p>
              Upthrust is the upward force that reduces an object's apparent weight while it
              is under water. If the buoyant force is greater than the object's weight, it
              rises; if it is smaller, the object sinks.
            </p>
          </article>

          <figure className="archimedes-illustration">
            <img src="/archimedes-principle-illustration.png" alt="A scale reading less for an object immersed in water, illustrating buoyant force and displaced water." />
            <figcaption>
              See the scale-and-water-displacement illustration from {" "}
              <a href="https://www.britannica.com/science/Archimedes-principle" target="_blank" rel="noopener noreferrer">
                Encyclopaedia Britannica
              </a>.
            </figcaption>
          </figure>

          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/wChr0hCga5g"
              title="Archimedes principle video lesson"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <h2 className="ref">Reference</h2>
          <div className="reference-list">
            <p>
              Britannica Editors. (2026, October 30). <em>Archimedes' principle</em>. {" "}
              <em>Encyclopaedia Britannica</em>. {" "}
              <a href="https://www.britannica.com/science/Archimedes-principle" target="_blank" rel="noopener noreferrer">
                https://www.britannica.com/science/Archimedes-principle
              </a>
            </p>
            <p>
              Science ABC. (2020, December 15). <em>Archimedes' principle: Explained in really simple words</em> [Video]. YouTube. {" "}
              <a href="https://www.youtube.com/watch?v=wChr0hCga5g" target="_blank" rel="noopener noreferrer">
                https://www.youtube.com/watch?v=wChr0hCga5g
              </a>
            </p>
          </div>
        </section>

        <section className="pixel-panel quest-card large-card lesson-card simulation-card archimedes-simulation-card">
          <div className="lesson-card-heading"><h2>Simulation</h2></div>
          <ArchimedesSimulation />
        </section>
      </div>

      <div className="lesson-completion-area">
        <button type="button" className="btn btn-secondary" onClick={handleQuestComplete}>
          {questComplete ? "Lesson complete" : "Mark lesson complete"}
        </button>
      </div>
      <LessonBottomNavigation
        lessonId="archimedes"
        backRoute="/fluids/specific-gravity"
        nextRoute="/fluids/rate-of-flow"
        nextDisabled={!questComplete}
      />
    </main>
  );
}

export default ArchimedesPage;
