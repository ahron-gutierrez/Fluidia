import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { DEFAULT_PROGRESS, getCurrentUser, getProgress, getUsers, setCurrentUser, setProgress, setUsers } from "../data/gameData";

function Signup() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = formValues.name.trim();
    const trimmedEmail = formValues.email.trim();

    if (!trimmedName || !trimmedEmail || !formValues.password) {
      setMessage("Please complete all fields before creating your account.");
      return;
    }

    const users = getUsers();
    const emailExists = users.some((user) => user.email.toLowerCase() === trimmedEmail.toLowerCase());

    if (emailExists) {
      setMessage("An account already exists with that email address.");
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: formValues.password,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
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
          <input
            id="signup-password"
            name="password"
            className="form-control"
            type="password"
            autoComplete="new-password"
            value={formValues.password}
            onChange={handleChange}
            required
          />

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