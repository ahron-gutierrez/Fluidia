function ArchimedesSimulation() {
  return (
    <div>
      <section aria-labelledby="archimedes-controls">
        <h3 id="archimedes-controls" className="h5">Controls</h3>
        <div className="mb-3">
          <label htmlFor="object-density" className="form-label">
            Object density (kg/m³)
          </label>
          <input
            id="object-density"
            className="form-range"
            type="range"
            min="100"
            max="8000"
            step="1"
            defaultValue="600"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="fluid-density" className="form-label">
            Fluid density (kg/m³)
          </label>
          <input
            id="fluid-density"
            className="form-range"
            type="range"
            min="500"
            max="14000"
            step="1"
            defaultValue="1000"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="object-volume" className="form-label">
            Object volume (m³)
          </label>
          <input
            id="object-volume"
            className="form-range"
            type="range"
            min="0.001"
            max="0.01"
            step="0.001"
            defaultValue="0.005"
          />
        </div>
        <div className="mb-3">
          <span className="form-label d-block">Fluid presets</span>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary">Oil (800)</button>
            <button type="button" className="btn btn-secondary">Water (1000)</button>
            <button type="button" className="btn btn-secondary">Salt water (1025)</button>
            <button type="button" className="btn btn-secondary">Mercury (13600)</button>
          </div>
        </div>
        <div className="mb-3">
          <span className="form-label d-block">Object presets</span>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary">Wood (600)</button>
            <button type="button" className="btn btn-secondary">Ice (917)</button>
            <button type="button" className="btn btn-secondary">Aluminum (2700)</button>
            <button type="button" className="btn btn-secondary">Iron (7870)</button>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary">Drop / Release</button>
          <button type="button" className="btn btn-outline-secondary">Reset</button>
        </div>
      </section>

      <section className="mt-4" aria-labelledby="archimedes-readouts">
        <h3 id="archimedes-readouts" className="h5">Live readouts</h3>
        <dl className="row mb-2">
          <dt className="col-sm-6">Submerged</dt>
          <dd className="col-sm-6">— %</dd>
          <dt className="col-sm-6">Buoyant force</dt>
          <dd className="col-sm-6">— N</dd>
          <dt className="col-sm-6">Weight</dt>
          <dd className="col-sm-6">— N</dd>
          <dt className="col-sm-6">Result</dt>
          <dd className="col-sm-6">—</dd>
        </dl>
        <p className="mb-0">
          Compare buoyant force with weight to see why an object floats or sinks.
        </p>
      </section>
    </div>
  );
}

export default ArchimedesSimulation;