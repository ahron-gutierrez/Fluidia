import RateOfFlowSimulation from "./simulation";

function RateOfFlowPage() {
  return (
    <div className="container py-4">
      <h1 className="mb-4">Rate of Flow</h1>
      <div className="row g-4">
        <section className="col-12 col-lg-6" aria-labelledby="rate-of-flow-definition">
          <div className="card h-100">
            <div className="card-body">
              <h2 id="rate-of-flow-definition" className="h4">Definition</h2>
              <p className="mb-0">This is a definition.</p>
            </div>
          </div>
        </section>
        <section className="col-12 col-lg-6" aria-labelledby="rate-of-flow-simulation">
          <div className="card h-100">
            <div className="card-body">
              <h2 id="rate-of-flow-simulation" className="h4">Simulation</h2>
              <RateOfFlowSimulation />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RateOfFlowPage;