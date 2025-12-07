/**
 * Lightweight sound effects using Web Audio (no external assets).
 * Provides click, eliminate, win, and fail tones with short envelopes.
 */

import { useMemo } from "react";

type SoundKey = "click" | "eliminate" | "win" | "fail";

type SoundPlayer = {
  play: (key: SoundKey) => void;
};

export function useSoundEffects(): SoundPlayer {
  const ctx = useMemo(() => {
    if (typeof window === "undefined") return null;
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    return AudioCtx ? new AudioCtx() : null;
  }, []);

  const playTone = (frequency: number, duration = 0.12, volume = 0.15) => {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const play = (key: SoundKey) => {
    switch (key) {
      case "click":
        playTone(640, 0.09, 0.12);
        break;
      case "eliminate":
        playTone(880, 0.18, 0.16);
        break;
      case "win":
        playTone(1180, 0.22, 0.18);
        break;
      case "fail":
        playTone(320, 0.25, 0.16);
        break;
      default:
        break;
    }
  };

  return { play };
}

export default useSoundEffects;
