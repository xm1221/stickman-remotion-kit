import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT, ip } from "../utils";

const LINES: { t: string; size: number; gap?: number; weight?: number; color?: string }[] = [
  { t: "《指针与光标》", size: 76, weight: 900, gap: 50 },
  { t: "课程作业：马克思主义基本原理实践教学", size: 36 },
  { t: "指导教师：许老师", size: 36 },
  { t: "制作成员：小组作业", size: 36, gap: 44 },
  { t: "哲学映射：", size: 34, color: "#adb5bd" },
  { t: "· 矛盾的同一性与斗争性", size: 34, color: "#ced4da" },
  { t: "· 实践与认识的辩证运动过程", size: 34, color: "#ced4da" },
];

export const Credits: React.FC = () => {
  const f = useCurrentFrame();
  const out = ip(f, [400, 445], [1, 0]);
  // tiny cursor blinking after the title — the "光标" keeps going
  const cursorOn = Math.floor(f / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div style={{ textAlign: "center", color: "#fff", opacity: out }}>
        {LINES.map((l, i) => {
          const a = ip(f, [70 + i * 14, 100 + i * 14], [0, 1]);
          const y = ip(f, [70 + i * 14, 100 + i * 14], [16, 0]);
          return (
            <div
              key={i}
              style={{
                fontSize: l.size,
                fontWeight: l.weight ?? 500,
                color: l.color ?? "#fff",
                opacity: a,
                transform: `translateY(${y}px)`,
                marginBottom: l.gap ?? 12,
                letterSpacing: i === 0 ? 10 : 2,
              }}
            >
              {l.t}
              {i === 0 && <span style={{ opacity: cursorOn ? 1 : 0, fontWeight: 200, marginLeft: 6 }}>|</span>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
