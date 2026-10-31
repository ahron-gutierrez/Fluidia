import { Link } from "react-router-dom";

// Sidebar description box for the map. Scrolls if the text doesn't fit.
function LocationInfo({ location }) {
  return (
    <section className="pixel-panel dashboard-next-quest location-info" role="status">
      {location ? (
        <>
          <p className="eyebrow accent">{location.name}</p>
          <h2>{location.topic}</h2>
          <code>{location.formula}</code>
          <p>{location.text}</p>
          {location.lesson && (
            <Link to={location.lesson} className="btn btn-primary">
              Open lesson
            </Link>
          )}
        </>
      ) : (
        <>
          <p className="eyebrow accent">Explore</p>
          <p>Walk up to a location on the map to learn about its fluid physics topic.</p>
        </>
      )}
    </section>
  );
}

export default LocationInfo;
