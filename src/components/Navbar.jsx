import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand bg-white border-bottom">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          [Website Name]
        </Link>
        <div className="d-flex align-items-center gap-3">
          <Link to="/overview" className="nav-link">
            Lessons
          </Link>
          <Link to="/account/edit" className="nav-link">
            Account
          </Link>
          <Link to="/login" className="nav-link">
            Log in
          </Link>
          <Link to="/signup" className="btn btn-primary">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;