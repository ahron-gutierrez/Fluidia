import { Link } from "react-router-dom";

import { getCurrentUser, getProgress } from "../data/gameData";

function Home() {
  const currentUser = getCurrentUser();
  const introCompleted = currentUser ? getProgress(currentUser.id).introCompleted : false;

  const primaryRoute = currentUser ? (introCompleted ? "/dashboard" : "/intro") : "/signup";

  return (
    <main className="landing-page">
      <div className="landing-scene">
        <div className="parallax-layers" aria-hidden="true">
          <div className="parallax-layer sky-layer" />
          <div className="parallax-layer mountains-layer" />
          <div className="parallax-layer hills-layer" />
          <div className="parallax-layer forest-layer" />
        </div>

        <div className="scene-vignette" aria-hidden="true" />

        <div className="landing-copy">
          <p className="eyebrow hero-kicker">Welcome to</p>
          <h1 className="pixel-heading hero-title giant-title">
            <span className="title-gradient">FLUIDIA</span>
          </h1>
          <p className="hero-subtitle">
            Learn the hidden laws of motion, pressure, and flow through a living world of water, wind, and discovery.
          </p>
          <div className="cta-row">
            <Link to={primaryRoute} className="btn btn-primary btn-lg hero-button">
              {currentUser ? (introCompleted ? "Continue journey" : "Begin adventure") : "Get started"}
            </Link>
          </div>
        </div>
      </div>

    </main>
  );
}

export default Home;