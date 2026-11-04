import { QUIZ_IDS } from "../features/quiz/quizData";
import { getCurrentUser, getMapVisited, getProgress, setProgress } from "./gameData";

// Achievements live inside the saved quest progress (progress.achievements / .stats / .questResults /
// .endless), so no extra database column is needed.

export const QUEST_IDS = ["village-beneath-water", "windmills-secret", "sunken-cargo"];

export const RARITY = {
  common: { label: "Common", color: "#9aa5ad" },
  rare: { label: "Rare", color: "#4ca9c7" },
  epic: { label: "Epic", color: "#8a6fc4" },
  legendary: { label: "Legendary", color: "#f0cd86" },
};

// check(ctx) -> true once earned. ctx is built by buildContext() below.
export const ACHIEVEMENTS = [
  { id: "first-dive", icon: "🤿", rarity: "common", title: "First Dive", desc: "Complete the Hydrostatic Pressure quest.", check: (c) => c.completed.includes("village-beneath-water") },
  { id: "plumbers-pal", icon: "🔧", rarity: "common", title: "Plumber's Pal", desc: "Fix the plumber's pipes.", check: (c) => c.completed.includes("windmills-secret") },
  { id: "lab-partner", icon: "🧪", rarity: "common", title: "Lab Partner", desc: "Finish the experiments in the Buoyancy Lab.", check: (c) => c.completed.includes("sunken-cargo") },
  { id: "master-of-fluids", icon: "🌊", rarity: "rare", title: "Master of Fluids", desc: "Complete all three quests.", check: (c) => QUEST_IDS.every((id) => c.completed.includes(id)) },
  { id: "sharp-mind", icon: "🎯", rarity: "rare", title: "Sharp Mind", desc: "Finish a quest with every round solved on the first try.", check: (c) => Object.values(c.results).some((r) => r.perfect) },
  { id: "flawless", icon: "👑", rarity: "legendary", title: "Flawless Victory", desc: "Finish ALL three quests on your very first attempt with zero mistakes.", check: (c) => QUEST_IDS.every((id) => c.results[id]?.perfect) },

  { id: "explorer", icon: "🧭", rarity: "common", title: "Explorer", desc: "Visit 5 places on the map.", check: (c) => c.mapVisited >= 5 },
  { id: "cartographer", icon: "🗺️", rarity: "rare", title: "Cartographer", desc: "Visit all 10 places on the map.", check: (c) => c.mapVisited >= 10 },
  { id: "fresh-look", icon: "👗", rarity: "common", title: "Fresh Look", desc: "Change your character in the dressing room.", check: (c) => (c.stats.looksChanged ?? 0) >= 1 },
  { id: "tinkerer", icon: "🛠️", rarity: "common", title: "Tinkerer", desc: "Try a lesson sandbox.", check: (c) => (c.stats.sandboxes ?? []).length >= 1 },
  { id: "lab-rat", icon: "🐀", rarity: "rare", title: "Lab Rat", desc: "Try all four lesson sandboxes.", check: (c) => (c.stats.sandboxes ?? []).length >= 4 },

  { id: "rising-star", icon: "⭐", rarity: "common", title: "Rising Star", desc: "Reach 500 total points.", check: (c) => c.score >= 500 },
  { id: "fluid-legend", icon: "🏆", rarity: "epic", title: "Fluid Legend", desc: "Reach 3000 total points.", check: (c) => c.score >= 3000 },

  { id: "endless-start", icon: "♾️", rarity: "common", title: "No End in Sight", desc: "Reach level 5 in an endless run.", check: (c) => c.bestLevel >= 5 },
  { id: "on-a-roll", icon: "🔥", rarity: "rare", title: "On a Roll", desc: "Answer 10 questions in a row in an endless run.", check: (c) => c.bestStreak >= 10 },
  { id: "untouchable", icon: "🛡️", rarity: "epic", title: "Untouchable", desc: "Reach level 10 in an endless run without losing a life.", check: (c) => (c.stats.perfectRunLevel ?? 0) >= 10 },
  { id: "deep-diver", icon: "🐙", rarity: "epic", title: "Deep Diver", desc: "Reach level 15 in an endless run.", check: (c) => c.bestLevel >= 15 },
  { id: "pop-quiz", icon: "📝", rarity: "common", title: "Pop Quiz", desc: "Finish a quiz in the Quiz Hall.", check: (c) => Object.keys(c.quizzes).length >= 1 },
  { id: "straight-as", icon: "💯", rarity: "rare", title: "Straight A's", desc: "Get a perfect score on a quiz.", check: (c) => Object.values(c.quizzes).some((r) => r.best >= 15) },
  { id: "honor-roll", icon: "📚", rarity: "rare", title: "Honor Roll", desc: "Score at least 12/15 on all five quizzes.", check: (c) => QUIZ_IDS.every((id) => (c.quizzes[id]?.best ?? 0) >= 12) },
  { id: "valedictorian", icon: "🎓", rarity: "epic", title: "Valedictorian", desc: "Get a perfect score on all five quizzes.", check: (c) => QUIZ_IDS.every((id) => (c.quizzes[id]?.best ?? 0) >= 15) },
  { id: "high-roller", icon: "💎", rarity: "epic", title: "High Roller", desc: "Score 3000 points in a single endless run.", check: (c) => (c.stats.bestRunScore ?? 0) >= 3000 },
];

function buildContext(userId) {
  const progress = getProgress(userId);
  const endless = Object.values(progress.endless ?? {});
  return {
    completed: progress.completedQuests ?? [],
    results: progress.questResults ?? {},
    quizzes: progress.quizzes ?? {},
    stats: progress.stats ?? {},
    mapVisited: getMapVisited(userId).length,
    score: getCurrentUser()?.score ?? 0,
    bestLevel: Math.max(0, ...endless.map((e) => e.bestLevel ?? 0)),
    bestStreak: Math.max(0, ...endless.map((e) => e.bestStreak ?? 0)),
  };
}

// Unlocks anything newly earned, saves it, and announces it (the toaster listens for the event).
export function evaluateAchievements(userId) {
  if (!userId) return [];
  const progress = getProgress(userId);
  const have = progress.achievements ?? {};
  const ctx = buildContext(userId);
  const fresh = ACHIEVEMENTS.filter((a) => !have[a.id] && a.check(ctx));
  if (fresh.length === 0) return [];

  const now = new Date().toISOString();
  setProgress(userId, {
    ...progress,
    achievements: { ...have, ...Object.fromEntries(fresh.map((a) => [a.id, now])) },
  });
  fresh.forEach((a, i) =>
    setTimeout(() => window.dispatchEvent(new CustomEvent("fluidia-achievement", { detail: { id: a.id } })), i * 400)
  );
  return fresh;
}

const updateStats = (userId, change) => {
  const progress = getProgress(userId);
  setProgress(userId, { ...progress, stats: change(progress.stats ?? {}) });
};

// Call after a quest is finished. Only a quest's FIRST completion counts for "perfect" results.
export function recordQuestResult(userId, questId, firstTryRounds, totalRounds, firstCompletion) {
  if (firstCompletion) {
    const progress = getProgress(userId);
    const results = progress.questResults ?? {};
    if (!results[questId]) {
      setProgress(userId, {
        ...progress,
        questResults: {
          ...results,
          [questId]: { perfect: firstTryRounds === totalRounds, firstTry: firstTryRounds, total: totalRounds },
        },
      });
    }
  }
  return evaluateAchievements(userId);
}

export function recordLookChange(userId) {
  updateStats(userId, (s) => ({ ...s, looksChanged: (s.looksChanged ?? 0) + 1 }));
  return evaluateAchievements(userId);
}

export function recordSandbox(userId, lessonId) {
  const progress = getProgress(userId);
  const seen = progress.stats?.sandboxes ?? [];
  if (!seen.includes(lessonId)) {
    updateStats(userId, (s) => ({ ...s, sandboxes: [...seen, lessonId] }));
  }
  return evaluateAchievements(userId);
}

// run = { correct, level, bestStreak, score, perfectLevel (level reached before losing any life) }
export function recordEndlessRun(userId, questId, run) {
  const progress = getProgress(userId);
  const all = progress.endless ?? {};
  const old = all[questId] ?? { best: 0, bestLevel: 0, bestStreak: 0, runs: 0, correct: 0 };
  const stats = progress.stats ?? {};

  setProgress(userId, {
    ...progress,
    endless: {
      ...all,
      [questId]: {
        best: Math.max(old.best, run.score),
        bestLevel: Math.max(old.bestLevel, run.level),
        bestStreak: Math.max(old.bestStreak, run.bestStreak),
        runs: old.runs + 1,
        correct: old.correct + run.correct,
      },
    },
    stats: {
      ...stats,
      bestRunScore: Math.max(stats.bestRunScore ?? 0, run.score),
      perfectRunLevel: Math.max(stats.perfectRunLevel ?? 0, run.perfectLevel ?? 0),
    },
  });
  return evaluateAchievements(userId);
}

// score = number correct. Keeps the best score and the number of attempts per quiz.
export function recordQuizResult(userId, quizId, score, total) {
  const progress = getProgress(userId);
  const all = progress.quizzes ?? {};
  const old = all[quizId] ?? { best: 0, attempts: 0 };
  setProgress(userId, {
    ...progress,
    quizzes: { ...all, [quizId]: { best: Math.max(old.best, score), attempts: old.attempts + 1, total } },
  });
  return evaluateAchievements(userId);
}
