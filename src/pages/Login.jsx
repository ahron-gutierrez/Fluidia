import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, getProgress, getUsers, setCurrentUser } from "../data/gameData";

function Login() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const users = getUsers();
    const foundUser = users.find(
      (user) => user.email.toLowerCase() === formValues.email.toLowerCase() && user.password === formValues.password
    );

    if (!foundUser) {
      setMessage("We could not find a matching account. Try again or sign up.");
      return;
    }

    setCurrentUser(foundUser);
    const progress = getProgress(foundUser.id);
    navigate(progress.introCompleted ? "/dashboard" : "/intro");
  };

  if (getCurrentUser()) {
    return (
      <section className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">Already signed in</h1>
          <p>You are already exploring Fluidia.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Return to the world map
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-5 auth-panel-wrap">
      <div className="pixel-panel auth-panel">
        <div className="auth-copy">
          <p className="eyebrow accent">Welcome back</p>
          <h1 className="pixel-heading md">Log in</h1>
          <p>Continue the investigation and keep your progress in Fluidia.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-email" className="form-label">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            className="form-control"
            type="email"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            className="form-control"
            type="password"
            autoComplete="current-password"
            value={formValues.password}
            onChange={handleChange}
            required
          />

          {message ? <p className="form-message">{message}</p> : null}

          <button className="btn btn-primary w-100" type="submit">
            Log in
          </button>
        </form>

        <p className="switch-link">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;