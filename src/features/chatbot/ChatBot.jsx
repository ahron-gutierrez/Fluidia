import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import SpriteSlot from "../../components/SpriteSlot";
import { getCurrentUser } from "../../data/gameData";
import { chatStatus, streamChat } from "./chatClient";
import "../../styles/ChatBot.css";

const CHARACTER = "/lobby/character.png"; // every answer is spoken by this character
const GREETING = "Hi! I'm your Fluidia Guide. Ask me anything about the lessons: pressure, density, buoyancy, flow... I can also walk you through a practice problem.";

// No chat while you're being scored (quizzes, endless runs, quests), so it can't hand out answers.
const HIDDEN_ON = [/^\/quiz\/.+/, /^\/endless\/.+/, /^\/quest\//];

function suggestionsFor(path) {
  if (/pressure|density|village/.test(path)) return ["Why is pressure higher deeper down?", "Explain P = ρ × g × h", "Give me a density practice problem"];
  if (/specific-gravity/.test(path)) return ["What does specific gravity mean?", "Why does SG have no units?", "Give me a practice problem"];
  if (/archimedes|buoyan|laboratory|sunken/.test(path)) return ["Why do heavy ships float?", "Explain Archimedes' principle simply", "How do I find the buoyant force?"];
  if (/flow|bernoulli|plumber|windmill/.test(path)) return ["Explain the continuity equation", "How does an airplane wing make lift?", "Give me a flow practice problem"];
  return ["What topics can you help with?", "Explain fluids in simple words", "Give me a practice problem"];
}

// ---- tiny, safe formatter: **bold**, `code`, bullet and numbered lists, paragraphs ----
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function Rich({ text }) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((block, i) => {
      const lines = block.split("\n").filter(Boolean);
      if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
        return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*•]\s+/, ""))}</li>)}</ul>;
      }
      if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
        return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>)}</ol>;
      }
      return (
        <p key={i}>
          {lines.map((l, j) => (
            <span key={j}>{j > 0 && <br />}{inline(l.replace(/^#+\s*/, ""))}</span>
          ))}
        </p>
      );
    });
}

function Character() {
  return (
    <div className="chat-char">
      <SpriteSlot src={CHARACTER} label="character.png" />
    </div>
  );
}

function ChatBot() {
  const { pathname } = useLocation();
  const user = getCurrentUser();
  // lesson pages have a fixed Back / Next bar at the bottom: sit above it
  const lift = { "--chat-bottom": /^\/fluids\//.test(pathname) ? "74px" : "16px" };
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING, local: true }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(null); // null = not checked yet
  const listRef = useRef(null);
  const abortRef = useRef(null);

  // is LM Studio up? check whenever the window opens
  useEffect(() => {
    if (!open || !user) return undefined;
    let alive = true;
    chatStatus().then((isOnline) => alive && setOnline(isOnline));
    return () => { alive = false; };
  }, [open, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the newest message in view
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // Esc closes the window
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (HIDDEN_ON.some((pattern) => pattern.test(pathname))) return null;

  const send = async (text) => {
    const content = text.trim();
    if (!content || sending) return;

    const history = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setSending(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat({
        messages: history.filter((m) => !m.local).map(({ role, content: c }) => ({ role, content: c })),
        page: pathname,
        signal: controller.signal,
        onToken: (piece) =>
          setMessages((list) => {
            const copy = [...list];
            copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + piece };
            return copy;
          }),
      });
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      // an empty bubble (error or stopped) isn't kept
      setMessages((list) => (list[list.length - 1]?.content === "" ? list.slice(0, -1) : list));
      setSending(false);
      abortRef.current = null;
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([{ role: "assistant", content: GREETING, local: true }]);
    setError("");
  };

  if (!open) {
    return (
      <button type="button" className="chat-launcher" style={lift} onClick={() => setOpen(true)} aria-label="Open the Fluidia Guide chat">
        <span className="chat-launcher-img"><SpriteSlot src={CHARACTER} label="character.png" /></span>
        <span>Ask the Guide</span>
      </button>
    );
  }

  return (
    <section className="chat-panel" style={lift} role="dialog" aria-label="Fluidia Guide chat">
      <header className="chat-header">
        <Character />
        <div className="chat-title">
          <strong>Fluidia Guide</strong>
          <small>{online === false ? "● offline" : "● ready to help with the lessons"}</small>
        </div>
        <button type="button" className="chat-icon-btn" onClick={reset} aria-label="Start a new chat" title="New chat">↺</button>
        <button type="button" className="chat-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat" title="Close">✕</button>
      </header>

      {!user ? (
        <div className="chat-messages">
          <div className="chat-row bot">
            <Character />
            <div className="chat-bubble bot"><p>Log in to chat with me, then ask away!</p><Link to="/login" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Log in</Link></div>
          </div>
        </div>
      ) : (
        <>
          {online === false && (
            <p className="chat-banner">The AI helper is offline right now. Ask the host to start the LM Studio server.</p>
          )}

          <div className="chat-messages" ref={listRef} aria-live="polite">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="chat-row user"><div className="chat-bubble user">{m.content}</div></div>
              ) : (
                <div key={i} className="chat-row bot">
                  <Character />
                  <div className="chat-bubble bot">
                    {m.content ? <Rich text={m.content} /> : <span className="chat-typing" aria-label="typing"><i /><i /><i /></span>}
                  </div>
                </div>
              )
            )}
          </div>

          {messages.length <= 1 && !sending && (
            <div className="chat-chips">
              {suggestionsFor(pathname).map((s) => (
                <button key={s} type="button" className="chat-chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          {error && <p className="chat-error" role="alert">{error}</p>}

          <form
            className="chat-form"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <textarea
              rows={1}
              value={input}
              maxLength={1000}
              placeholder="Ask about a lesson…"
              aria-label="Your question"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
              }}
            />
            {sending ? (
              <button type="button" className="btn btn-secondary" onClick={() => abortRef.current?.abort()}>Stop</button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={!input.trim()}>Send</button>
            )}
          </form>
        </>
      )}
    </section>
  );
}

export default ChatBot;
