import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import AvatarSprite from "./AvatarSprite";
import { DEFAULT_AVATAR_ROW } from "../data/avatarAssets";
import { getAvatar, getCurrentUser, setCurrentUser } from "../data/gameData";

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getCurrentUser();
  const [avatar, setAvatar] = useState(() => getAvatar(user?.id));
  const profileMenuRef = useRef(null);
  const lessonsMenuRef = useRef(null);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const syncAvatar = (event) => {
      if (event.detail?.userId === user.id) {
        setAvatar(getAvatar(user.id));
      }
    };

    window.addEventListener("fluidia-avatar-change", syncAvatar);
    return () => window.removeEventListener("fluidia-avatar-change", syncAvatar);
  }, [user?.id]);

  const closeMenu = (menuRef) => {
    if (menuRef.current) {
      menuRef.current.open = false;
    }
  };

  const closeAllMenus = () => {
    closeMenu(lessonsMenuRef);
    closeMenu(profileMenuRef);
  };

  const openLessonsMenu = () => {
    closeMenu(profileMenuRef);
    if (lessonsMenuRef.current) {
      lessonsMenuRef.current.open = true;
    }
  };

  const handleLessonsClick = (event) => {
    if (event.nativeEvent.pointerType === "touch") {
      event.preventDefault();
      openLessonsMenu();
      return;
    }

    event.preventDefault();
    closeMenu(lessonsMenuRef);
    navigate("/overview");
  };

  const closeLessonsOnBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeMenu(lessonsMenuRef);
    }
  };

  const handleLogout = () => {
    closeAllMenus();
    setCurrentUser(null);
    navigate("/");
  };

  const isLessonsPage =
    pathname === "/overview" ||
    pathname.startsWith("/fluids/");

  return (
    <header className="topbar">
      <div className="container navbar-shell">
        <Link to="/" className="brand-mark" aria-label="Fluidia home">
          <img className="brand-icon" src="/fluidia-logo.webp" alt="" />
          <span>Fluidia</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink
            to={user ? "/dashboard" : "/"}
            end
            onClick={closeAllMenus}
          >
            {user ? "My Progress" : "Home"}
          </NavLink>
          <details
            className="nav-dropdown"
            ref={lessonsMenuRef}
            onPointerEnter={openLessonsMenu}
            onPointerLeave={() => closeMenu(lessonsMenuRef)}
            onBlur={closeLessonsOnBlur}
          >
            <summary
              className={`nav-dropdown-trigger${isLessonsPage ? " active" : ""}`}
              onClick={handleLessonsClick}
              onFocus={openLessonsMenu}
            >
              Lessons
              <svg viewBox="0 0 12 8" aria-hidden="true">
                <path d="M0 0h3v2h2v2h2V2h2V0h3v4H9v2H7v2H5V6H3V4H0z" />
              </svg>
            </summary>
            <div className="profile-menu-panel lessons-menu-panel">
              <Link to="/overview" onClick={() => closeMenu(lessonsMenuRef)}>
                Overview
              </Link>
              <div className="lesson-subtopics" aria-label="Overview topics">
                <Link to="/fluids/pressure-density" onClick={() => closeMenu(lessonsMenuRef)}>
                  Pressure and density
                </Link>
                <Link to="/fluids/specific-gravity" onClick={() => closeMenu(lessonsMenuRef)}>
                  Specific gravity
                </Link>
                <Link to="/fluids/archimedes" onClick={() => closeMenu(lessonsMenuRef)}>
                  Buoyancy and Archimedes
                </Link>
                <Link to="/fluids/rate-of-flow" onClick={() => closeMenu(lessonsMenuRef)}>
                  Flow and Bernoulli
                </Link>
              </div>
            </div>
          </details>
          <NavLink to="/intro" end onClick={closeAllMenus}>
            Adventure Mode
          </NavLink>
          {user ? (
            <details className="nav-profile-menu" ref={profileMenuRef}>
              <summary
                className="profile-menu-trigger"
                aria-label="Open account menu"
                title="Account menu"
                onClick={() => closeMenu(lessonsMenuRef)}
              >
                <AvatarSprite
                  className="profile-avatar-placeholder"
                  spriteId={avatar?.spriteId}
                  row={avatar?.row ?? DEFAULT_AVATAR_ROW}
                  size={28}
                />
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