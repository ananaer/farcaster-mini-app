/**
 * Local storage helpers for Match-3 mini app.
 * Stores best score, total cleared tiles, attempts, and last play timestamp.
 */

export type GameStats = {
  bestScore: number;
  totalCleared: number;
  attempts: number;
  lastPlay: string | null;
};

const STORAGE_KEY = "match3-stats";

const defaultStats: GameStats = {
  bestScore: 0,
  totalCleared: 0,
  attempts: 0,
  lastPlay: null,
};

export function loadStats(): GameStats {
  if (typeof localStorage === "undefined") return defaultStats;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStats;
  try {
    const parsed = JSON.parse(raw);
    return {
      bestScore: Number(parsed.bestScore) || 0,
      totalCleared: Number(parsed.totalCleared) || 0,
      attempts: Number(parsed.attempts) || 0,
      lastPlay: typeof parsed.lastPlay === "string" ? parsed.lastPlay : null,
    };
  } catch {
    return defaultStats;
  }
}

export function saveStats(next: GameStats) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function recordGame(score: number, cleared: number): GameStats {
  const current = loadStats();
  const updated: GameStats = {
    bestScore: Math.max(current.bestScore, score),
    totalCleared: current.totalCleared + cleared,
    attempts: current.attempts + 1,
    lastPlay: new Date().toISOString(),
  };
  saveStats(updated);
  return updated;
}
