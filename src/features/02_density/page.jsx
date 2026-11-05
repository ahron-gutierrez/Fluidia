import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { QUESTS, getCurrentUser, getProgress, setProgress } from "../../data/gameData";
import LessonBottomNavigation from "../../components/LessonBottomNavigation";

const GRAVITY = 9.81;

function DensityPage() {
  const currentUser = getCurrentUser();
  const currentProgress = currentUser ? getProgress(currentUser.id) : { completedQuests: [] };
  const [depth, setDepth] = useState(2.5);
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [questComplete, setQuestComplete] = useState(currentProgress.completedQuests.includes("village-beneath-water"));
  const [readingProgress, setReadingProgress] = useState(0);
  const lessonRef = useRef(null);

  const pressure = fluidDensity * GRAVITY * depth;

  const handleQuestComplete = () => {
    if (!currentUser || readingProgress < 100 || questComplete) {
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

  useEffect(() => {
    const updateReadingProgress = () => {
      const lesson = lessonRef.current;
      if (!lesson) return;

      const { top, bottom, height } = lesson.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress =
        height <= viewportHeight
          ? 100
          : Math.min(100, Math.max(0, (-top / (height - viewportHeight)) * 100));

      if (bottom <= viewportHeight) setReadingProgress(100);
      else setReadingProgress(Math.round(progress));
    };

    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
      window.removeEventListener("resize", updateReadingProgress);
    };
  }, []);

  return (
    <main ref={lessonRef} className="container py-5 density-lesson">
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

      <div className="quest-layout-grid density-lesson-grid">
        <section className="pixel-panel quest-card large-card lesson-card lesson-foundations">
          <div className="lesson-card-heading">
            <h2>Fluid Mechanics</h2>
          </div>
          <article className="lesson-topic">
            <h3>What are fluids?</h3>
          <p>
            Fluid is a substance that does not possess a definite shape and easily yields to external pressure. 
            Fluid is any liquid or gas or any material that is unable to withstand a shearing or tangential force, when at rest. 
          </p>
          </article>
          <article className="lesson-topic">
           <h3>Liquids and Gases</h3>
           <p>
            Liquid: A substance that flows and keeps no definite shape because its molecules are loosely packed and constantly moving.
           </p>
           <p>
            Gas: A substance that can only be contained if it is fully surrounded by a container (or held together by gravitational pull)
           </p>
          </article>
          <article className="lesson-topic">
          <h3>What is Pressure?</h3>
          <p>
            Pressure is the amount of force applied perpendicular to the surface of an object per unit area over which that force is distributed. 
          </p>
          <div className="stat-box">
            <strong>Pressure formula:</strong>
            <span>P = F/A</span>
          </div>
          <ul className="formula-legend" aria-label="Pressure formula legend">
            <li><strong>P</strong> = Pressure</li>
            <li><strong>F</strong> = Force</li>
            <li><strong>A</strong> = Area</li>
          </ul>
          </article>
          <article className="lesson-topic">
          <h3>Hydrostatic Pressure</h3>
          <p>
            Pressure increases with depth because a deeper point supports a taller
            column of fluid. At the same depth, a denser fluid exerts greater pressure.
          </p>
          <div className="stat-box">
            <strong>Hydrostatic Pressure formula</strong>
            <span>P = ρgh</span>
          </div>
          <ul className="formula-legend" aria-label="Hydrostatic pressure formula legend">
            <li><strong>P</strong> = Pressure</li>
            <li><strong>ρ</strong> = Density</li>
            <li><strong>g</strong> = Gravity</li>
            <li><strong>h</strong> = Depth</li>
          </ul>
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
          <section className="density-details">
            <h3>What is density?</h3>
            <p>
              Density is defined as the mass per unit volume of a substance. It serves as a
              fundamental physical property used to characterize and identify various forms of matter.
            </p>
            <div className="stat-box">
              <strong>Density formula:</strong>
              <span>p = M / V</span>
            </div>
            <ul className="formula-legend" aria-label="Density formula legend">
              <li><strong>p</strong> = Density</li>
              <li><strong>M</strong> = Mass</li>
              <li><strong>V</strong> = Volume of an object</li>
            </ul>
          </section>
          </article>
        </section>

        <section className="pixel-panel quest-card large-card lesson-card lesson-concept">
          <div className="lesson-card-heading">
            <h2>Concept explanation</h2>
          </div>
          <p>Fluid pressure comes from the weight of the fluid above. Increasing the density of the fluid or the depth of the measurement creates a larger pressure reading.</p>
          <p>Because the water column above the sensor weighs more when the fluid is denser or deeper, the pressure increases in a nearly linear manner.</p>
          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/RWbwXe-VO-o"
              title="Fluid pressure video lesson"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <h2 className="ref">References</h2>
          <div className="reference-list">
            <p>
              AntAnimations. (n.d.). An introduction to fluid mechanics [Video]. YouTube. {" "}
              <a href="https://www.youtube.com/watch?v=RWbwXe-VO-o" target="_blank" rel="noopener noreferrer">
                https://www.youtube.com/watch?v=RWbwXe-VO-o
              </a>
            </p>
            <p>
              BYJU'S. (2022, August 30). Fluid. {" "}
              <a href="https://byjus.com/physics/fluid/" target="_blank" rel="noopener noreferrer">
                https://byjus.com/physics/fluid/
              </a>
            </p>
            <p>
              Density | Physics. (n.d.). {" "}
              <a href="https://courses.lumenlearning.com/suny-physics/chapter/11-2-density/" target="_blank" rel="noopener noreferrer">
                https://courses.lumenlearning.com/suny-physics/chapter/11-2-density/
              </a>
            </p>
          </div>
          <section className="lesson-units fluid-units">
            <h2>Units for Fluids</h2>
            <ul>
              <li><strong>Pa</strong> - Pascal</li>
              <li><strong>atm</strong> - Atmospheric pressure</li>
            </ul>
          </section>
          <section className="lesson-units density-units">
            <h2>Units for Density</h2>
            <ul>
              <li><strong>Solid</strong> = g/cm³</li>
              <li><strong>Liquid</strong> = g/mL</li>
            </ul>
          </section>
        </section>
      </div>

      <div className="lesson-completion-area">
        <button
          type="button"
          className="btn btn-secondary lesson-complete-button"
          onClick={handleQuestComplete}
          disabled={!questComplete && readingProgress < 100}
        >
          {questComplete ? "Lesson complete" : "Mark lesson complete"}
        </button>
      </div>

      <LessonBottomNavigation
        lessonId="pressure-density"
        backRoute="/fluids/"
        nextRoute="/fluids/specific-gravity"
        nextDisabled={!questComplete}
      />
    </main>
  );
}

export default DensityPage;
