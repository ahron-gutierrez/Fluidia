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

export function getCurrentUser() {
  try {
    const user = localStorage.getItem("aquademia-current-user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem("aquademia-current-user");
    return;
  }

  localStorage.setItem("aquademia-current-user", JSON.stringify(user));
}

export function getUsers() {
  try {
    const users = localStorage.getItem("aquademia-users");
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

export function setUsers(users) {
  localStorage.setItem("aquademia-users", JSON.stringify(users));
}

export function addAccount(email, password, score = 0, name = "") {
  const users = getUsers();
  const normalizedEmail = email.trim();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail.toLowerCase())) {
    return null;
  }

  const account = {
    id: `user-${Date.now()}`,
    name,
    email: normalizedEmail,
    password,
    score,
  };

  setUsers([...users, account]);
  return account;
}

export function updateAccount(id, email, password, score, name) {
  const users = getUsers();
  const normalizedEmail = email.trim();

  if (
    users.some(
      (user) => user.id !== id && user.email.toLowerCase() === normalizedEmail.toLowerCase()
    )
  ) {
    return null;
  }

  let updatedAccount = null;
  const updatedUsers = users.map((user) => {
    if (user.id !== id) {
      return user;
    }

    updatedAccount = {
      ...user,
      name: name ?? user.name,
      email: normalizedEmail,
      password,
      score,
    };
    return updatedAccount;
  });

  if (!updatedAccount) {
    return null;
  }

  setUsers(updatedUsers);
  if (getCurrentUser()?.id === id) {
    setCurrentUser(updatedAccount);
  }
  return updatedAccount;
}

export function deleteAccount(id) {
  const users = getUsers();
  const accountExists = users.some((user) => user.id === id);

  if (!accountExists) {
    return false;
  }

  setUsers(users.filter((user) => user.id !== id));
  localStorage.removeItem(`aquademia-progress-${id}`);
  localStorage.removeItem(`aquademia-avatar-${id}`);

  if (getCurrentUser()?.id === id) {
    setCurrentUser(null);
  }

  return true;
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
  window.dispatchEvent(new CustomEvent("fluidia-avatar-change", { detail: { userId } }));
}

export function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  return getUsers().find(
    (user) =>
      user.email.toLowerCase() === normalizedEmail &&
      user.password === password
  ) ?? null;
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

  localStorage.setItem(
    `aquademia-progress-${userId}`,
    JSON.stringify({
      ...DEFAULT_PROGRESS,
      ...progress,
    })
  );
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
  const users = getUsers();
  const base = users.find((u) => u.id === userId) ?? (current?.id === userId ? current : null);
  if (!base) return null;

  const before = base.score ?? 0;
  const after = before + points;
  setUsers(users.map((u) => (u.id === userId ? { ...u, score: after } : u)));
  if (current?.id === userId) setCurrentUser({ ...current, score: after });
  return { before, after };
}
