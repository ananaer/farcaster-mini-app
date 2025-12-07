/**
 * Lightweight match-3 engine (pure functions, no deps).
 * Can be swapped with an external engine like "match-three-js" if desired.
 * Exposes helpers for generating boards, swapping, matching, clearing, and refilling.
 */

export type Tile = string | null;
export type Board = Tile[][];

export type Position = {
  row: number;
  col: number;
};

export type EngineOptions = {
  rows: number;
  cols: number;
  tileSet: string[];
  bagMultiplier?: number;
};

export type EngineState = {
  board: Board;
  bag: string[];
};

export type SwapResult = {
  board: Board;
  bag: string[];
  cleared: number;
  valid: boolean;
};

const defaultBagMultiplier = 3;

export function createEngineState(options: EngineOptions): EngineState {
  const { rows, cols, tileSet, bagMultiplier = defaultBagMultiplier } = options;
  const bag = buildTileBag(rows * cols * bagMultiplier, tileSet);
  const board = fillBoard(rows, cols, bag);
  return { board, bag };
}

export function swapAndResolve(
  board: Board,
  bag: string[],
  a: Position,
  b: Position,
  options: EngineOptions,
): SwapResult {
  if (!areAdjacent(a, b)) {
    return { board, bag, cleared: 0, valid: false };
  }

  const workingBoard = cloneBoard(board);
  swapTiles(workingBoard, a, b);

  const { board: resolvedBoard, bag: resolvedBag, cleared } = resolveBoard(workingBoard, [...bag], options);

  if (cleared === 0) {
    // Revert if no matches were made.
    return { board, bag, cleared: 0, valid: false };
  }

  return { board: resolvedBoard, bag: resolvedBag, cleared, valid: true };
}

export function hasAnyTiles(board: Board): boolean {
  return board.some((row) => row.some((cell) => cell !== null));
}

// ---------- Internals ----------

function buildTileBag(size: number, tileSet: string[]): string[] {
  const bag: string[] = [];
  for (let i = 0; i < size; i += 1) {
    const tile = tileSet[i % tileSet.length];
    bag.push(tile);
  }
  shuffle(bag);
  return bag;
}

function fillBoard(rows: number, cols: number, bag: string[]): Board {
  const board: Board = [];
  for (let r = 0; r < rows; r += 1) {
    const row: Tile[] = [];
    for (let c = 0; c < cols; c += 1) {
      row.push(drawTile(bag));
    }
    board.push(row);
  }
  return board;
}

function resolveBoard(board: Board, bag: string[], options: EngineOptions) {
  let totalCleared = 0;
  let workingBoard = board;
  let workingBag = bag;

  while (true) {
    const matches = findMatches(workingBoard);
    if (matches.length === 0) break;

    totalCleared += matches.length;
    workingBoard = clearMatches(workingBoard, matches);
    const result = collapseBoard(workingBoard, workingBag, options);
    workingBoard = result.board;
    workingBag = result.bag;
  }

  return { board: workingBoard, bag: workingBag, cleared: totalCleared };
}

function findMatches(board: Board): Position[] {
  const matches: Position[] = [];
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  // Horizontal
  for (let r = 0; r < rows; r += 1) {
    let run: Position[] = [];
    for (let c = 0; c < cols; c += 1) {
      const current = board[r][c];
      const prev = c > 0 ? board[r][c - 1] : null;
      if (current && current === prev) {
        run.push({ row: r, col: c });
        if (run.length === 1) {
          run.unshift({ row: r, col: c - 1 });
        }
      } else {
        if (run.length >= 3) {
          matches.push(...run);
        }
        run = [];
      }
    }
    if (run.length >= 3) {
      matches.push(...run);
    }
  }

  // Vertical
  for (let c = 0; c < cols; c += 1) {
    let run: Position[] = [];
    for (let r = 0; r < rows; r += 1) {
      const current = board[r][c];
      const prev = r > 0 ? board[r - 1][c] : null;
      if (current && current === prev) {
        run.push({ row: r, col: c });
        if (run.length === 1) {
          run.unshift({ row: r - 1, col: c });
        }
      } else {
        if (run.length >= 3) {
          matches.push(...run);
        }
        run = [];
      }
    }
    if (run.length >= 3) {
      matches.push(...run);
    }
  }

  // Deduplicate
  const unique = new Map<string, Position>();
  for (const pos of matches) {
    unique.set(`${pos.row}-${pos.col}`, pos);
  }
  return Array.from(unique.values());
}

function clearMatches(board: Board, matches: Position[]): Board {
  const next = cloneBoard(board);
  for (const { row, col } of matches) {
    next[row][col] = null;
  }
  return next;
}

function collapseBoard(board: Board, bag: string[], options: EngineOptions) {
  const rows = options.rows;
  const cols = options.cols;
  const next = cloneBoard(board);
  const workingBag = [...bag];

  for (let c = 0; c < cols; c += 1) {
    const column: Tile[] = [];
    for (let r = rows - 1; r >= 0; r -= 1) {
      if (next[r][c] !== null) {
        column.push(next[r][c]);
      }
    }
    const missing = rows - column.length;
    for (let i = 0; i < missing; i += 1) {
      column.push(drawTile(workingBag));
    }
    for (let r = 0; r < rows; r += 1) {
      next[rows - 1 - r][c] = column[r] ?? null;
    }
  }

  return { board: next, bag: workingBag };
}

function areAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

function drawTile(bag: string[]): Tile {
  return bag.pop() ?? null;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function shuffle<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}
