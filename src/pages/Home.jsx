import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="container py-5">
      <div className="row align-items-center g-5 py-5">
        <div className="col-lg-7">
          <p className="text-primary fw-semibold text-uppercase">[Website Name]</p>
          <h1 className="display-4 fw-bold">[Tagline?]</h1>
          <p className="lead text-secondary mt-3">
            [Descr.]
          </p>
          <div className="d-flex flex-wrap gap-3 mt-4">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get started
            </Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg">
              Log in
            </Link>
            <Link to="/overview" className="btn btn-link btn-lg">
              Explore lessons
            </Link>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4">Start with fluids</h2>
              <p className="text-secondary">
                Learn about density, buoyancy, and how fluids move.
              </p>
              <Link to="/overview" className="btn btn-outline-primary">
                Browse the Lesson
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;