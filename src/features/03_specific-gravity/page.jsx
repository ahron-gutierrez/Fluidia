import { Link } from "react-router-dom";
import { useState } from "react";
import LessonBottomNavigation from "../../components/LessonBottomNavigation";

function SpecificGravityPage() {
  const [materialDensity, setMaterialDensity] = useState(950);
  const specificGravity = materialDensity / 1000;

  return (
    <main className="container py-5 density-lesson">
      <div className="pixel-panel quest-panel">
        <p className="eyebrow accent">Fluid properties</p>
        <h1 className="pixel-heading md">Specific Gravity</h1>
        <p className="lead">
          Specific gravity is the ratio of a substance's density to the density of water.
        </p>
        <Link to="/sandbox/specific-gravity" className="btn btn-primary mt-2">
          Open sandbox
        </Link>
      </div>

      <div className="quest-layout-grid density-lesson-grid">
        <section className="pixel-panel quest-card large-card lesson-card">
          <div className="lesson-card-heading"><h2>Specific gravity</h2></div>
          <article className="lesson-topic">
          <h3>What is Specific Gravity?</h3>
          <p>Specific gravity is defined as the ratio of the density of a substance to the density of a standard or reference substance. It typically uses pure water as the reference standard for liquids and solids.</p>
          <p>Also known as relative density, specific gravity is a dimensionless physical quantity.</p>
          </article>
          <article className="lesson-topic">
          <h3>Try the calculator</h3>
          <div className="stat-box">
            <strong>Specific gravity = ρsubstance / ρwater</strong>
            <span>{materialDensity} / 1000 = {specificGravity.toFixed(2)}</span>
          </div>
          <label htmlFor="material-density" className="form-label">
            Material density: {materialDensity} kg/m³
          </label>
          <input
            id="material-density"
            className="form-range"
            type="range"
            min="200"
            max="2200"
            step="10"
            value={materialDensity}
            onChange={(event) => setMaterialDensity(Number(event.target.value))}
          />
          <p className="result-line">
            This substance is <strong>{specificGravity.toFixed(2)}</strong> times as dense as water.
          </p>
          </article>
        </section>

        <section className="pixel-panel quest-card large-card lesson-card">
          <div className="lesson-card-heading"><h2>Lesson resources</h2></div>
          <article className="lesson-topic">
          <h3>Why it matters</h3>
          <p>If specific gravity is less than 1, the object tends to float in water. If it is greater than 1, it tends to sink under similar conditions.</p>
          <p>This is another way to describe density without needing a full table of material properties.</p>
          </article>
          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/Zdb7z-LSyGs"
              title="Specific gravity video lesson"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <h2 className="ref">References</h2>
          <div className="reference-list">
            <p>
              Britannica Editors. (2026, May 22). <em>Specific gravity</em>. <em>Encyclopedia Britannica</em>. {" "}
              <a href="https://www.britannica.com/science/specific-gravity" target="_blank" rel="noopener noreferrer">
                https://www.britannica.com/science/specific-gravity
              </a>
            </p>
            <p>
              The Organic Chemistry Tutor. (2023, July 15). <em>Specific gravity</em> [Video]. YouTube. {" "}
              <a href="https://www.youtube.com/watch?v=Zdb7z-LSyGs" target="_blank" rel="noopener noreferrer">
                https://www.youtube.com/watch?v=Zdb7z-LSyGs
              </a>
            </p>
          </div>
          <section className="lesson-units">
            <h2>Units</h2>
            <p>Specific gravity is dimensionless.</p>
          </section>
        </section>
      </div>
      <LessonBottomNavigation
        lessonId="specific-gravity"
        backRoute="/fluids/pressure-density"
        nextRoute="/fluids/archimedes"
      />
    </main>
  );
}

export default SpecificGravityPage;
