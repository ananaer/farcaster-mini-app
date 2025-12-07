/**
 * Game board UI for the Match-3 page.
 * Renders a clickable grid of tiles (emoji-based) and exposes onSelect callbacks.
 */

import type { Board, Position } from "./engine";

type Props = {
  board: Board;
  selected: Position | null;
  onSelect: (pos: Position) => void;
  disabled?: boolean;
};

const colors = ["#f87171", "#fb923c", "#facc15", "#34d399", "#60a5fa", "#a78bfa"];

export function Match3Board({ board, selected, onSelect, disabled }: Props) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  return (
    <div className="match-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {board.map((row, r) =>
        row.map((cell, c) => {
          const isSelected = selected?.row === r && selected?.col === c;
          const colorIndex = ((r * cols + c) % colors.length + colors.length) % colors.length;
          return (
            <button
              key={`${r}-${c}`}
              type="button"
              className={`match-cell${isSelected ? " match-cell--selected" : ""}`}
              style={{ backgroundColor: cell ? colors[colorIndex] : "#0f172a" }}
              disabled={disabled || cell === null}
              onClick={() => onSelect({ row: r, col: c })}
              aria-pressed={isSelected}
            >
              <span className="match-cell__emoji">{cell ?? ""}</span>
            </button>
          );
        }),
      )}
    </div>
  );
}

export default Match3Board;
