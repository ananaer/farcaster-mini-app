/**
 * Core logic for a "Sheep a Sheep" stack + buffer game.
 * Layered model: multiple tiles can share the same (col,row) but different layer.
 * A tile is selectable only if no higher-layer tile overlaps the same (col,row).
 */

export type SheepTile = {
  id: string;
  type: string;
  col: number;
  row: number;
  layer: number;
};

export type Column = SheepTile[];

export type GameOptions = {
  columns: number;
  minRows: number;
  maxRows: number;
  maxStackHeight: number;
  tileSet: string[];
  seed?: number;
};

export type BufferEntry = SheepTile;

export type BufferResolveResult = {
  buffer: BufferEntry[];
  cleared: number;
  clearedTriples: number;
};

export function generateColumns(options: GameOptions): Column[] {
  const rng = createRng(options.seed ?? Date.now());
  const plans: number[][] = [];
  let totalTiles = 0;

  for (let col = 0; col < options.columns; col += 1) {
    const rows = randomInt(rng, options.minRows, options.maxRows);
    const heights: number[] = [];
    for (let row = 0; row < rows; row += 1) {
      const stackHeight = randomInt(rng, 1, options.maxStackHeight);
      heights.push(stackHeight);
      totalTiles += stackHeight;
    }
    plans.push(heights);
  }

  // Ensure total tiles is a multiple of 3 to keep clears possible.
  const remainder = totalTiles % 3;
  if (remainder !== 0) {
    const extra = 3 - remainder;
    totalTiles += extra;
    const last = plans[plans.length - 1] ?? [];
    if (last.length === 0) {
      last.push(extra);
    } else {
      last[last.length - 1] += extra;
    }
    plans[plans.length - 1] = last;
  }

  const pool = buildTilePool(totalTiles, options.tileSet, rng);
  const columns: Column[] = [];
  let cursor = 0;

  for (let col = 0; col < options.columns; col += 1) {
    const heights = plans[col] ?? [];
    const tiles: SheepTile[] = [];
    for (let row = 0; row < heights.length; row += 1) {
      const stackHeight = heights[row];
      for (let layer = 0; layer < stackHeight; layer += 1) {
        const type = pool[cursor % pool.length];
        tiles.push({
          id: `c${col}-r${row}-l${layer}-${cursor}`,
          type,
          col,
          row,
          layer,
        });
        cursor += 1;
      }
    }
    // Sort by layer so z-index aligns with array order
    tiles.sort((a, b) => a.layer - b.layer);
    columns.push(tiles);
  }

  return columns;
}

export function flattenColumns(columns: Column[]): SheepTile[] {
  return columns.flat();
}

export function isTileSelectable(tile: SheepTile, columns: Column[]): boolean {
  const tiles = flattenColumns(columns);
  return !tiles.some(
    (other) =>
      other.id !== tile.id &&
      other.col === tile.col &&
      other.row === tile.row &&
      other.layer > tile.layer,
  );
}

export function computeSelectableTiles(columns: Column[]): SheepTile[] {
  const tiles = flattenColumns(columns);
  return tiles.filter((tile) => isTileSelectable(tile, columns));
}

export function takeTileIfSelectable(columns: Column[], tileId: string) {
  const tiles = flattenColumns(columns);
  const target = tiles.find((t) => t.id === tileId);
  if (!target || !isTileSelectable(target, columns)) {
    return { ok: false as const };
  }

  const nextColumns = columns.map((col) => col.filter((t) => t.id !== tileId));
  return { ok: true as const, tile: target, columns: nextColumns };
}

// Deterministic jitter for visual staggering
export function jitterForId(id: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return ((hash % (range * 2 + 1)) - range) / 1;
}

export function resolveBuffer(buffer: BufferEntry[]): BufferResolveResult {
  const typeIndices: Record<string, number[]> = {};
  buffer.forEach((entry, idx) => {
    typeIndices[entry.type] = typeIndices[entry.type] ?? [];
    typeIndices[entry.type].push(idx);
  });

  const removeIndices = new Set<number>();
  Object.entries(typeIndices).forEach(([type, indices]) => {
    const tripleCount = Math.floor(indices.length / 3);
    if (tripleCount === 0) return;
    const toRemove = tripleCount * 3;
    for (let i = 0; i < toRemove; i += 1) {
      removeIndices.add(indices[i]);
    }
  });

  if (removeIndices.size === 0) {
    return { buffer, cleared: 0, clearedTriples: 0 };
  }

  const nextBuffer = buffer.filter((_, idx) => !removeIndices.has(idx));
  const cleared = removeIndices.size;
  return { buffer: nextBuffer, cleared, clearedTriples: cleared / 3 };
}

export function isBoardEmpty(columns: Column[]): boolean {
  return columns.every((col) => col.length === 0);
}

export function isBufferFail(buffer: BufferEntry[], slotLimit: number): boolean {
  return buffer.length >= slotLimit;
}

// ---------- helpers ----------

type Rng = () => number;

function createRng(seed: number): Rng {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), 1 | x);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function buildTilePool(total: number, tileSet: string[], rng: Rng): string[] {
  const pool: string[] = [];
  for (let i = 0; i < total; i += 1) {
    pool.push(tileSet[i % tileSet.length]);
  }
  shuffle(pool, rng);
  return pool;
}

function shuffle<T>(items: T[], rng: Rng): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}
