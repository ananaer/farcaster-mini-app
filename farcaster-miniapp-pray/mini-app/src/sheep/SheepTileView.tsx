/**
 * Single tile view with simple styling and state (selectable vs hidden).
 */

import type { SheepTile } from "./logic";

type Props = {
  tile: SheepTile;
  selectable: boolean;
  onSelect: (tile: SheepTile) => void;
};

export function SheepTileView({ tile, selectable, onSelect }: Props) {
  const shadow =
    tile.layer === 0
      ? "0 4px 10px rgba(0,0,0,0.18)"
      : tile.layer === 1
        ? "0 6px 14px rgba(0,0,0,0.22)"
        : "0 10px 22px rgba(0,0,0,0.28)";

  return (
    <button
      type="button"
      className={`sheep-tile ${selectable ? "sheep-tile--selectable" : "sheep-tile--blocked"}`}
      onClick={() => selectable && onSelect(tile)}
      disabled={!selectable}
      aria-pressed={false}
      title={selectable ? "可选" : "被覆盖"}
      style={{ boxShadow: shadow }}
    >
      <span className="sheep-tile__icon">{tile.type}</span>
    </button>
  );
}

export default SheepTileView;
