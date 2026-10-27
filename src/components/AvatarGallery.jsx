import AvatarSprite from "./AvatarSprite";

function AvatarGallery({ sprites, selectedSpriteId, onSelect }) {
  return (
    <div className="avatar-gallery" aria-label="Available characters">
      {sprites.map((sprite) => (
        <button
          key={sprite.id}
          type="button"
          className={`avatar-gallery-choice${selectedSpriteId === sprite.id ? " selected" : ""}`}
          aria-pressed={selectedSpriteId === sprite.id}
          aria-label={`Select Blonde 1 option ${sprite.option}`}
          onClick={() => onSelect(sprite.id)}
        >
          <AvatarSprite spriteId={sprite.id} size={48} />
        </button>
      ))}
    </div>
  );
}

export default AvatarGallery;
