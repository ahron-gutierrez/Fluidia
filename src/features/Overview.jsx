import { Link } from "react-router-dom";

const lessons = [
  {
    title: "Density",
    path: "/fluids/density",
    description: "Explore how pressure and density are related in fluids.",
  },
  {
    title: "Specific Gravity",
    path: "/fluids/specific-gravity",
    description: "Compare a substance's density with the density of water.",
  },
  {
    title: "Archimedes' Principle",
    path: "/fluids/archimedes",
    description: "Learn why objects float or sink.",
  },
  {
    title: "Rate of Flow",
    path: "/fluids/rate-of-flow",
    description: "Explore how fluids move through a system.",
  },
];

function Overview() {
  return (
    <div className="container py-4">
      <h1>Overview</h1>
      <p className="lead">
        Explore key ideas about fluids, from pressure and density to buoyancy
        and flow.
      </p>

      <h2 className="h4 mt-4">What you will learn</h2>
      <ul>
        <li>How pressure and density are related</li>
        <li>Why some objects float and others sink</li>
        <li>How moving fluids create lift</li>
      </ul>

      <h2 className="h4 mt-4">Lessons</h2>
      <div className="row g-3">
        {lessons.map((lesson) => (
          <div className="col-12 col-md-6" key={lesson.path}>
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">{lesson.title}</h3>
                <p className="card-text">{lesson.description}</p>
                <Link to={lesson.path} className="btn btn-primary">
                  Start
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overview;