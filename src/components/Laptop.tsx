import React from "react";
import { FONT } from "../utils";

export type LaptopProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  frame: number;
  lines: string[];
  battery: number;
  progress: number;
  redFlash?: number; // 0..1
  showSubmit?: boolean;
  pressed?: boolean;
  arrow?: { x: number; y: number } | null; // relative to screen
  success?: number; // 0..1 pop scale
  markedLines?: number; // how many lines get red-pen marks
};

export const Laptop: React.FC<LaptopProps> = ({
  x,
  y,
  w,
  h,
  frame,
  lines,
  battery,
  progress,
  redFlash = 0,
  showSubmit = false,
  pressed = false,
  arrow = null,
  success = 0,
  markedLines = 0,
}) => {
  const cursorOn = Math.floor(frame / 15) % 2 === 0;
  const batCol = battery <= 12 ? "#e03131" : battery <= 30 ? "#f59f00" : "#2f9e44";
  const batBlink = battery <= 12 && Math.floor(frame / 12) % 2 === 0;
  const done = progress >= 100;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        border: "7px solid #111",
        borderRadius: 16,
        background: "#fff",
        overflow: "hidden",
        fontFamily: FONT,
        boxSizing: "border-box",
      }}
    >
      {/* title bar */}
      <div
        style={{
          height: 34,
          borderBottom: "3px solid #111",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          fontSize: 18,
          gap: 8,
          background: "#f1f3f5",
        }}
      >
        <span style={{ display: "flex", gap: 6 }}>
          {["#111", "#111", "#111"].map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 5, border: `2px solid ${c}` }} />
          ))}
        </span>
        <span style={{ fontWeight: 700, marginLeft: 6 }}>W</span>
        <span style={{ color: "#495057" }}>马原实践作业.docx</span>
        <span style={{ flex: 1 }} />
        <span style={{ display: "flex", alignItems: "center", gap: 4, opacity: batBlink ? 0.3 : 1 }}>
          <span
            style={{
              width: 34,
              height: 16,
              border: "2.5px solid #111",
              borderRadius: 3,
              position: "relative",
              display: "inline-block",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 1,
                top: 1,
                bottom: 1,
                width: `${Math.max(6, battery)}%`,
                background: batCol,
              }}
            />
          </span>
          <span style={{ color: batCol, fontWeight: 700 }}>{battery}%</span>
        </span>
      </div>
      {/* page */}
      <div style={{ padding: "10px 36px", position: "relative", height: h - 34 - 34 - 14 }}>
        <div style={{ textAlign: "center", fontSize: 34, fontWeight: 900, marginBottom: 8 }}>《马原实践作业》</div>
        {lines.length === 0 ? (
          <div style={{ fontSize: 26, height: 36 }}>
            <span style={{ opacity: cursorOn ? 1 : 0, fontWeight: 300 }}>|</span>
          </div>
        ) : (
          lines.map((l, i) => (
            <div key={i} style={{ fontSize: 28, lineHeight: "40px", whiteSpace: "pre", position: "relative" }}>
              {l}
              {i === lines.length - 1 && <span style={{ opacity: cursorOn ? 1 : 0, fontWeight: 300 }}>|</span>}
              {i < markedLines && (
                <span style={{ color: "#e03131", fontWeight: 900, marginLeft: 10 }}>✓</span>
              )}
            </div>
          ))
        )}
        {showSubmit && (
          <div
            style={{
              position: "absolute",
              right: 28,
              bottom: 2,
              border: "3px solid #111",
              borderRadius: 10,
              padding: "4px 16px",
              fontSize: 22,
              fontWeight: 800,
              background: pressed ? "#111" : "#fff",
              color: pressed ? "#fff" : "#111",
              transform: pressed ? "scale(0.94)" : undefined,
            }}
          >
            【确认提交】
          </div>
        )}
      </div>
      {/* status bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 34,
          borderTop: "3px solid #111",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          fontSize: 18,
          gap: 22,
          background: "#f1f3f5",
        }}
      >
        <span>字数 {lines.join("").length}</span>
        <span style={{ color: done ? "#2f9e44" : "#111", fontWeight: done ? 900 : 400 }}>
          {done ? "100% 完成" : `完成度 ${progress}%`}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ width: 160, height: 10, border: "2px solid #111", borderRadius: 5, overflow: "hidden" }}>
          <span style={{ display: "block", width: `${progress}%`, height: "100%", background: done ? "#2f9e44" : "#111" }} />
        </span>
      </div>
      {/* red alert tint */}
      {redFlash > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "#e03131", opacity: redFlash * 0.55 }} />
      )}
      {/* mouse arrow */}
      {arrow && (
        <svg style={{ position: "absolute", left: arrow.x, top: arrow.y }} width={30} height={40} viewBox="0 0 30 40">
          <path d="M2 2 L2 32 L10 25 L16 38 L21 36 L15 23 L26 23 Z" fill="#fff" stroke="#111" strokeWidth={3} strokeLinejoin="round" />
        </svg>
      )}
      {/* success */}
      {success > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: `rgba(255,255,255,${Math.min(0.9, success)})`,
          }}
        >
          <div style={{ transform: `scale(${success})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width={150} height={150} viewBox="0 0 150 150">
              <circle cx={75} cy={75} r={66} fill="#2f9e44" />
              <path d="M40 78 L66 104 L112 52" stroke="#fff" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#2f9e44" }}>【提交成功】</div>
          </div>
        </div>
      )}
    </div>
  );
};
