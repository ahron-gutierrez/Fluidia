import { API_BASE, getToken, request, setToken } from "./api";

export const QUESTS = [
  {
    id: "village-beneath-water",
    title: "The Village Beneath the Water",
    route: "/fluids/pressure-density",
    area: "Home Village",
    topic: "Fluid pressure, density, and specific gravity",
    difficulty: "Intro",
    description:
      "The reservoir in the village is behaving like it has a mind of its own. Test how depth and density change pressure before the water system resets itself.",
  },
  {
    id: "sunken-cargo",
    title: "The Sunken Cargo",
    route: "/fluids/archimedes",
    area: "The Harbor",
    topic: "Archimedes' principle, buoyancy, and floating or sinking",
    difficulty: "Adventurer",
    description:
      "Cargo crates have drifted to the harbor floor. Decide which objects can be recovered by understanding buoyancy and displaced fluid.",
  },
  {
    id: "windmills-secret",
    title: "The Windmill's Secret",
    route: "/fluids/rate-of-flow",
    area: "Windmill Town",
    topic: "Bernoulli's principle and fluid flow",
    difficulty: "Scholar",
    description:
      "Wind patterns around the town's mills are accelerating and slowing unexpectedly. Trace how changing flow speed changes pressure in a moving fluid.",
  },
];

export const DEFAULT_PROGRESS = {
  introCompleted: false,
  unlockedQuests: ["village-beneath-water"],
  completedQuests: [],
  currentQuest: "village-beneath-water",
};

// ----- Accounts & session (stored in the backend database) -----
// The browser keeps a small cache of the logged-in player's data so the pages can read it
// instantly. Changes are sent to the backend in the background (see queueSync).

const CURRENT_USER_KEY = "aquademia-current-user";

// Shape the pages use: { id, name, email, score }
// function toUser(account) {
//   return {
//     id: account.id,
//     name: account.Name ?? "",
//     email: account.Email ?? "",
//     score: account.Score ?? 0,
//   };
// }

function writeCache(key, value) {
  if (value === null || value === undefined) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
}

// Saves a freshly logged-in / signed-up account (and its token) into the browser cache.
// function startSession(account, token) {
//   // Changes that never reached the server (e.g. it was down) win over the older saved copy.
//   const unsaved = readPending();
//   if (unsaved && unsaved.userId === account.id) {
//     account = { ...account, ...unsaved.patch };
//   } else if (unsaved) {
//     clearPending();
//   }

//   setToken(token);
//   writeCache(CURRENT_USER_KEY, toUser(account));
//   writeCache(`aquademia-avatar-${account.id}`, account.Avatar);
//   writeCache(`aquademia-progress-${account.id}`, account.Progress);
//   writeCache(`fluidia-map-visited-${account.id}`, account.MapVisited ?? []);
//   window.dispatchEvent(new CustomEvent("fluidia-avatar-change", { detail: { userId: account.id } }));
//   if (unsaved && unsaved.userId === account.id) queueSync(account.id, unsaved.patch);
//   return toUser(account);
// }

const getAccountId = (a) => a.ID ?? a.id ?? a.Id ?? a._id;

function toUser(account) {
  return {
    id: getAccountId(account),
    name: account.Name ?? "",
    email: account.Email ?? "",
    score: account.Score ?? 0,
  };
}
function startSession(account, token) {
  const id = getAccountId(account);

  const unsaved = readPending();
  if (unsaved && unsaved.userId === id) {
    account = { ...account, ...unsaved.patch };
  } else if (unsaved) {
    clearPending();
  }

  setToken(token);
  writeCache(CURRENT_USER_KEY, toUser(account));
  writeCache(`aquademia-avatar-${id}`, account.Avatar);
  writeCache(`aquademia-progress-${id}`, account.Progress);
  writeCache(`fluidia-map-visited-${id}`, account.MapVisited ?? []);
  window.dispatchEvent(new CustomEvent("fluidia-avatar-change", { detail: { userId: id } }));
  if (unsaved && unsaved.userId === id) queueSync(id, unsaved.patch);
  return toUser(account);
}


export function getCurrentUser() {
  try {
    if (!getToken()) return null; // not logged in (or the old pre-backend session)
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (!user) {
    // log out: send any unsaved changes first, then forget the session
    const token = getToken();
    flushSync();
    localStorage.removeItem(CURRENT_USER_KEY);
    setToken(null);
    if (token) {
      fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
      }).catch(() => {});
    }
    return;
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// All of these return { user, message } (user is null when it failed; message says why).

export async function addAccount(email, password, score = 0, name = "") {
  const { ok, data } = await request("", {
    method: "POST",
    body: { Name: name, Email: email.trim(), Password: password, Score: score },
  });
  if (!ok) return { user: null, message: data.message ?? "Could not create the account." };
  return { user: startSession(data.account, data.token), message: "" };
}

export async function login(email, password) {
  const { ok, status, data } = await request("/login", {
    method: "POST",
    body: { Email: email.trim(), Password: password },
  });
  if (!ok) {
    return {
      user: null,
      message:
        status === 401
          ? "We could not find a matching account. Try again or sign up."
          : data.message ?? "Could not log in.",
    };
  }
  return { user: startSession(data.account, data.token), message: "" };
}

// Leave `password` empty to keep the current one.
export async function updateAccount(id, email, password, name) {
  const body = { Email: email.trim() };
  if (name !== undefined) body.Name = name;
  if (password) body.Password = password;

  flushSync();
  const { ok, data } = await request(`/${id}`, { method: "PUT", body });
  if (!ok) return { user: null, message: data.message ?? "Could not save your changes." };

  const user = toUser(data.account);
  if (getCurrentUser()?.id === id) setCurrentUser(user);
  return { user, message: "" };
}

export async function deleteAccount(id) {
  const { ok, data } = await request(`/${id}`, { method: "DELETE" });
  if (!ok) return { ok: false, message: data.message ?? "Could not delete the account." };

  localStorage.removeItem(`aquademia-progress-${id}`);
  localStorage.removeItem(`aquademia-avatar-${id}`);
  localStorage.removeItem(`fluidia-map-visited-${id}`);
  localStorage.removeItem(CURRENT_USER_KEY);
  pendingSync = null;
  clearPending();
  setToken(null);
  return { ok: true, message: "" };
}

// ----- Background saving -----
// Avatar, progress, map and score changes are saved in the browser right away, then sent to
// the backend a moment later (batched into one request).

const PENDING_KEY = "aquademia-pending-sync";
let pendingSync = null; // { userId, patch } waiting to be sent
let syncTimer = null;

function readPending() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY));
  } catch {
    return null;
  }
}

function clearPending() {
  localStorage.removeItem(PENDING_KEY);
}

// Unsent changes are also kept in the browser, so a failed save, a refresh, or a
// forced re-login can't lose them. They're removed only once the server confirms.
function persistPending() {
  if (pendingSync) localStorage.setItem(PENDING_KEY, JSON.stringify(pendingSync));
}

function queueSync(userId, patch, delay = 400) {
  if (!userId) return;
  pendingSync = { userId, patch: { ...(pendingSync?.patch ?? {}), ...patch } };
  persistPending();
  clearTimeout(syncTimer);
  syncTimer = setTimeout(flushSync, delay);
}

export function flushSync() {
  clearTimeout(syncTimer);
  if (!pendingSync || !getToken()) return;

  const sending = pendingSync;
  pendingSync = null;

  request(`/${sending.userId}`, { method: "PUT", body: sending.patch, keepalive: true }).then(
    ({ ok, status }) => {
      if (ok) {
        if (!pendingSync) clearPending();
        return;
      }

      // Not saved: keep it (older values must not overwrite anything newer queued meanwhile)
      pendingSync = { userId: sending.userId, patch: { ...sending.patch, ...(pendingSync?.patch ?? {}) } };
      persistPending();

      if (status === 401) {
        // login expired: log in again; the unsaved changes are kept and re-sent after that
        localStorage.removeItem(CURRENT_USER_KEY);
        setToken(null);
        window.location.assign("/login");
      } else if (status === 0 || status >= 500) {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(flushSync, 5000); // try again in a few seconds
      }
    }
  );
}

if (typeof window !== "undefined") {
  // Changes left unsent by a previous visit (refresh, closed tab, server down) go out now.
  pendingSync = readPending();
  if (pendingSync) syncTimer = setTimeout(flushSync, 1000);

  window.addEventListener("pagehide", flushSync);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSync();
  });
}

export function getAvatar(userId) {
  if (!userId) {
    return null;
  }

  try {
    const savedAvatar = localStorage.getItem(`aquademia-avatar-${userId}`);
    return savedAvatar ? JSON.parse(savedAvatar) : null;
  } catch {
    return null;
  }
}

export function setAvatar(userId, avatar) {
  if (!userId || !avatar?.spriteId) {
    throw new TypeError("A user ID and avatar sprite are required.");
  }

  localStorage.setItem(`aquademia-avatar-${userId}`, JSON.stringify(avatar));
  queueSync(userId, { Avatar: avatar });
  window.dispatchEvent(new CustomEvent("fluidia-avatar-change", { detail: { userId } }));
}

export function getProgress(userId) {
  if (!userId) {
    return { ...DEFAULT_PROGRESS };
  }

  try {
    const raw = localStorage.getItem(`aquademia-progress-${userId}`);
    if (!raw) {
      return { ...DEFAULT_PROGRESS };
    }

    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...saved,
      unlockedQuests: saved.unlockedQuests ?? DEFAULT_PROGRESS.unlockedQuests,
      completedQuests: saved.completedQuests ?? DEFAULT_PROGRESS.completedQuests,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function setProgress(userId, progress) {
  if (!userId) {
    return;
  }

  const merged = { ...DEFAULT_PROGRESS, ...progress };
  localStorage.setItem(`aquademia-progress-${userId}`, JSON.stringify(merged));
  queueSync(userId, { Progress: merged });
}

// Map locations the player has explored
export function getMapVisited(userId) {
  try {
    return JSON.parse(localStorage.getItem(`fluidia-map-visited-${userId}`)) ?? [];
  } catch {
    return [];
  }
}

export function setMapVisited(userId, visited) {
  localStorage.setItem(`fluidia-map-visited-${userId}`, JSON.stringify(visited));
  queueSync(userId, { MapVisited: visited });
}

export function getQuestById(id) {
  return QUESTS.find((quest) => quest.id === id) ?? QUESTS[0];
}

export function getQuestProgressLabel(progress) {
  return `${progress.completedQuests.length}/${QUESTS.length} quests solved`;
}

// ----- Quest scoring -----
export const SCORE_RULES = { completion: 100, perRound: 50, firstTryBonus: 50 };

export function calculateQuestScore(totalRounds, firstTryRounds) {
  const rounds = totalRounds * SCORE_RULES.perRound;
  const bonus = firstTryRounds * SCORE_RULES.firstTryBonus;
  return {
    completion: SCORE_RULES.completion,
    rounds,
    bonus,
    total: SCORE_RULES.completion + rounds + bonus,
  };
}

// Adds points to the account's total score. Returns { before, after } or null.
export function addScore(userId, points) {
  const current = getCurrentUser();
  if (!current || current.id !== userId) return null;

  const before = current.score ?? 0;
  const after = before + points;
  setCurrentUser({ ...current, score: after });
  queueSync(userId, { Score: after });
  return { before, after };
}
