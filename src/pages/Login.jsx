import { Link } from "react-router-dom";

function Login() {
  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3">Welcome back</h1>
              <p className="text-secondary">Log in to continue learning.</p>
              <form>
                <div className="mb-3">
                  <label htmlFor="login-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="login-email"
                    className="form-control"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label">
                    Password
                  </label>
                  <input
                    id="login-password"
                    className="form-control"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button className="btn btn-primary w-100" type="button">
                  Log in
                </button>
              </form>
             
              <p className="mt-3 mb-0">
                New here? <Link to="/signup">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;