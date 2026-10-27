import { Link } from "react-router-dom";

const topics = [
  {
    title: "Fluid Pressure and Density",
    description:
      "Learn how pressure in a fluid depends on depth, density, and gravitational acceleration.",
    route: "/fluids/pressure-density",
  },
  {
    title: "Specific Gravity",
    description:
      "Compare a material's density with the density of water using specific gravity.",
    route: "/fluids/specific-gravity",
  },
  {
    title: "Buoyancy and Archimedes' Principle",
    description:
      "Understand displaced fluid, buoyant force, and why objects float or sink.",
    route: "/fluids/archimedes",
  },
  {
    title: "Fluid Flow and Bernoulli's Principle",
    description:
      "Explore how flow speed, cross-sectional area, and pressure relate in moving fluids.",
    route: "/fluids/rate-of-flow",
  },
];

function Overview() {
  return (
    <main className="container py-5">
      <header className="pixel-panel overview-panel">
        <p className="eyebrow accent">Fluids</p>
        <h1 className="pixel-heading md">Fluidia's World of Flow</h1>
        <p className="lead">
          In Fluidia, water and air can seem to work wonders from lifting ships, shaping
          currents, and carrying life across the world. Discover the physics of fluids and how understanding their
          hidden rules keeps Fluidia alive.
        </p>
      </header>

      <div className="quest-grid">
        {topics.map((topic) => (
          <section key={topic.route} className="pixel-panel quest-card">
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
            <Link to={topic.route} className="btn btn-primary">
              Study concept
            </Link>
          </section>
        ))}
      </div>
    </main>
  );
}

export default Overview;
