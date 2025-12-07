/**
 * Optional tools; currently stubbed buttons.
 */

type Props = {
  onShuffle?: () => void;
  onUndo?: () => void;
  disabled?: boolean;
};

export function SheepTools({ onShuffle, onUndo, disabled }: Props) {
  return (
    <div className="sheep-tools">
      <button type="button" className="btn btn--ghost" onClick={onShuffle} disabled={disabled || !onShuffle}>
        <span className="btn-icon">🔀</span> 洗牌
      </button>
      <button type="button" className="btn btn--ghost" onClick={onUndo} disabled={disabled || !onUndo}>
        <span className="btn-icon">↩️</span> 撤销
      </button>
    </div>
  );
}

export default SheepTools;
