import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../utils";

export const SpeechBubble: React.FC<{
  x: number; // tail tip
  y: number;
  start: number;
  end: number;
  text: string;
  color?: string;
  side?: "left" | "right";
  width?: number;
  fontSize?: number;
  shout?: boolean;
  dy?: number;
}> = ({ x, y, start, end, text, color = "#111", side = "right", width = 420, fontSize = 30, shout = false, dy = 26 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start || frame > end) return null;
  const pop = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 180 } });
  const out = Math.min(1, (end - frame) / 6);
  const s = pop * (0.6 + 0.4 * out);
  const shake = shout ? Math.sin(frame * 2.1) * 2 : 0;
  const left = side === "right" ? x - 40 : x - width + 40;
  return (
    <div
      style={{
        position: "absolute",
        left: left + shake,
        bottom: 1080 - y + dy,
        width,
        transform: `scale(${s})`,
        transformOrigin: side === "right" ? "40px 100%" : `${width - 40}px 100%`,
        opacity: out,
        display: "flex",
        justifyContent: side === "right" ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#fff",
          border: `4px solid ${color}`,
          borderRadius: 22,
          padding: "12px 20px",
          fontFamily: FONT,
          fontSize,
          fontWeight: shout ? 900 : 700,
          color,
          lineHeight: 1.3,
          boxShadow: "4px 5px 0 rgba(0,0,0,0.12)",
        }}
      >
        {text}
        <div
          style={{
            position: "absolute",
            bottom: -22,
            [side === "right" ? "left" : "right"]: 26,
            width: 0,
            height: 0,
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: `22px solid ${color}`,
          }}
        />
      </div>
    </div>
  );
};

/** Big comic onomatopoeia text */
export const Pop: React.FC<{ x: number; y: number; start: number; dur?: number; text: string; color?: string; size?: number; rot?: number }> = ({
  x,
  y,
  start,
  dur = 24,
  text,
  color = "#111",
  size = 54,
  rot = -8,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > dur) return null;
  const s = t < 5 ? 0.4 + (t / 5) * 0.9 : 1.3 - Math.min(0.3, (t - 5) * 0.04);
  const o = Math.min(1, (dur - t) / 6);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color,
        opacity: o,
        WebkitTextStroke: "2px #fff",
        textShadow: "3px 3px 0 rgba(0,0,0,0.15)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
