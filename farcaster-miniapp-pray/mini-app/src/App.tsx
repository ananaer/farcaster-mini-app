"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import Match3Page from "./game/Match3Page";
import SheepGamePage from "./sheep/SheepGamePage";

const STORAGE_KEY = "mood-list";

type View = "mood" | "match3" | "sheep";

function App() {
  const [view, setView] = useState<View>("mood");
  const [mood, setMood] = useState("");
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const savedList = parsed.filter((item): item is string => typeof item === "string");
        setList(savedList);
      }
    } catch (error) {
      console.error("Failed to parse stored mood list", error);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = mood.trim();
    if (!trimmed) return;

    setList((prev) => {
      const next = [trimmed, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setMood("");
  };

  const renderMoodTracker = () => (
    <section className="page">
      <div className="page-header">
        <h2>今天心情如何？</h2>
        <p className="muted">记录一下，保持愉快心情。</p>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          value={mood}
          onChange={(event) => setMood(event.target.value)}
          placeholder="记录你的心情..."
          className="w-full rounded border px-3 py-2"
        />
        <button type="submit" className="rounded border px-4 py-2">
          提交
        </button>
      </form>
      <ul className="list-disc space-y-1 pl-5">
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );

  const renderContent =
    view === "mood" ? renderMoodTracker() : view === "match3" ? <Match3Page /> : <SheepGamePage />;

  return (
    <div className="app-shell">
      <div className="app-nav">
        <button type="button" className={`tab ${view === "mood" ? "tab--active" : ""}`} onClick={() => setView("mood")}>
          心情记录
        </button>
        <button
          type="button"
          className={`tab ${view === "match3" ? "tab--active" : ""}`}
          onClick={() => setView("match3")}
        >
          三消小游戏
        </button>
        <button
          type="button"
          className={`tab ${view === "sheep" ? "tab--active" : ""}`}
          onClick={() => setView("sheep")}
        >
          羊了个羊
        </button>
      </div>
      {renderContent}
    </div>
  );
}

export default App;
