import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, setCurrentUser } from "../data/gameData";

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="container navbar-shell">
        <Link to="/" className="brand-mark" aria-label="Fluidia home">
          <img className="brand-icon" src="/fluidia-logo.webp" alt="" />
          <span>Fluidia</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {user ? (
            <>
              <Link to="/dashboard">Home</Link>
              <Link to="/overview">Learn</Link>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/overview">Learn</Link>
            </>
          )}
          <Link to="/intro">Story</Link>
          <Link to="/account/edit">Profile</Link>
          {user ? (
            <button type="button" className="nav-button" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="nav-login-link">Log in</Link>
          )}
          {!user && (
            <Link to="/signup" className="btn btn-primary compact-btn">
              Sign Up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;