import { Link } from "react-router-dom";

const lessonLinks = [
  {
    title: "Fluid Pressure and Density",
    description: "Explore how fluid pressure changes with depth and density.",
    path: "/fluids/pressure-density",
    sandbox: "/sandbox/pressure-density",
  },
  {
    title: "Specific Gravity",
    description: "Compare a substance's density with the density of water.",
    path: "/fluids/specific-gravity",
    sandbox: "/sandbox/specific-gravity",
  },
  {
    title: "Buoyancy and Archimedes' Principle",
    description: "Learn how displaced fluid creates buoyant force on an object.",
    path: "/fluids/archimedes",
    sandbox: "/sandbox/archimedes",
  },
  {
    title: "Fluid Flow and Bernoulli's Principle",
    description: "Relate fluid speed, pressure, and cross-sectional area.",
    path: "/fluids/rate-of-flow",
    sandbox: "/sandbox/rate-of-flow",
  },
];

function FluidsPage() {
  return (
    <main className="container py-5">
      <div className="pixel-panel overview-panel">
        <p className="eyebrow accent">Fluid physics</p>
        <h1 className="pixel-heading md">Fluid Mechanics</h1>
        <p className="lead">
          Study fluid properties, pressure, buoyancy, and flow through explanations,
          interactive simulations, and knowledge checks.
        </p>
      </div>

      <div className="quest-grid">
        {lessonLinks.map((lesson) => (
          <div key={lesson.path} className="pixel-panel quest-card">
            <h2>{lesson.title}</h2>
            <p>{lesson.description}</p>
            <Link to={lesson.path} className="btn btn-primary">
              Study concept
            </Link>
            {" "}
            <Link to={lesson.sandbox} className="btn btn-secondary">
              Sandbox
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}

export default FluidsPage;
