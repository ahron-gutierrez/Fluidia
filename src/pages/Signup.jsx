import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PasswordInput from "../components/PasswordInput";
import {
  DEFAULT_PROGRESS,
  addAccount,
  getCurrentUser,
  getProgress,
  setProgress,
} from "../data/gameData";

function Signup() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [message, setMessage] = useState("");

  const mismatch = formValues.confirm.length > 0 && formValues.password !== formValues.confirm;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formValues.name.trim();
    const trimmedEmail = formValues.email.trim();

    if (!trimmedName || !trimmedEmail || !formValues.password || !formValues.confirm) {
      setMessage("Please complete all fields before creating your account.");
      return;
    }

    if (formValues.password !== formValues.confirm) {
      setMessage("Your passwords don't match. Please type them again.");
      return;
    }

    const { user: newUser, message: errorMessage } = await addAccount(
      trimmedEmail,
      formValues.password,
      0,
      trimmedName
    );
    if (!newUser) {
      setMessage(errorMessage);
      return;
    }

    setProgress(newUser.id, { ...DEFAULT_PROGRESS, introCompleted: false });

    const progress = getProgress(newUser.id);
    navigate(progress.introCompleted ? "/dashboard" : "/intro");
  };

  if (getCurrentUser()) {
    return (
      <section className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">You already have a story</h1>
          <p>Continue your journey from the world map.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Open dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-5 auth-panel-wrap">
      <div className="pixel-panel auth-panel">
        <div className="auth-copy">
          <h1 className="pixel-heading md">Create account</h1>
          <p>Begin your journey in the world of Fluidia.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="signup-name" className="form-label">
            Name
          </label>
          <input
            id="signup-name"
            name="name"
            className="form-control"
            type="text"
            autoComplete="name"
            value={formValues.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="signup-email" className="form-label">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            className="form-control"
            type="email"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="signup-password" className="form-label">
            Password
          </label>
          <PasswordInput
            id="signup-password"
            name="password"
            className="form-control"
            type="password"
            autoComplete="new-password"
            value={formValues.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="signup-confirm" className="form-label">
            Confirm password
          </label>
          <PasswordInput
            id="signup-confirm"
            name="confirm"
            autoComplete="new-password"
            value={formValues.confirm}
            onChange={handleChange}
            aria-invalid={mismatch}
            required
          />
          {formValues.confirm ? (
            <p className={`password-match ${mismatch ? "bad" : "ok"}`} role="status">
              {mismatch ? "Passwords don't match yet." : "Passwords match."}
            </p>
          ) : null}

          {message ? <p className="form-message">{message}</p> : null}

          <button className="btn btn-primary w-100" type="submit">
            Sign up
          </button>
        </form>

        <p className="switch-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;