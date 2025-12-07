/**
 * 羊了个羊（堆叠 + 7 槽三消）克隆页面。
 * 用法：在 App 中渲染 <SheepGamePage />；项目仍通过 `npm run dev` 运行。
 * 规则：
 * - 仅可点击未被覆盖的牌（同 col/row 上 layer 最大者）；点击后放入 7 槽缓冲区。
 * - 缓冲区内任意三张同类型立即消除。
 * - 缓冲区满且无可消除则失败；所有牌清空即胜利。
 * 存档：
 * - localStorage 键 "sheep-stats" 记录 bestMoves、totalClears、attempts、lastPlay。
 * UI：
 * - 分层可视化、柔和按钮组、动画（点击压缩/消除闪烁/失败抖动）、轻量音效（Web Audio）。
 */

import { useEffect, useMemo, useState } from "react";

import { SheepBuffer } from "./SheepBuffer";
import SheepOverlay from "./SheepOverlay";
import SheepPile from "./SheepPile";
import {
  generateColumns,
  isBoardEmpty,
  isBufferFail,
  resolveBuffer,
  takeTileIfSelectable,
  type BufferEntry,
  type Column,
  type GameOptions,
  type SheepTile,
} from "./logic";
import { loadSheepStats, recordSheepResult, type SheepStats } from "./storage";
import useSoundEffects from "./useSoundEffects";

const TILE_SET = ["🐑", "🐱", "🐶", "🐷", "🐔", "🐸", "🐙", "🐝", "🐠", "🌽", "🥕", "🍅", "🍆", "🥑", "🍄", "🍇"];

const GAME_OPTIONS: GameOptions = {
  columns: 9,
  minRows: 5,
  maxRows: 9,
  maxStackHeight: 3,
  tileSet: TILE_SET,
};

const SLOT_LIMIT = 7;

type Status = "playing" | "win" | "lose";

export function SheepGamePage() {
  const [seed, setSeed] = useState(() => Date.now());
  const [columns, setColumns] = useState<Column[]>(() => generateColumns({ ...GAME_OPTIONS, seed }));
  const [buffer, setBuffer] = useState<BufferEntry[]>([]);
  const [status, setStatus] = useState<Status>("playing");
  const [moves, setMoves] = useState(0);
  const [clearedTriples, setClearedTriples] = useState(0);
  const [stats, setStats] = useState<SheepStats>(() => loadSheepStats());
  const [pulseKey, setPulseKey] = useState(0);
  const sound = useSoundEffects();

  useEffect(() => {
    setStats(loadSheepStats());
  }, []);

  useEffect(() => {
    if (status === "playing") return;
    setStats(recordSheepResult(moves, clearedTriples));
  }, [status, moves, clearedTriples]);

  const statsLine = useMemo(() => {
    const best = Number.isFinite(stats.bestMoves) ? stats.bestMoves : "未记录";
    const last = stats.lastPlay ? new Date(stats.lastPlay).toLocaleString() : "无";
    return `最佳步数: ${best} | 累计组三: ${stats.totalClears} | 尝试: ${stats.attempts} | 上次: ${last}`;
  }, [stats]);

  const restart = (newSeed?: number) => {
    const nextSeed = newSeed ?? seed;
    setSeed(nextSeed);
    setColumns(generateColumns({ ...GAME_OPTIONS, seed: nextSeed }));
    setBuffer([]);
    setStatus("playing");
    setMoves(0);
    setClearedTriples(0);
  };

  const handleSelect = (tile: SheepTile) => {
    if (status !== "playing") return;
    sound.play("click");
    const taken = takeTileIfSelectable(columns, tile.id);
    if (!taken.ok) return;

    const nextBufferPre = [...buffer, taken.tile];
    const resolved = resolveBuffer(nextBufferPre);
    const nextMoves = moves + 1;

    setColumns(taken.columns);
    setBuffer(resolved.buffer);
    setMoves(nextMoves);
    if (resolved.clearedTriples > 0) {
      setClearedTriples((prev) => prev + resolved.clearedTriples);
      setPulseKey(Date.now());
      sound.play("eliminate");
    }

    const boardEmpty = isBoardEmpty(taken.columns);
    const bufferEmpty = resolved.buffer.length === 0;
    if (boardEmpty) {
      if (bufferEmpty) {
        sound.play("win");
      } else {
        sound.play("fail");
      }
      setStatus(bufferEmpty ? "win" : "lose");
      return;
    }

    if (isBufferFail(resolved.buffer, SLOT_LIMIT)) {
      sound.play("fail");
      setStatus("lose");
      return;
    }
  };

  const headerText =
    status === "playing"
      ? "点击每列顶层牌放入 7 槽，三张同样立即消除。槽满且无法消除则失败。"
      : status === "win"
        ? "全部清空，通关！再来一局？"
        : "槽满且无可消，挑战失败，再试一次吧。";

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>羊了个羊 克隆版</h2>
          <p className="muted">{headerText}</p>
        </div>
        <div className="chip">🎲 种子: {seed}</div>
      </div>

      <SheepOverlay
        status={status}
        moves={moves}
        clearedTriples={clearedTriples}
        attempts={stats.attempts}
        bestMoves={Number.isFinite(stats.bestMoves) ? stats.bestMoves : null}
        onRestart={() => restart(seed)}
        onNewGame={() => restart(Date.now())}
        onShuffle={undefined}
        onUndo={undefined}
      />

      <SheepPile columns={columns} onSelect={handleSelect} />

      <div>
        <h4 className="muted" style={{ marginBottom: 8 }}>
          缓冲区（7 槽）
        </h4>
        <SheepBuffer buffer={buffer} slotLimit={SLOT_LIMIT} pulseKey={pulseKey} isFailing={status === "lose"} />
      </div>

      <div className="match-summary">{statsLine}</div>
    </section>
  );
}

export default SheepGamePage;
