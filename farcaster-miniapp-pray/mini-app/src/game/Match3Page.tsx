/**
 * Match-3 / 三消 页面。
 * 运行方式：在 App 中引入 <Match3Page /> 即可；项目仍用 Vite 启动 `npm run dev`。
 * 假设环境已有 React + Mini-App SDK；无额外依赖。
 *
 * 控制：
 * - 点击两次相邻方块完成交换；无消除则算失误。
 * - 失误上限 (maxInvalidMoves) / 步数上限 (maxMoves) 触发失败。
 * - 胜利条件：牌袋耗尽且棋盘为空。
 * 数据：
 * - 本地存档键：localStorage "match3-stats"
 */

import { useEffect, useMemo, useState } from "react";

import { Match3Board } from "./Match3Board";
import { Match3Overlay } from "./Match3Overlay";
import { createEngineState, hasAnyTiles, swapAndResolve, type EngineOptions, type Position } from "./engine";
import { loadStats, recordGame, type GameStats } from "./storage";

const tileSet = ["🍎", "🍋", "🍇", "🍒", "🥝", "🍊"];

const engineOptions: EngineOptions = {
  rows: 6,
  cols: 6,
  tileSet,
  bagMultiplier: 3,
};

const maxInvalidMoves = 8;
const maxMoves = 40;

type Status = "playing" | "win" | "lose";

export function Match3Page() {
  const [engineState, setEngineState] = useState(() => createEngineState(engineOptions));
  const [selected, setSelected] = useState<Position | null>(null);
  const [status, setStatus] = useState<Status>("playing");
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [invalidMoves, setInvalidMoves] = useState(0);
  const [clearedTiles, setClearedTiles] = useState(0);
  const [stats, setStats] = useState<GameStats>(() => loadStats());

  useEffect(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    if (status === "playing") return;
    setStats(recordGame(score, clearedTiles));
  }, [status, score, clearedTiles]);

  const statsSummary = useMemo(() => {
    const last = stats.lastPlay ? new Date(stats.lastPlay).toLocaleString() : "无记录";
    return `最佳分数: ${stats.bestScore} | 总消除: ${stats.totalCleared} | 尝试: ${stats.attempts} | 上次: ${last}`;
  }, [stats]);

  const resetGame = () => {
    setEngineState(createEngineState(engineOptions));
    setSelected(null);
    setStatus("playing");
    setScore(0);
    setMoves(0);
    setInvalidMoves(0);
    setClearedTiles(0);
  };

  const handleSelect = (pos: Position) => {
    if (status !== "playing") return;

    if (!selected) {
      setSelected(pos);
      return;
    }

    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null);
      return;
    }

    const result = swapAndResolve(engineState.board, engineState.bag, selected, pos, engineOptions);
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    setSelected(null);

    if (!result.valid) {
      const nextInvalid = invalidMoves + 1;
      setInvalidMoves(nextInvalid);
      if (nextInvalid >= maxInvalidMoves || nextMoves >= maxMoves) {
        setStatus("lose");
      }
      return;
    }

    const nextScore = score + result.cleared * 10;
    const totalCleared = clearedTiles + result.cleared;
    setScore(nextScore);
    setClearedTiles(totalCleared);
    setEngineState({ board: result.board, bag: result.bag });

    const boardEmpty = !hasAnyTiles(result.board);
    const bagEmpty = result.bag.length === 0;
    if (boardEmpty && bagEmpty) {
      setStatus("win");
      return;
    }
    if (nextMoves >= maxMoves) {
      setStatus("lose");
    }
  };

  const headerText =
    status === "playing"
      ? "交换相邻方块完成三消。无消除算一次失误。"
      : status === "win"
        ? "恭喜通关！再来一局？"
        : "超过失误/步数限制，再试一次吧。";

  return (
    <section className="page">
      <div className="page-header">
        <h2>三消小游戏（羊了个羊风格）</h2>
        <p className="muted">{headerText}</p>
      </div>

      <Match3Overlay
        status={status}
        score={score}
        moves={moves}
        invalidMoves={invalidMoves}
        maxInvalid={maxInvalidMoves}
        onRestart={resetGame}
        onNewGame={resetGame}
        statsSummary={statsSummary}
      />

      <Match3Board board={engineState.board} selected={selected} onSelect={handleSelect} disabled={status !== "playing"} />
    </section>
  );
}

export default Match3Page;
