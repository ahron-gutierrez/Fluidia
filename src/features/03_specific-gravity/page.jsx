import { Link } from "react-router-dom";
import { useState } from "react";

function SpecificGravityPage() {
  const [materialDensity, setMaterialDensity] = useState(950);
  const specificGravity = materialDensity / 1000;

  return (
    <main className="container py-5">
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

      <div className="quest-layout-grid">
        <section className="pixel-panel quest-card large-card">
          <h2>Concept</h2>
          <p>Specific gravity is the ratio of a substance's density to the density of water at the same conditions.</p>
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
        </section>

        <section className="pixel-panel quest-card large-card">
          <h2>Why it matters</h2>
          <p>If specific gravity is less than 1, the object tends to float in water. If it is greater than 1, it tends to sink under similar conditions.</p>
          <p>This is another way to describe density without needing a full table of material properties.</p>
        </section>
      </div>
    </main>
  );
}

export default SpecificGravityPage;