import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { deleteAccount, getCurrentUser, updateAccount } from "../data/gameData";

function EditAccount() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [formValues, setFormValues] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [score, setScore] = useState(currentUser?.score ?? 0);

  if (!currentUser) {
    return (
      <main className="container py-5">
        <div className="pixel-panel alert-panel">
          <h1 className="pixel-heading md">No active account</h1>
          <p>Please log in before editing your profile.</p>
          <Link to="/login" className="btn btn-primary">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextEmail = formValues.email.trim() || currentUser.email;
    const nextPassword = formValues.password || currentUser.password;
    const updatedUser = updateAccount(
      currentUser.id,
      nextEmail,
      nextPassword,
      score,
      formValues.name.trim() || currentUser.name
    );

    if (!updatedUser) {
      setMessageType("error");
      setMessage("That email address is already associated with another account.");
      return;
    }

    setCurrentUser(updatedUser);
    setMessageType("success");
    setMessage("Your account details were saved.");
  };

  const handleResetScore = () => {
    const updatedUser = updateAccount(
      currentUser.id,
      currentUser.email,
      currentUser.password,
      0,
      currentUser.name
    );

    if (!updatedUser) {
      setMessageType("error");
      setMessage("That email address is already associated with another account.");
      return;
    }

    setCurrentUser(updatedUser);
    setScore(0);
    setMessageType("success");
    setMessage("Your score has been reset.");
  };

  const handleDeleteAccount = () => {
    if (!window.confirm("Delete your account and saved progress? This cannot be undone.")) {
      return;
    }

    if (deleteAccount(currentUser.id)) {
      navigate("/");
    }
  };

  return (
    <main className="container py-5">
      <div className="pixel-panel account-shell">
        <div className="account-header">
          <div>
            <p className="eyebrow accent">Account settings</p>
            <h1 className="pixel-heading md">Edit your profile</h1>
          </div>
          <div className="profile-badge">{(currentUser.name || "A").slice(0, 2).toUpperCase()}</div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form account-form">
          <label htmlFor="account-name" className="form-label">Character name</label>
          <input
            id="account-name"
            name="name"
            className="form-control"
            type="text"
            value={formValues.name}
            onChange={handleChange}
          />

          <label htmlFor="account-email" className="form-label">Email</label>
          <input
            id="account-email"
            name="email"
            className="form-control"
            type="email"
            value={formValues.email}
            onChange={handleChange}
          />

          <label htmlFor="account-password" className="form-label">New password</label>
          <input
            id="account-password"
            name="password"
            className="form-control"
            type="password"
            placeholder="Leave blank to keep current"
            value={formValues.password}
            onChange={handleChange}
          />

          <div className="inline-actions">
            <p className="form-label">Score: {score}</p>
            <button type="button" className="btn btn-secondary" onClick={handleResetScore}>
              Reset score
            </button>
          </div>

          {message ? <p className={`form-message ${messageType}`}>{message}</p> : null}

          <div className="inline-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              Back to map
            </Link>
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </div>
          <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
            Delete account
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditAccount;
