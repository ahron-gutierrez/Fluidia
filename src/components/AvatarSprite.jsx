import { DEFAULT_AVATAR_ROW, getAvatarSprite } from "../data/avatarAssets";

function AvatarSprite({
  spriteId,
  row = DEFAULT_AVATAR_ROW,
  frame = 0,
  size = 128,
  className = "",
}) {
  const sprite = getAvatarSprite(spriteId);

  if (!sprite) {
    return null;
  }

  const column = Math.max(0, Math.min(3, frame));
  const animationRow = Math.max(0, Math.min(5, row));

  return (
    <span
      className={`avatar-sprite ${className}`.trim()}
      role="img"
      aria-label={sprite.name}
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${sprite.src}")`,
        backgroundPosition: `${(column / 3) * 100}% ${(animationRow / 5) * 100}%`,
      }}
    />
  );
}

export default AvatarSprite;
