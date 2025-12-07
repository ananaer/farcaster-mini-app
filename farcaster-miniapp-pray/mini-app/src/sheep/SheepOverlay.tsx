/**
 * HUD overlay with status, score, moves, and restart controls.
 */

type Props = {
  status: "playing" | "win" | "lose";
  moves: number;
  clearedTriples: number;
  attempts: number;
  bestMoves: number | null;
  onRestart: () => void;
  onNewGame: () => void;
  onShuffle?: () => void;
  onUndo?: () => void;
};

export function SheepOverlay({ status, moves, clearedTriples, attempts, bestMoves, onRestart, onNewGame, onShuffle, onUndo }: Props) {
  return (
    <div className="sheep-overlay">
      <div className="chip-row">
        <span className="chip">🎮 状态: {status === "playing" ? "进行中" : status === "win" ? "胜利" : "失败"}</span>
        <span className="chip">⏱ 步数: {moves}</span>
        <span className="chip">📦 消除组三: {clearedTriples}</span>
        <span className="chip">🔁 尝试: {attempts}</span>
        <span className="chip">🎯 最佳步数: {bestMoves ?? "未记录"}</span>
      </div>

      <div className="match-actions match-actions--row">
        <button type="button" className="btn btn--primary" onClick={onRestart}>
          <span className="btn-icon">🔄</span> 重新本局
        </button>
        <button type="button" className="btn btn--primary" onClick={onNewGame}>
          <span className="btn-icon">⭐</span> 新局
        </button>
        <button type="button" className="btn btn--ghost" onClick={onShuffle} disabled={!onShuffle}>
          <span className="btn-icon">🔀</span> 洗牌
        </button>
        <button type="button" className="btn btn--ghost" onClick={onUndo} disabled={!onUndo}>
          <span className="btn-icon">↩️</span> 撤销
        </button>
      </div>
    </div>
  );
}

export default SheepOverlay;
