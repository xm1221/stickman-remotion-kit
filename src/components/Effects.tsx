import React from "react";
import { random } from "remotion";

const R = (seed: string) => random(seed);

export const DizzySpiral: React.FC<{ x: number; y: number; frame: number; opacity?: number; color?: string }> = ({
  x,
  y,
  frame,
  opacity = 1,
  color = "#868e96",
}) => {
  let d = "M0 0";
  for (let i = 1; i < 60; i++) {
    const a = i * 0.45;
    const r = i * 0.75;
    d += ` L${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r * 0.45).toFixed(1)}`;
  }
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <g transform={`rotate(${frame * 9})`}>
        <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

export const CirclingStars: React.FC<{ x: number; y: number; frame: number; r?: number; color?: string }> = ({
  x,
  y,
  frame,
  r = 36,
  color = "#f59f00",
}) => (
  <g>
    {[0, 1, 2].map((i) => {
      const a = frame * 0.15 + (i * Math.PI * 2) / 3;
      return (
        <Star key={i} x={x + Math.cos(a) * r} y={y + Math.sin(a) * r * 0.35} size={10} color={color} rot={frame * 6} />
      );
    })}
  </g>
);

export const Star: React.FC<{ x: number; y: number; size: number; color?: string; rot?: number }> = ({
  x,
  y,
  size,
  color = "#f59f00",
  rot = 0,
}) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? size : size * 0.45;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return (
    <polygon
      points={pts.join(" ")}
      fill={color}
      stroke="#111"
      strokeWidth={1.5}
      transform={`translate(${x} ${y}) rotate(${rot})`}
    />
  );
};

export const ImpactBurst: React.FC<{ x: number; y: number; t: number; size?: number }> = ({ x, y, t, size = 50 }) => {
  if (t < 0 || t > 14) return null;
  const s = size * (0.5 + t / 10);
  const o = 1 - t / 14;
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={Math.cos(a) * s * 0.4}
            y1={Math.sin(a) * s * 0.4}
            x2={Math.cos(a) * s}
            y2={Math.sin(a) * s}
            stroke="#111"
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
      <Star x={0} y={0} size={s * 0.35} color="#ffd43b" rot={t * 10} />
    </g>
  );
};

export const SmokePuff: React.FC<{ x: number; y: number; t: number; seed: string; dark?: boolean }> = ({
  x,
  y,
  t,
  seed,
  dark = true,
}) => {
  if (t < 0 || t > 45) return null;
  const rise = t * 1.6;
  const s = 14 + t * 0.9;
  const o = 0.75 * (1 - t / 45);
  const dx = (R(seed) - 0.5) * 40;
  return (
    <g opacity={o}>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={x + dx * (t / 45) + (i - 1) * s * 0.8}
          cy={y - rise - (i === 1 ? s * 0.4 : 0)}
          r={s * (i === 1 ? 1 : 0.75)}
          fill={dark ? "#343a40" : "#ced4da"}
        />
      ))}
    </g>
  );
};

/** Cartoon fight cloud with red & blue limbs poking out */
export const BrawlCloud: React.FC<{ x: number; y: number; frame: number; scale?: number; opacity?: number }> = ({
  x,
  y,
  frame,
  scale = 1,
  opacity = 1,
}) => {
  const puffs = 11;
  const limbs = Array.from({ length: 8 }).map((_, i) => {
    const phase = Math.floor((frame + i * 7) / 9);
    const a = R(`limb-a-${i}-${phase}`) * Math.PI * 2;
    const len = 50 + R(`limb-l-${i}-${phase}`) * 50;
    const col = i % 2 === 0 ? "#e03131" : "#1c7ed6";
    const r0 = 95;
    const x1 = Math.cos(a) * r0;
    const y1 = Math.sin(a) * r0 * 0.75;
    const ex = Math.cos(a) * (r0 + len);
    const ey = Math.sin(a) * (r0 + len) * 0.75;
    const isFoot = i % 3 === 0;
    return (
      <g key={i}>
        <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={col} strokeWidth={6} strokeLinecap="round" />
        {isFoot ? (
          <line x1={ex} y1={ey} x2={ex + Math.cos(a + 1.4) * 16} y2={ey + Math.sin(a + 1.4) * 16} stroke={col} strokeWidth={6} strokeLinecap="round" />
        ) : (
          <circle cx={ex} cy={ey} r={7} fill={col} />
        )}
      </g>
    );
  });
  const jx = Math.sin(frame * 1.9) * 6;
  const jy = Math.cos(frame * 2.3) * 5;
  return (
    <g transform={`translate(${x + jx} ${y + jy}) scale(${scale})`} opacity={opacity}>
      {limbs}
      <g transform={`rotate(${frame * 4})`}>
        {Array.from({ length: puffs }).map((_, i) => {
          const a = (i / puffs) * Math.PI * 2;
          const rr = 70 + Math.sin(frame * 0.5 + i) * 10;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * rr}
              cy={Math.sin(a) * rr * 0.72}
              r={52 + Math.sin(frame * 0.7 + i * 2) * 8}
              fill="#fff"
              stroke="#111"
              strokeWidth={5}
            />
          );
        })}
        <ellipse cx={0} cy={0} rx={110} ry={80} fill="#fff" />
      </g>
      {/* inner swirl lines */}
      <g transform={`rotate(${-frame * 7})`} stroke="#495057" strokeWidth={4} fill="none" strokeLinecap="round">
        <path d="M-50 -10 q30 -40 70 -10" />
        <path d="M40 25 q-30 35 -75 10" />
      </g>
      {[0, 1, 2, 3].map((i) => {
        const ph = Math.floor((frame + i * 5) / 12);
        return (
          <Star
            key={i}
            x={(R(`sx-${i}-${ph}`) - 0.5) * 200}
            y={(R(`sy-${i}-${ph}`) - 0.5) * 130}
            size={12 + R(`ss-${i}-${ph}`) * 10}
            rot={frame * 8}
          />
        );
      })}
    </g>
  );
};

export const Shockwave: React.FC<{ x: number; y: number; t: number; max?: number }> = ({ x, y, t, max = 420 }) => {
  if (t < 0 || t > 24) return null;
  const k = t / 24;
  return (
    <g opacity={1 - k}>
      <ellipse cx={x} cy={y} rx={max * k} ry={max * k * 0.25} fill="none" stroke="#111" strokeWidth={8 * (1 - k) + 2} />
      <ellipse cx={x} cy={y} rx={max * k * 0.7} ry={max * k * 0.18} fill="none" stroke="#868e96" strokeWidth={4} />
    </g>
  );
};

/** rock with text */
export const Rock: React.FC<{ x: number; y: number; label: string; rot?: number; scale?: number; mark?: number }> = ({
  x,
  y,
  label,
  rot = 0,
  scale = 1,
  mark = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path
      d="M-66 18 L-58 -22 L-30 -40 L20 -42 L56 -26 L68 6 L52 30 L-40 34 Z"
      fill="#e9ecef"
      stroke="#111"
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path d="M-40 -18 l10 6 M30 20 l12 -4" stroke="#868e96" strokeWidth={3} />
    <text x={0} y={8} textAnchor="middle" fontSize={24} fontWeight={900} fontFamily='"Noto Sans CJK SC",sans-serif' fill="#111">
      {label}
    </text>
    {mark > 0 && (
      <path
        d="M30 -52 l12 14 l24 -30"
        stroke="#e03131"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={80}
        strokeDashoffset={80 * (1 - mark)}
      />
    )}
  </g>
);

export const Meteor: React.FC<{ x: number; y: number; angle: number; label: string; t: number }> = ({ x, y, angle, label, t }) => (
  <g>
    {[1, 2, 3].map((i) => (
      <line
        key={i}
        x1={x - Math.cos(angle) * 70 + (i - 2) * 22 * Math.sin(angle)}
        y1={y - Math.sin(angle) * 70 - (i - 2) * 22 * Math.cos(angle)}
        x2={x - Math.cos(angle) * (150 + i * 30) + (i - 2) * 22 * Math.sin(angle)}
        y2={y - Math.sin(angle) * (150 + i * 30) - (i - 2) * 22 * Math.cos(angle)}
        stroke="#f76707"
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.7}
      />
    ))}
    <Rock x={x} y={y} label={label} rot={t * 14} scale={0.9} />
  </g>
);

export const Book: React.FC<{ x: number; y: number; rot?: number; w?: number; h?: number }> = ({
  x,
  y,
  rot = 0,
  w = 140,
  h = 230,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#fff" stroke="#111" strokeWidth={6} />
    <line x1={-w / 2 + 16} y1={-h / 2} x2={-w / 2 + 16} y2={h / 2} stroke="#111" strokeWidth={4} />
    <text
      x={8}
      y={-h / 2 + 50}
      textAnchor="middle"
      fontSize={30}
      fontWeight={900}
      fontFamily='"Noto Serif CJK SC",serif'
      fill="#111"
    >
      《词典》
    </text>
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={-w / 2 + 34} x2={w / 2 - 18} y1={-h / 2 + 90 + i * 26} y2={-h / 2 + 90 + i * 26} stroke="#adb5bd" strokeWidth={3} />
    ))}
  </g>
);

export const Slime: React.FC<{ x: number; y: number; frame: number; scale?: number }> = ({ x, y, frame, scale = 1 }) => {
  const n = 14;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 60 + Math.sin(frame * 0.4 + i * 1.7) * 10 + (Math.sin(a) > 0.6 ? 14 : 0);
    pts.push(`${(Math.cos(a) * r * 1.25).toFixed(1)},${(Math.sin(a) * r * 0.8).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <polygon points={pts.join(" ")} fill="rgba(28,126,214,0.35)" stroke="#1c7ed6" strokeWidth={6} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={-40 + i * 40} cy={58 + Math.sin(frame * 0.3 + i) * 10} rx={8} ry={14} fill="rgba(28,126,214,0.5)" />
      ))}
      <circle cx={-14} cy={-10} r={5} fill="#1c7ed6" />
      <circle cx={14} cy={-10} r={5} fill="#1c7ed6" />
      <path d="M-14 12 q14 -10 28 0" stroke="#1c7ed6" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Phone: React.FC<{ x: number; y: number; rot?: number; glow?: boolean; frame?: number }> = ({
  x,
  y,
  rot = 0,
  glow = true,
  frame = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {glow && <circle r={22 + Math.sin(frame * 0.4) * 3} fill="rgba(77,171,247,0.35)" />}
    <rect x={-8} y={-14} width={16} height={28} rx={3} fill="#a5d8ff" stroke="#1c7ed6" strokeWidth={3} />
  </g>
);

export const Pillow: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path
      d="M-32 -20 Q0 -28 32 -20 Q40 0 32 20 Q0 28 -32 20 Q-40 0 -32 -20 Z"
      fill="#fff"
      stroke="#1c7ed6"
      strokeWidth={4}
    />
    <path d="M-12 -4 l8 6 M6 -6 l8 8" stroke="#74c0fc" strokeWidth={3} />
  </g>
);
