
import React from "react";
import "../styles/Dashboard.css";

const topics = [
  {
    id: 1,
    title: "Measurements and Vectors",
    description:
      "Explore physical quantities, SI units, dimensions, and vector operations.",
    icon: "📐",
  },
  {
    id: 2,
    title: "Fluid Mechanics",
    description:
      "Learn about pressure, density, buoyancy, and fluid motion.",
    icon: "💧",
  },
  {
    id: 3,
    title: "Waves and Sound",
    description:
      "Understand wave properties, sound, frequency, and wavelength.",
    icon: "〰️",
  },
];

function Dashboard() {
  return (
    <div className="dashboard">
      <nav className="navbar">
        <a href="/" className="brand">
          <span className="brand-icon">~</span>
          FluidLab
        </a>

        <div className="nav-links">
          <a href="#topics">Topics</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <main className="main-content">
        <section className="welcome-section">
          <p className="eyebrow">CALCULUS-BASED PHYSICS 2</p>

          <h1>
            Learn physics.
            <br />
            <span>Explore how it works.</span>
          </h1>

          <p className="welcome-description">
            Understand the concepts through interactive lessons,
            simple simulations, and quizzes.
          </p>

          <a href="#topics" className="primary-button">
            Explore topics →
          </a>
        </section>

        <section id="topics" className="topics-section">
          <div className="section-heading">
            <div>
              <h2>Learning topics</h2>
              <p>Choose a topic to get started.</p>
            </div>

            <span className="topic-count">
              {topics.length} TOPICS
            </span>
          </div>

          <div className="topic-grid">
            {topics.map((topic) => (
              <article className="topic-card" key={topic.id}>
                <div className="topic-card-top">
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-number">
                    {String(topic.id).padStart(2, "0")}
                  </span>
                </div>

                <h3>{topic.title}</h3>
                <p>{topic.description}</p>

                <a
                  href={`/topics/${topic.id}`}
                  className="topic-link"
                >
                  Start learning →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="about-section">
          <h2>Physics, made easier to explore.</h2>
          <p>
            FluidLab is an interactive learning website designed
            to help students understand physics concepts beyond
            the classroom.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>FluidLab</span>
        <p>Learn by exploring.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
