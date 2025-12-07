/**
 * Local storage for Sheep-a-Sheep clone.
 * Stores best moves (lower is better), total clears, attempts, and last play timestamp.
 */

export type SheepStats = {
  bestMoves: number;
  totalClears: number;
  attempts: number;
  lastPlay: string | null;
};

const STORAGE_KEY = "sheep-stats";

const defaults: SheepStats = {
  bestMoves: Infinity,
  totalClears: 0,
  attempts: 0,
  lastPlay: null,
};

export function loadSheepStats(): SheepStats {
  if (typeof localStorage === "undefined") return defaults;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw);
    return {
      bestMoves: Number.isFinite(parsed.bestMoves) ? parsed.bestMoves : defaults.bestMoves,
      totalClears: Number(parsed.totalClears) || 0,
      attempts: Number(parsed.attempts) || 0,
      lastPlay: typeof parsed.lastPlay === "string" ? parsed.lastPlay : null,
    };
  } catch {
    return defaults;
  }
}

export function saveSheepStats(next: SheepStats) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function recordSheepResult(moves: number, clearedTriples: number): SheepStats {
  const current = loadSheepStats();
  const bestMoves = moves === 0 ? current.bestMoves : Math.min(current.bestMoves, moves);
  const updated: SheepStats = {
    bestMoves,
    totalClears: current.totalClears + clearedTriples,
    attempts: current.attempts + 1,
    lastPlay: new Date().toISOString(),
  };
  saveSheepStats(updated);
  return updated;
}
