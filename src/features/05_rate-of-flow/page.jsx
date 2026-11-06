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
          <h3>What is the rate of flow?</h3>
          <p>
            Rate of flow measures the quantity of fluid passing through a given point in a
            system over a specific period.
          </p>
          </article>

          <article className="lesson-topic">
          <h3>What is the continuity principle?</h3>
          <p>
            The continuity principle states that the mass of a flowing fluid is conserved
            within a closed system: the total mass entering a control volume equals the total
            mass leaving it.
          </p>
          <div className="stat-box">
            <strong>Continuity principle formula:</strong>
            <span>A<sub>1</sub>v<sub>1</sub> = A<sub>2</sub>v<sub>2</sub></span>
          </div>
          <ul className="formula-legend" aria-label="Continuity principle formula legend">
            <li><strong>A</strong> = cross-sectional area of the fluid path</li>
            <li><strong>v</strong> = speed of the flowing fluid</li>
            <li><strong>1</strong> and <strong>2</strong> = two points in the system</li>
          </ul>
          </article>

          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/DxX6XLEdcAw"
              title="Continuity equation video lesson"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <article className="lesson-topic">
          <h3>What is Bernoulli's principle?</h3>
          <p>
            Bernoulli's principle, established by Daniel Bernoulli, indicates that when the
            velocity of a flowing fluid—liquid or gas—increases, the pressure inside the fluid
            decreases. Leonhard Euler later presented Bernoulli's equation in its standard form
            in 1752.
          </p>
          <p>
            The total mechanical energy of flowing fluid remains unchanged: gravitational
            potential energy, pressure energy, and kinetic energy are exchanged as the fluid
            moves.
          </p>
          <div className="stat-box">
            <strong>Basic concept:</strong>
            <span>Faster-moving fluid has lower internal pressure.</span>
          </div>
          </article>

          <article className="lesson-topic">
          <h3>Real-life applications</h3>
          <p>
            <strong>Airplane wings:</strong> The shape of an airplane wing makes air travel
            faster over the top surface than underneath it, contributing to a pressure
            difference and lift.
          </p>
          <p>
            <strong>Perfume sprayers:</strong> Fast-moving air across the nozzle lowers the
            pressure there, drawing perfume upward and breaking it into a fine mist.
          </p>
          </article>

          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/rnIuEqHUVWs"
              title="Bernoulli principle video lesson"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <h2 className="ref">References</h2>
          <div className="reference-list">
            <p>
              BYJU'S. (2023, May 24). <em>Bernoulli's principle &amp; equation</em>. {" "}
              <a href="https://byjus.com/physics/bernoullis-principle/" target="_blank" rel="noopener noreferrer">
                https://byjus.com/physics/bernoullis-principle/
              </a>
            </p>
            <p>
              Brain Station Advanced. (2026, June 6). <em>Bernoulli's equation | Solved example | Intro to fluid mechanics | Part 4</em> [Video]. YouTube. {" "}
              <a href="https://www.youtube.com/watch?v=rnIuEqHUVWs" target="_blank" rel="noopener noreferrer">
                https://www.youtube.com/watch?v=rnIuEqHUVWs
              </a>
            </p>
            <p>
              Helmenstine, A., &amp; Helmenstine, A. (2026, May 17). <em>Bernoulli's principle – Definition, equation, examples</em>. Science Notes and Projects. {" "}
              <a href="https://sciencenotes.org/bernoullis-principle-definition-equation-examples/" target="_blank" rel="noopener noreferrer">
                https://sciencenotes.org/bernoullis-principle-definition-equation-examples/
              </a>
            </p>
            <p>
              The Organic Chemistry Tutor. (2017, November 15). <em>Continuity equation, volume flow rate &amp; mass flow rate physics problems</em> [Video]. YouTube. {" "}
              <a href="https://www.youtube.com/watch?v=DxX6XLEdcAw" target="_blank" rel="noopener noreferrer">
                https://www.youtube.com/watch?v=DxX6XLEdcAw
              </a>
            </p>
          </div>
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
