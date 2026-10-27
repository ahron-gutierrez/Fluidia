import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, setCurrentUser } from "../data/gameData";

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const profileMenuRef = useRef(null);
  const lessonsMenuRef = useRef(null);

  const closeMenu = (menuRef) => {
    if (menuRef.current) {
      menuRef.current.open = false;
    }
  };

  const closeAllMenus = () => {
    closeMenu(lessonsMenuRef);
    closeMenu(profileMenuRef);
  };

  const handleLogout = () => {
    closeAllMenus();
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
          <Link to={user ? "/dashboard" : "/"} onClick={closeAllMenus}>
            {user ? "My Progress" : "Home"}
          </Link>
          <details className="nav-dropdown" ref={lessonsMenuRef}>
            <summary className="nav-dropdown-trigger" onClick={() => closeMenu(profileMenuRef)}>
              Lessons
              <svg viewBox="0 0 12 8" aria-hidden="true">
                <path d="m1 1 5 5 5-5" />
              </svg>
            </summary>
            <div className="profile-menu-panel lessons-menu-panel">
              <Link to="/overview" onClick={() => closeMenu(lessonsMenuRef)}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 2h5v2H4v9h3v2H2zM9 2h5v13H8v-2h4V4H9z" />
                </svg>
                Overview
              </Link>
              <div className="lesson-subtopics" aria-label="Overview topics">
                <Link to="/fluids/pressure-density" onClick={() => closeMenu(lessonsMenuRef)}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M2 2h12v2H2zM4 4h2v6H4zM10 4h2v6h-2zM7 5h2v2H7zM7 8h2v2H7zM2 11h12v2H2zM6 14h4v2H6z" />
                  </svg>
                  Pressure and density
                </Link>
                <Link to="/fluids/specific-gravity" onClick={() => closeMenu(lessonsMenuRef)}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M7 1h2v2h5v2H9v5h3v2H4v-2h3V5H2V3h5zM2 6h1v2h1v1H1V8h1zM12 6h1v2h1v1h-3V8h1zM6 12h4v2H6z" />
                  </svg>
                  Specific gravity
                </Link>
                <Link to="/fluids/archimedes" onClick={() => closeMenu(lessonsMenuRef)}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M2 1h2v2h2v2H4v2H2zM8 3h5v2H8zM7 5h7v2H7zM2 9h12v2h-2v2H4v-2H2zM6 13h4v2H6z" />
                  </svg>
                  Buoyancy and Archimedes
                </Link>
                <Link to="/fluids/rate-of-flow" onClick={() => closeMenu(lessonsMenuRef)}>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M1 3h5v2H1zM1 11h5v2H1zM6 3h2v2H6zM8 5h2v2H8zM10 7h5v2h-5zM8 9h2v2H8zM6 11h2v2H6zM1 6h6v2H1zM1 8h6v2H1z" />
                  </svg>
                  Flow and Bernoulli
                </Link>
              </div>
            </div>
          </details>
          <Link to="/intro" onClick={closeAllMenus}>Adventure Mode</Link>
          {user ? (
            <details className="nav-profile-menu" ref={profileMenuRef}>
              <summary
                className="profile-menu-trigger"
                aria-label="Open account menu"
                title="Account menu"
                onClick={() => closeMenu(lessonsMenuRef)}
              >
                <span className="profile-avatar-placeholder" aria-hidden="true" />
              </summary>
              <div className="profile-menu-panel">
                <div className="profile-menu-identity">
                  <strong>{user.name || "Explorer"}</strong>
                  <span>{user.email}</span>
                </div>
                <Link to="/account/edit" onClick={() => closeMenu(profileMenuRef)}>
                  <svg className="pixel-icon" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M6 1h4v2h2v2h2v6h-2v2h-2v2H6v-2H4v-2H2V5h2V3h2zM6 3v2H4v6h2v2h4v-2h2V5h-2V3zM7 6h2v4H7z" />
                  </svg>
                  Account settings
                </Link>
                <button type="button" onClick={handleLogout}>
                  <svg className="pixel-icon" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M2 1h8v2H4v10h6v2H2zM10 4h2v2h2v2h2v2h-2v2h-2v2h-2v-3H6V9h4z" />
                  </svg>
                  Sign out
                </button>
              </div>
            </details>
          ) : (
            <>
              <Link to="/login" className="nav-login-link">Log in</Link>
              <Link to="/signup" className="btn btn-primary compact-btn">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;