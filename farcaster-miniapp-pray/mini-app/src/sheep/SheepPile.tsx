/**
 * Layered board renderer.
 * - Tiles are absolutely positioned within each column.
 * - Selectable if no higher-layer tile overlaps the same (col,row).
 */

import { computeSelectableTiles, jitterForId, type Column, type SheepTile } from "./logic";
import { SheepTileView } from "./SheepTileView";

const ROW_SPACING = 30;
const LAYER_OFFSET_Y = 8;
const LAYER_OFFSET_X = 6;
const COLUMN_MIN_HEIGHT = 320;

type Props = {
  columns: Column[];
  onSelect: (tile: SheepTile) => void;
};

export function SheepPile({ columns, onSelect }: Props) {
  const selectable = new Set(computeSelectableTiles(columns).map((t) => t.id));

  return (
    <div className="sheep-pile">
      {columns.map((col, colIndex) => {
        const maxRow = col.reduce((max, t) => Math.max(max, t.row), 0);
        const height = Math.max(COLUMN_MIN_HEIGHT, (maxRow + 2) * ROW_SPACING);
        return (
          <div key={colIndex} className="sheep-column" style={{ minHeight: height }}>
            {col.map((tile) => {
              const isSelectable = selectable.has(tile.id);
              const jitter = jitterForId(tile.id, 3); // deterministic -3..3 px
              return (
                <div
                  key={tile.id}
                  className="sheep-tile-wrap"
                  style={{
                    position: "absolute",
                    top: tile.row * ROW_SPACING - tile.layer * LAYER_OFFSET_Y,
                    left: tile.layer * LAYER_OFFSET_X + jitter,
                    zIndex: 10 + tile.layer,
                  }}
                >
                  <SheepTileView tile={tile} selectable={isSelectable} onSelect={onSelect} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default SheepPile;
