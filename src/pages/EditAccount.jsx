import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import DressingRoom from "../components/DressingRoom";
import PasswordInput from "../components/PasswordInput";
import { deleteAccount, getCurrentUser, updateAccount } from "../data/gameData";
// fun fun
import BackgroundMusicDresser from "../components/BgMusic";

function EditAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromLobby = location.state?.fromLobby === true; // entered through the castle's Edit Account door
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [formValues, setFormValues] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    password: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const mismatch = formValues.password !== formValues.confirm && (formValues.password !== "" || formValues.confirm !== "");

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formValues.password !== formValues.confirm) {
      setMessageType("error");
      setMessage("Your new passwords don't match. Please type them again.");
      return;
    }

    const nextEmail = formValues.email.trim() || currentUser.email;
    const { user: updatedUser, message: errorMessage } = await updateAccount(
      currentUser.id,
      nextEmail,
      formValues.password, // empty = keep the current password
      formValues.name.trim() || currentUser.name
    );

    if (!updatedUser) {
      setMessageType("error");
      setMessage(errorMessage);
      return;
    }

    setCurrentUser(updatedUser);
    setFormValues((current) => ({ ...current, password: "", confirm: "" }));
    setMessageType("success");
    setMessage("Your account details were saved.");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account and saved progress? This cannot be undone.")) {
      return;
    }

    const result = await deleteAccount(currentUser.id);
    if (result.ok) {
      navigate("/");
    } else {
      setMessageType("error");
      setMessage(result.message);
    }
  };

  return (
    <main className="container py-5">
      <BackgroundMusicDresser track="account"/>
      <div className="pixel-panel account-shell">
        <div className="account-header">
          <div>
            <p className="eyebrow accent">Account settings</p>
            <h1 className="pixel-heading md">Edit your profile</h1>
          </div>
        </div>

        <div className="account-layout">
          <DressingRoom userId={currentUser.id} />

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
            <PasswordInput
              id="account-password"
              name="password"
              className="form-control"
              type="password"
              placeholder="Leave blank to keep current"
              value={formValues.password}
              onChange={handleChange}
            />

            <label htmlFor="account-confirm" className="form-label">Confirm new password</label>
            <PasswordInput
              id="account-confirm"
              name="confirm"
              autoComplete="new-password"
              placeholder="Type it again"
              value={formValues.confirm}
              onChange={handleChange}
              aria-invalid={mismatch}
            />
            {formValues.password || formValues.confirm ? (
              <p className={`password-match ${mismatch ? "bad" : "ok"}`} role="status">
                {mismatch ? "Passwords don't match yet." : "Passwords match."}
              </p>
            ) : null}

            {message ? <p className={`form-message ${messageType}`}>{message}</p> : null}

            <div className="inline-actions">
              {cameFromLobby ? (
                <Link to="/intro" state={{ spawn: "account" }} className="btn btn-secondary">
                  Back to the castle
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-secondary">
                  Back to map
                </Link>
              )}
              <button type="submit" className="btn btn-primary">
                Save changes
              </button>
            </div>
            <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
              Delete account
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default EditAccount;
