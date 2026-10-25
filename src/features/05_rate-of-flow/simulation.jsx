function RateOfFlowSimulation() {
  return (
    <div>
      <section aria-labelledby="flow-controls">
        <h3 id="flow-controls" className="h5">Controls</h3>
        <div className="mb-3">
          <label htmlFor="left-pipe-radius" className="form-label">
            Left pipe radius (m)
          </label>
          <input
            id="left-pipe-radius"
            className="form-range"
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            defaultValue="0.25"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="right-pipe-radius" className="form-label">
            Right pipe radius (m)
          </label>
          <input
            id="right-pipe-radius"
            className="form-range"
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            defaultValue="0.15"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="initial-flow-speed" className="form-label">
            Initial speed (m/s)
          </label>
          <input
            id="initial-flow-speed"
            className="form-range"
            type="range"
            min="0"
            max="20"
            step="0.1"
            defaultValue="5"
          />
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary">Start / Pause flow</button>
          <button type="button" className="btn btn-secondary">Swap sides</button>
          <button type="button" className="btn btn-outline-secondary">Reset</button>
          <button type="button" className="btn btn-secondary">Venturi preset</button>
        </div>
      </section>
    </div>
  );
}

export default RateOfFlowSimulation;