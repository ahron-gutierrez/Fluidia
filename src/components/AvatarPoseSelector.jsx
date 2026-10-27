import { AVATAR_POSES } from "../data/avatarAssets";
import AvatarSprite from "./AvatarSprite";

function AvatarPoseSelector({ spriteId, row, onChange }) {
  return (
    <section className="avatar-pose-selector" aria-label="Choose an animation pose">
      <div className="avatar-editor-section-heading">
      </div>
     
      <div className="avatar-row-options" role="group" aria-label="Available poses">
        {AVATAR_POSES.map((pose) => (
          <button
            key={pose.row}
            type="button"
            className={row === pose.row ? "selected" : ""}
            aria-pressed={row === pose.row}
            aria-label={`Select ${pose.label} pose`}
            onClick={() => onChange(pose.row)}
          >
            <AvatarSprite spriteId={spriteId} row={pose.row} size={48} />
            <span>{pose.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default AvatarPoseSelector;
