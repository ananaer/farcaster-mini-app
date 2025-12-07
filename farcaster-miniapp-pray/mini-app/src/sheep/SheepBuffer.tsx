/**
 * Buffer slots (7 max). Shows tiles in insertion order.
 */

import type { BufferEntry } from "./logic";

type Props = {
  buffer: BufferEntry[];
  slotLimit: number;
  pulseKey?: number;
  isFailing?: boolean;
};

export function SheepBuffer({ buffer, slotLimit, pulseKey, isFailing }: Props) {
  const slots = Array.from({ length: slotLimit }, (_, idx) => buffer[idx] ?? null);
  return (
    <div className={`sheep-buffer ${isFailing ? "failShake" : ""}`} data-pulse={pulseKey}>
      {slots.map((entry, idx) => {
        const pulseClass = pulseKey ? "slot-pulse" : "";
        const key = pulseKey ? `${idx}-${pulseKey}` : `${idx}`;
        return (
          <div key={key} className={`sheep-slot ${entry ? "sheep-slot--filled" : ""} ${pulseClass}`}>
            {entry ? <span className="sheep-slot__icon">{entry.type}</span> : <span className="sheep-slot__placeholder">·</span>}
          </div>
        );
      })}
    </div>
  );
}

export default SheepBuffer;
