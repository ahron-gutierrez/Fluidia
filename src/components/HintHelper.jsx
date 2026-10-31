import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import SpriteSlot from "./SpriteSlot";
import { playSfx } from "../utils/sfx";

// Slides in at the side of the screen with a hint if the player takes too long.
// Mount it per round (give it a key); pass paused=true once the round is answered.
function HintHelper({ delayMs = 30000, paused = false, children }) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (paused || shown) return undefined;
    const id = setTimeout(() => {
      setShown(true);
      playSfx("hint");
    }, delayMs);
    return () => clearTimeout(id);
  }, [delayMs, paused, shown]);

  if (!shown || paused || dismissed) return null;

  return createPortal(
    <aside className="hint-helper" role="status">
      <div className="hint-helper-bubble">
        <strong>Need a hand?</strong>
        <div>{children}</div>
        <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={() => setDismissed(true)}>
          Got it
        </button>
      </div>
      <div className="hint-helper-sprite">
        <SpriteSlot src="/lobby/helper.png" label="helper.png" />
      </div>
    </aside>,
    document.body,
  );
}

export default HintHelper;
