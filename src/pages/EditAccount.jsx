import { useState } from "react";
import { Link } from "react-router-dom";

import { getCurrentUser, getUsers, setCurrentUser, setUsers } from "../data/gameData";

function EditAccount() {
  const currentUser = getCurrentUser();
  const [formValues, setFormValues] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    password: "",
  });
  const [message, setMessage] = useState("");

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

    const users = getUsers();
    const updatedUsers = users.map((user) => {
      if (user.id !== currentUser.id) {
        return user;
      }

      const nextName = formValues.name.trim() || user.name;
      const nextEmail = formValues.email.trim() || user.email;
      const nextPassword = formValues.password ? formValues.password : user.password;

      const updatedUser = { ...user, name: nextName, email: nextEmail, password: nextPassword };
      setCurrentUser(updatedUser);
      return updatedUser;
    });

    setUsers(updatedUsers);
    setMessage("Your account details were saved.");
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

          {message ? <p className="form-message success">{message}</p> : null}

          <div className="inline-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              Back to map
            </Link>
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditAccount;
