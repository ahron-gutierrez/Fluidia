import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AnimatedAvatar from "../components/AnimatedAvatar";
import AvatarEditor from "../components/AvatarEditor";
import { DEFAULT_AVATAR_ROW } from "../data/avatarAssets";
import {
  deleteAccount,
  getAvatar,
  getCurrentUser,
  updateAccount,
} from "../data/gameData";

function EditAccount() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [avatar, setAvatar] = useState(() => getAvatar(currentUser?.id));
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [isProfileAvatarAnimating, setIsProfileAvatarAnimating] = useState(false);
  const profileAvatarTimerRef = useRef(null);
  const profileAvatarTriggerRef = useRef(null);
  const [formValues, setFormValues] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => () => window.clearTimeout(profileAvatarTimerRef.current), []);

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
      currentUser.score ?? 0,
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

  const handleDeleteAccount = () => {
    if (!window.confirm("Delete your account and saved progress? This cannot be undone.")) {
      return;
    }

    if (deleteAccount(currentUser.id)) {
      navigate("/");
    }
  };

  const startProfileAvatarTapAnimation = () => {
    window.clearTimeout(profileAvatarTimerRef.current);
    setIsProfileAvatarAnimating(true);
    profileAvatarTimerRef.current = window.setTimeout(() => {
      if (profileAvatarTriggerRef.current === document.activeElement) {
        profileAvatarTriggerRef.current.blur();
      } else {
        setIsProfileAvatarAnimating(false);
      }
    }, 720);
  };

  const handleProfileAvatarPointerDown = (event) => {
    if (event.pointerType === "touch") {
      startProfileAvatarTapAnimation();
    }
  };

  const stopProfileAvatarAnimation = () => {
    window.clearTimeout(profileAvatarTimerRef.current);
    setIsProfileAvatarAnimating(false);
  };

  return (
    <main className="container py-5">
      <div className="pixel-panel account-shell">
        <div className="account-header">
          <div>
            <p className="eyebrow accent">Account settings</p>
            <h1 className="pixel-heading md">Edit your profile</h1>
          </div>
          <div className="account-avatar-actions">
            <button
              ref={profileAvatarTriggerRef}
              type="button"
              className="account-avatar-trigger"
              aria-label="Animate profile avatar"
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") {
                  setIsProfileAvatarAnimating(true);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "touch") {
                  stopProfileAvatarAnimation();
                }
              }}
              onPointerDown={handleProfileAvatarPointerDown}
              onTouchStart={startProfileAvatarTapAnimation}
              onFocus={() => setIsProfileAvatarAnimating(true)}
              onBlur={stopProfileAvatarAnimation}
            >
              <AnimatedAvatar
                className="profile-badge"
                spriteId={avatar?.spriteId}
                row={avatar?.row ?? DEFAULT_AVATAR_ROW}
                animate={isProfileAvatarAnimating}
                size={64}
              />
            </button>
            <button
              type="button"
              className="btn btn-secondary account-edit-avatar-button"
              onClick={() => setIsAvatarEditorOpen(true)}
            >
              Edit Avatar
            </button>
          </div>
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
      {isAvatarEditorOpen && (
        <AvatarEditor
          userId={currentUser.id}
          onClose={() => setIsAvatarEditorOpen(false)}
          onSave={(savedAvatar) => {
            setAvatar(savedAvatar);
            setIsAvatarEditorOpen(false);
          }}
        />
      )}
    </main>
  );
}

export default EditAccount;
