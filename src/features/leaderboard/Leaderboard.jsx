import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AnimatedAvatar from "../../components/AnimatedAvatar";
import { DEFAULT_AVATAR_ID } from "../../data/avatarAssets";
import { requestRaw } from "../../data/api";
import { flushSync, getCurrentUser } from "../../data/gameData";
import "../../styles/Leaderboard.css";

const SHOWN = 10;
const REFRESH_MS = 20000;
const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

function Row({ player, isYou }) {
  return (
    <li className={`lb-row${isYou ? " you" : ""}${player.rank <= 3 ? ` top-${player.rank}` : ""}`}>
      <span className="lb-rank">{MEDALS[player.rank] ?? `#${player.rank}`}</span>
      <span className="lb-avatar">
        <AnimatedAvatar spriteId={player.spriteId ?? DEFAULT_AVATAR_ID} size={44} />
      </span>
      <span className="lb-name">
        {player.name}
        {isYou && <span className="lb-you">YOU</span>}
      </span>
      <span className="lb-score">{player.score.toLocaleString()}</span>
    </li>
  );
}

// Asks the server for the top players (and your rank when logged in).
async function fetchBoard() {
  flushSync(); // make sure your latest points are saved first
  const [board, mine] = await Promise.all([
    requestRaw(`/api/leaderboard?limit=${SHOWN}`),
    getCurrentUser() ? requestRaw("/api/leaderboard/me") : Promise.resolve(null),
  ]);

  if (!board.ok) return { status: "error", message: board.data.message, players: [], total: 0, me: null };
  return { status: "ready", players: board.data.players, total: board.data.total, me: mine?.ok ? mine.data : null };
}

// Top players by total score (quests, endless runs and quizzes all add to it).
function Leaderboard() {
  const user = getCurrentUser();
  const [state, setState] = useState({ status: "loading", players: [], total: 0, me: null });
  const load = () => fetchBoard().then(setState);

  useEffect(() => {
    let alive = true;
    const refresh = () => fetchBoard().then((next) => alive && setState(next));
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const { status, players, total, me } = state;
  const youInList = user && players.some((p) => p.id === user.id);

  return (
    <main className="container py-4">
      <div className="pixel-panel leaderboard-panel">
        <p className="eyebrow accent">Hall of fame</p>
        <h1 className="pixel-heading md">Leaderboard</h1>
        <p className="lead">
          The top {SHOWN} players by total score. Earn points from quests, endless runs and quizzes.
        </p>

        {status === "loading" && <p className="lb-note">Loading the rankings…</p>}
        {status === "error" && (
          <p className="quest-feedback bad">
            {state.message ?? "Couldn't load the leaderboard."}{" "}
            <button type="button" className="btn btn-secondary btn-sm ms-2" onClick={load}>Try again</button>
          </p>
        )}

        {status === "ready" && players.length === 0 && <p className="lb-note">No players yet. Be the first!</p>}

        {status === "ready" && players.length > 0 && (
          <ol className="lb-list">
            {players.map((player) => (
              <Row key={player.id} player={player} isYou={user?.id === player.id} />
            ))}
          </ol>
        )}

        {status === "ready" && user && me && !youInList && (
          <>
            {me.rank > SHOWN && <div className="lb-gap" aria-hidden="true">· · ·</div>}
            <ol className="lb-list">
              <Row player={{ rank: me.rank, name: user.name, score: me.score, spriteId: null }} isYou />
            </ol>
          </>
        )}

        {status === "ready" && (
          <p className="lb-footer">
            {total} player{total === 1 ? "" : "s"} ranked
            {user && me ? <> · You're <strong>#{me.rank}</strong> with <strong>{me.score.toLocaleString()}</strong> points</> : null}
          </p>
        )}

        <div className="inline-actions mt-3">
          <button type="button" className="btn btn-secondary" onClick={load}>Refresh</button>
          {!user && <Link to="/login" className="btn btn-primary">Log in to see your rank</Link>}
          <Link to="/quiz" className="btn btn-secondary">Quiz Hall</Link>
          <Link to="/endless" className="btn btn-secondary">Endless mode</Link>
        </div>
      </div>
    </main>
  );
}

export default Leaderboard;
