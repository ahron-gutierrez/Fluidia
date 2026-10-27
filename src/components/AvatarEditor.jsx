import { useEffect, useRef, useState } from "react";

import AvatarGallery from "./AvatarGallery";
import AvatarPoseSelector from "./AvatarPoseSelector";
import AvatarSprite from "./AvatarSprite";
import {
  DEFAULT_AVATAR_ROW,
  AVATAR_SPRITES,
  DEFAULT_AVATAR_ID,
  getAvatarSprite,
} from "../data/avatarAssets";
import { getAvatar, setAvatar } from "../data/gameData";

function AvatarEditor({ userId, onClose, onSave }) {
  const savedAvatar = getAvatar(userId);
  const [selectedSpriteId, setSelectedSpriteId] = useState(
    getAvatarSprite(savedAvatar?.spriteId)?.id ?? DEFAULT_AVATAR_ID
  );
  const [selectedRow, setSelectedRow] = useState(
    Math.max(0, Math.min(5, savedAvatar?.row ?? DEFAULT_AVATAR_ROW))
  );
  const [frame, setFrame] = useState(0);
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setFrame((currentFrame) => (currentFrame + 1) % 4);
    }, 180);

    return () => window.clearInterval(timerId);
  }, []);

  const handleSpriteSelect = (spriteId) => {
    setSelectedSpriteId(spriteId);
    setFrame(0);
  };

  const handleSave = () => {
    const avatar = { spriteId: selectedSpriteId, row: selectedRow };
    setAvatar(userId, avatar);
    onSave(avatar);
  };

  return (
    <div
      className="avatar-editor-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={modalRef}
        className="avatar-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-editor-title"
      >
        <header className="avatar-editor-header">
          <div>
            <h2 id="avatar-editor-title" className="pixel-heading md">Edit Avatar</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="avatar-editor-close"
            aria-label="Close avatar editor"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="avatar-editor-content">
          <section className="avatar-editor-preview-panel" aria-label="Avatar preview">
            <div className="avatar-editor-preview">
              <AvatarSprite
                spriteId={selectedSpriteId}
                row={selectedRow}
                frame={frame}
                size={160}
              />
            </div>
            <AvatarPoseSelector
              spriteId={selectedSpriteId}
              row={selectedRow}
              onChange={(nextRow) => {
                setSelectedRow(nextRow);
                setFrame(0);
              }}
            />
          </section>

          <section className="avatar-editor-gallery-panel" aria-label="Choose a character">
            <h3 className="avatar-editor-gallery-title">Characters</h3>
            <AvatarGallery
              sprites={AVATAR_SPRITES}
              selectedSpriteId={selectedSpriteId}
              onSelect={handleSpriteSelect}
            />
          </section>
        </div>

        <footer className="avatar-editor-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </footer>
      </section>
    </div>
  );
}

export default AvatarEditor;
