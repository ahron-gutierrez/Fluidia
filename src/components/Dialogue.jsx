import { useEffect, useState } from "react";

// Speech box with typewriter text. Button skips the typing, then advances.
function Dialogue({ speaker = "Plumber", text, onNext, nextLabel = "Next" }) {
  const [shown, setShown] = useState(0);
  const typing = shown < text.length;

  useEffect(() => {
    const id = setInterval(() => setShown((n) => Math.min(n + 1, text.length)), 22);
    return () => clearInterval(id);
  }, [text]);

  return (
    <div className="plumber-speech">
      <strong>{speaker}:</strong> {text.slice(0, shown)}
      <div>
        <button
          type="button"
          className="btn btn-primary btn-sm mt-2"
          onClick={() => (typing ? setShown(text.length) : onNext())}
        >
          {typing ? "Skip" : nextLabel}
        </button>
      </div>
    </div>
  );
}

export default Dialogue;
