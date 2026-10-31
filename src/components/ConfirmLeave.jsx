import { createPortal } from "react-dom";

function ConfirmLeave({ onStay, onLeave }) {
  return createPortal(
    <div className="confirm-leave-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-leave-title">
      <div className="pixel-panel confirm-leave-box">
        <h2 id="confirm-leave-title" className="pixel-heading md">Leave the quest?</h2>
        <p>Your progress in this quest will be lost if you leave now.</p>
        <button type="button" className="btn btn-primary me-2" onClick={onStay}>Stay</button>
        <button type="button" className="btn btn-secondary" onClick={onLeave}>Leave</button>
      </div>
    </div>,
    document.body,
  );
}

export default ConfirmLeave;
