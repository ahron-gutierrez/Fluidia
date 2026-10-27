import { useEffect, useState } from "react";

import AvatarSprite from "./AvatarSprite";
import { DEFAULT_AVATAR_ROW } from "../data/avatarAssets";

function AnimatedAvatar({ spriteId, row = DEFAULT_AVATAR_ROW, animate, size, className = "" }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!animate) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setFrame((currentFrame) => (currentFrame + 1) % 4);
    }, 180);

    return () => window.clearInterval(timerId);
  }, [animate]);

  return (
    <AvatarSprite
      className={className}
      spriteId={spriteId}
      row={row}
      frame={animate ? frame : 0}
      size={size}
    />
  );
}

export default AnimatedAvatar;
