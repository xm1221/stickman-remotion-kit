import React from "react";
import { FONT } from "../utils";

export const EnergyBar: React.FC<{ value: number; x: number; y: number; frame: number }> = ({ value, x, y, frame }) => {
  const v = Math.max(0, Math.min(100, value));
  const col = v > 60 ? "#2f9e44" : v > 30 ? "#f59f00" : "#e03131";
  const low = v <= 15;
  const flash = low && Math.floor(frame / 10) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: "#111" }}>精力</div>
      <div
        style={{
          width: 200,
          height: 26,
          border: "4px solid #111",
          borderRadius: 8,
          background: flash ? "#ffe3e3" : "#fff",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ width: `${v}%`, height: "100%", background: col }} />
      </div>
      <div
        style={{
          fontFamily: '"Noto Sans Mono CJK SC", monospace',
          fontSize: 26,
          fontWeight: 700,
          color: col,
          width: 80,
        }}
      >
        {Math.round(v)}%
      </div>
    </div>
  );
};
