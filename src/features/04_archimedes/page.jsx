import ArchimedesSimulation from "./simulation";

function ArchimedesPage() {
  return (
    <div className="container py-4">
      <h1 className="mb-4">Archimedes</h1>
      <div className="row g-4">
        <section className="col-12 col-lg-6" aria-labelledby="archimedes-definition">
          <div className="card h-100">
            <div className="card-body">
              <h2 id="archimedes-definition" className="h4">Definition</h2>
              <p className="mb-0">This is a definition.</p>
            </div>
          </div>
        </section>
        <section className="col-12 col-lg-6" aria-labelledby="archimedes-simulation">
          <div className="card h-100">
            <div className="card-body">
              <h2 id="archimedes-simulation" className="h4">Simulation</h2>
              <ArchimedesSimulation />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ArchimedesPage;