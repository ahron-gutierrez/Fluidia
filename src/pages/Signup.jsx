import { Link } from "react-router-dom";

function Signup() {
  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3">Create your account</h1>
              <p className="text-secondary">
                Join us and start exploring.
              </p>
              <form>
                <div className="mb-3">
                  <label htmlFor="signup-name" className="form-label">
                    Name
                  </label>
                  <input
                    id="signup-name"
                    className="form-control"
                    type="text"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="signup-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    className="form-control"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="signup-password" className="form-label">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    className="form-control"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <button className="btn btn-primary w-100" type="button">
                  Sign up
                </button>
              </form>
             
              <p className="mt-3 mb-0">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;