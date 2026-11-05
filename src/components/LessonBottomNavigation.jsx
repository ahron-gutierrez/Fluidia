import { Link } from "react-router-dom";

import { getLessonById } from "../data/gameData";

function LessonBottomNavigation({ lessonId, backRoute, nextRoute, nextLabel = "Next →", nextDisabled = false }) {
  const lesson = getLessonById(lessonId);

  return (
    <nav className="lesson-bottom-nav" aria-label="Lesson navigation">
      <Link to={backRoute} className="btn btn-primary lesson-nav-button">← Back</Link>
      <span className="lesson-nav-indicator">Lesson {lesson.number}: {lesson.title}</span>
      {nextDisabled ? (
        <span className="lesson-nav-button is-disabled" aria-disabled="true">{nextLabel}</span>
      ) : (
        <Link to={nextRoute} className="btn btn-primary lesson-nav-button">{nextLabel}</Link>
      )}
    </nav>
  );
}

export default LessonBottomNavigation;
