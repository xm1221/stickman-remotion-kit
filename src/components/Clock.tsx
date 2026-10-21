import React from "react";
import { FONT } from "../utils";

export const Clock: React.FC<{ seconds: number; x: number; y: number; alarm?: boolean; frame: number }> = ({
  seconds,
  x,
  y,
  alarm = false,
  frame,
}) => {
  const h = Math.floor(seconds / 3600) % 24;
  const m = Math.floor(seconds / 60) % 60;
  const s = seconds % 60;
  const z = (n: number) => String(n).padStart(2, "0");
  const hourA = ((h % 12) + m / 60) * 30;
  const minA = (m + s / 60) * 6;
  const secA = s * 6;
  const blink = alarm && Math.floor(frame / 8) % 2 === 0;
  const col = alarm ? "#e03131" : "#111";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 320,
        display: "flex",
        alignItems: "center",
        gap: 16,
        transform: alarm ? `rotate(${Math.sin(frame * 1.7) * 3}deg)` : undefined,
      }}
    >
      <svg width={110} height={110} viewBox="-55 -55 110 110">
        <circle r={48} fill={blink ? "#ffe3e3" : "#fff"} stroke={col} strokeWidth={5} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={-40}
            x2={0}
            y2={i % 3 === 0 ? -32 : -36}
            stroke={col}
            strokeWidth={3}
            transform={`rotate(${i * 30})`}
          />
        ))}
        <line y2={-22} stroke={col} strokeWidth={6} strokeLinecap="round" transform={`rotate(${hourA})`} />
        <line y2={-34} stroke={col} strokeWidth={4} strokeLinecap="round" transform={`rotate(${minA})`} />
        <line y2={-38} stroke="#e03131" strokeWidth={2} strokeLinecap="round" transform={`rotate(${secA})`} />
        <circle r={4} fill={col} />
      </svg>
      <div
        style={{
          fontFamily: '"Noto Sans Mono CJK SC", monospace',
          fontSize: 46,
          fontWeight: 700,
          color: col,
          border: `4px solid ${col}`,
          borderRadius: 12,
          padding: "4px 12px",
          background: blink ? "#ffe3e3" : "#fff",
          letterSpacing: 1,
        }}
      >
        {z(h)}:{z(m)}
        <span style={{ fontSize: 28 }}>:{z(s)}</span>
      </div>
      <div style={{ position: "absolute", top: 118, left: 128, fontFamily: FONT, fontSize: 20, color: "#868e96" }}>
        截止 24:00
      </div>
    </div>
  );
};
