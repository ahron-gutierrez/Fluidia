import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { recordSandbox } from "../data/achievements";
import { DEFAULT_AVATAR_ID } from "../data/avatarAssets";
import { getAvatar, getCurrentUser } from "../data/gameData";
import FlowSandbox from "../features/sandbox/FlowSandbox";
import FloatSandbox from "../features/sandbox/FloatSandbox";
import PressureSandbox from "../features/sandbox/PressureSandbox";
import BgMusic from "../components/BgMusic";
import "../styles/Sandbox.css";

const LESSONS = {
  "pressure-density": {
    title: "Pressure Sandbox",
    lesson: "Fluid Pressure and Density",
    path: "/fluids/pressure-density",
    blurb: "Jump off the dock and dive. Switch liquids and see how depth and density change the pressure on you.",
    Scene: PressureSandbox,
  },
  "specific-gravity": {
    title: "Specific Gravity Sandbox",
    lesson: "Specific Gravity",
    path: "/fluids/specific-gravity",
    blurb: "Test every object in any liquid and compare its specific gravity with what actually floats.",
    Scene: (props) => <FloatSandbox {...props} mode="sg" />,
  },
  archimedes: {
    title: "Buoyancy Sandbox",
    lesson: "Buoyancy and Archimedes' Principle",
    path: "/fluids/archimedes",
    blurb: "Drop objects into different liquids and watch weight and buoyant force decide who floats.",
    Scene: (props) => <FloatSandbox {...props} mode="archimedes" />,
  },
  "rate-of-flow": {
    title: "Fluid Flow Sandbox",
    lesson: "Fluid Flow and Bernoulli's Principle",
    path: "/fluids/rate-of-flow",
    blurb: "Run to the pump and valves and punch them to change the pipe. Speed and pressure update everywhere.",
    Scene: FlowSandbox,
  },
};

// Free play for each lesson: control your character, no quest, no score, no wrong answers.
function Sandbox() {
  const { lessonId } = useParams();
  const entry = LESSONS[lessonId];
  const user = getCurrentUser();

  useEffect(() => {
    if (user && entry) recordSandbox(user.id, lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (!entry) {
    return (
      <main className="container py-5">
        <BgMusic track="quiz"/>
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Sandbox not found</h1>
          <Link to="/fluids" className="btn btn-primary">Back to lessons</Link>
        </div>
      </main>
    );
  }

  const spriteId = (user ? getAvatar(user.id)?.spriteId : null) ?? DEFAULT_AVATAR_ID;
  const { Scene } = entry;

  return (
    <main className="container py-4">
      <div className="pixel-panel sandbox-panel">
        <p className="eyebrow accent">Sandbox · free play</p>
        <h1 className="pixel-heading md">{entry.title}</h1>
        <p className="lead">{entry.blurb}</p>
        <Scene spriteId={spriteId} />
        <div className="inline-actions mt-3">
          <Link to={entry.path} className="btn btn-secondary">Back to the lesson</Link>
          <Link to="/fluids" className="btn btn-secondary">All lessons</Link>
        </div>
      </div>
    </main>
  );
}

export default Sandbox;
