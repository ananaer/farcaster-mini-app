/**
 * Overlay / HUD for Match-3.
 * Shows status, score, moves, and restart controls.
 */

type Props = {
  status: "playing" | "win" | "lose";
  score: number;
  moves: number;
  invalidMoves: number;
  maxInvalid: number;
  onRestart: () => void;
  onNewGame: () => void;
  statsSummary: string;
};

export function Match3Overlay({
  status,
  score,
  moves,
  invalidMoves,
  maxInvalid,
  onRestart,
  onNewGame,
  statsSummary,
}: Props) {
  return (
    <div className="match-overlay">
      <div className="match-badges">
        <span className="badge">分数: {score}</span>
        <span className="badge">步数: {moves}</span>
        <span className="badge">
          失误: {invalidMoves}/{maxInvalid}
        </span>
      </div>

      <div className="match-actions">
        <button type="button" className="btn" onClick={onRestart}>
          重新开始
        </button>
        <button type="button" className="btn btn--ghost" onClick={onNewGame}>
          新关卡
        </button>
      </div>

      <div className="match-status">
        {status === "playing" && "进行中"}
        {status === "win" && "你赢了！🎉"}
        {status === "lose" && "游戏结束 😢"}
      </div>
      <div className="match-summary">{statsSummary}</div>
    </div>
  );
}

export default Match3Overlay;
