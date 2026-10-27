const blondeSpritePaths = [
  "boy/boy_blonde.png",
  "boy_costume/boy_costume_blond.png",
  "boy_shorts/boy_blond.png",
  "girl_costume/girl_costume_blond.png",
  "girl_shorts/girl_shorts_blond.png",
  "princess/princess_blond.png",
];

export const AVATAR_SPRITES = blondeSpritePaths.map((path, index) => ({
  id: path,
  name: "Blonde 1",
  option: index + 1,
  src: `/avatar-sprites/${path}`,
}));

export const AVATAR_POSES = [
  { row: 0, label: "Punch" },
  { row: 1, label: "Idle" },
  { row: 2, label: "Jump" },
  { row: 3, label: "Walk" },
  { row: 4, label: "Shocked" },
  { row: 5, label: "Fall" },
];

export const DEFAULT_AVATAR_ROW = AVATAR_POSES.find((pose) => pose.label === "Idle").row;
export const DEFAULT_AVATAR_ID = AVATAR_SPRITES[0].id;

export function getAvatarSprite(spriteId) {
  return AVATAR_SPRITES.find((sprite) => sprite.id === spriteId)
    ?? AVATAR_SPRITES.find((sprite) => sprite.id === DEFAULT_AVATAR_ID);
}
