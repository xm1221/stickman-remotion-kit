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

// ======================================================= 2.0 additions
const CJK = '"Noto Sans CJK SC","PingFang SC","Microsoft YaHei",sans-serif';

/** sparks burst (frame-driven, deterministic) */
export const Sparks: React.FC<{ x: number; y: number; frame: number; n?: number; size?: number; seed?: string }> = ({
  x,
  y,
  frame,
  n = 10,
  size = 40,
  seed = "sp",
}) => {
  const ph = Math.floor(frame / 3);
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }).map((_, i) => {
        const a = -Math.PI / 2 + (R(`${seed}a${i}-${ph}`) - 0.5) * Math.PI * 1.6;
        const r0 = size * 0.25 + R(`${seed}r${i}-${ph}`) * size * 0.3;
        const r1 = r0 + size * (0.35 + R(`${seed}l${i}-${ph}`) * 0.6);
        const col = i % 3 === 0 ? "#ffd43b" : i % 3 === 1 ? "#ff922b" : "#e03131";
        return (
          <line
            key={i}
            x1={Math.cos(a) * r0}
            y1={Math.sin(a) * r0}
            x2={Math.cos(a) * r1}
            y2={Math.sin(a) * r1}
            stroke={col}
            strokeWidth={size * 0.07 + 1}
            strokeLinecap="round"
          />
        );
      })}
      <Star x={0} y={-size * 0.15} size={size * 0.22} color="#ffd43b" rot={frame * 20} />
    </g>
  );
};

/** giant red ❌ */
export const RedX: React.FC<{ x: number; y: number; size?: number; rot?: number; opacity?: number }> = ({
  x,
  y,
  size = 120,
  rot = 0,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
    {[
      [-1, -1, 1, 1],
      [1, -1, -1, 1],
    ].map(([a, b, c, d], i) => (
      <g key={i}>
        <line x1={a * size} y1={b * size} x2={c * size} y2={d * size} stroke="#111" strokeWidth={size * 0.32} strokeLinecap="round" />
        <line x1={a * size} y1={b * size} x2={c * size} y2={d * size} stroke="#e03131" strokeWidth={size * 0.24} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

/** I-beam text cursor as a physical prop in the mind theater */
export const MindCursor: React.FC<{ x: number; y: number; h?: number; rot?: number; blink?: boolean }> = ({
  x,
  y,
  h = 120,
  rot = 0,
  blink = true,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={blink ? 1 : 0.35}>
    <line x1={0} y1={-h} x2={0} y2={0} stroke="#111" strokeWidth={12} strokeLinecap="round" />
    <line x1={-20} y1={-h} x2={20} y2={-h} stroke="#111" strokeWidth={10} strokeLinecap="round" />
    <line x1={-20} y1={0} x2={20} y2={0} stroke="#111" strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** floating sentence plaque (mirror of what is typed), can shatter */
export const Plaque: React.FC<{ x: number; y: number; text: string; t?: number; w?: number; color?: string }> = ({
  x,
  y,
  text,
  t = -1,
  w = 440,
  color = "#111",
}) => {
  const h = 62;
  if (t < 0)
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill="#fff" stroke={color} strokeWidth={4} />
        <text x={-w / 2 + 18} y={9} fontSize={24} fontWeight={700} fontFamily={CJK} fill={color}>
          {text}
        </text>
      </g>
    );
  if (t > 40) return null;
  const n = 6;
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - t / 40}>
      {Array.from({ length: n }).map((_, i) => {
        const pw = w / n;
        const px = -w / 2 + i * pw;
        const vx = (i - n / 2 + 0.5) * 5 + (R(`pq${i}`) - 0.5) * 4;
        const vy = -6 - R(`pqv${i}`) * 6;
        const dx = vx * t;
        const dy = vy * t + 0.6 * t * t;
        return (
          <g key={i} transform={`translate(${dx} ${dy}) rotate(${(R(`pqr${i}`) - 0.5) * 30 * t * 0.2} ${px + pw / 2} 0)`}>
            <rect x={px} y={-h / 2} width={pw - 4} height={h} fill="#fff" stroke={color} strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

/** stack of papers ("文献砖头") */
export const PaperBrick: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-34 + (i % 2) * 3} y={-8 - i * 7} width={68} height={8} fill="#fff" stroke="#e03131" strokeWidth={2.5} />
    ))}
    <text x={0} y={-48} textAnchor="middle" fontSize={15} fontWeight={900} fontFamily={CJK} fill="#e03131">
      20篇文献
    </text>
  </g>
);

/** Backspace keycap (local origin = centre) */
export const Keycap: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; s?: number; glow?: number }> = ({
  x,
  y,
  w = 74,
  h = 28,
  rot = 0,
  s = 1,
  glow = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow > 0 && <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} rx={10} fill="#ff6b6b" opacity={glow * 0.6} />}
    <rect x={-w / 2} y={-h / 2 + 4} width={w} height={h} rx={5} fill="#adb5bd" stroke="#111" strokeWidth={2.5} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill="#fff" stroke="#111" strokeWidth={2.5} />
    <text x={0} y={h * 0.18} textAnchor="middle" fontSize={h * 0.46} fontWeight={800} fontFamily={CJK} fill="#111">
      ← Backspace
    </text>
  </g>
);

/** 完美高墙: bricks build up (built = number of bricks), collapse after impact (t frames) */
export const StandardWall: React.FC<{
  x: number;
  ground: number;
  built: number;
  t?: number;
  label?: number;
  cols?: number;
  rows?: number;
}> = ({ x, ground, built, t = -1, label = 0, cols = 6, rows = 6 }) => {
  const bw = 62;
  const bh = 34;
  const left = x - (cols * bw) / 2;
  const bricks: React.ReactNode[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? bw / 2 : 0;
    const n = r % 2 ? cols - 1 : cols;
    for (let c = 0; c < n; c++) {
      if (idx >= built) break;
      const bx = left + off + c * bw + bw / 2;
      const by = ground - bh / 2 - r * bh;
      let dx = 0;
      let dy = 0;
      let rot = 0;
      if (t >= 0) {
        const tt = Math.max(0, t - R(`wd${idx}`) * 6);
        const vx = 3 + R(`wvx${idx}`) * 9 + r * 0.8;
        const vy = -3 - R(`wvy${idx}`) * 7;
        const rest = ground - bh / 2 - R(`wr${idx}`) * 26;
        const tl = (-vy + Math.sqrt(vy * vy + 2 * 1.1 * Math.max(0, rest - by))) / 1.1;
        const tc = Math.min(tt, tl);
        dx = vx * tc;
        dy = vy * tc + 0.55 * tc * tc;
        if (by + dy > rest) dy = rest - by;
        rot = (R(`wrot${idx}`) - 0.5) * 16 * tc;
      }
      bricks.push(
        <g key={idx} transform={`translate(${bx + dx} ${by + dy}) rotate(${rot})`}>
          <rect x={-bw / 2 + 1} y={-bh / 2 + 1} width={bw - 2} height={bh - 2} rx={3} fill="#ffe3e3" stroke="#e03131" strokeWidth={3} />
        </g>,
      );
      idx++;
    }
  }
  const topY = ground - rows * bh;
  const signFall = t >= 0 ? Math.min(t, 26) : 0;
  return (
    <g>
      {bricks}
      {label > 0 && (
        <g
          opacity={label}
          transform={`translate(${x + Math.min(signFall * 4, 60)} ${topY + 58 + Math.min(signFall * signFall * 0.4, ground - 30 - topY - 58)}) rotate(${Math.min(signFall * 1.2, 10)})`}
        >
          <rect x={-170} y={-28} width={340} height={56} rx={6} fill="#fff" stroke="#e03131" strokeWidth={4} />
          <text x={0} y={12} textAnchor="middle" fontSize={32} fontWeight={900} fontFamily={CJK} fill="#e03131">
            惊世神作才准动笔
          </text>
        </g>
      )}
    </g>
  );
};

/** 黑色铁球 = 粗糙的初稿 */
export const IronBall: React.FC<{ x: number; y: number; r?: number; rot?: number; speed?: number }> = ({
  x,
  y,
  r = 78,
  rot = 0,
  speed = 0,
}) => (
  <g transform={`translate(${x} ${y})`}>
    {speed > 0 &&
      [-0.5, 0, 0.5].map((k, i) => (
        <line key={i} x1={-r - 20} y1={k * r} x2={-r - 20 - speed * 14} y2={k * r} stroke="#495057" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      ))}
    <circle r={r} fill="#111" />
    <path d={`M${-r * 0.55} ${-r * 0.35} q${r * 0.25} ${-r * 0.4} ${r * 0.62} ${-r * 0.36}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55} />
    <g transform={`rotate(${rot})`} fontFamily={CJK} fill="#fff" fontWeight={900} textAnchor="middle">
      <text y={-8} fontSize={r * 0.26}>
        第一段：
      </text>
      <text y={r * 0.3} fontSize={r * 0.22}>
        为什么我们总在空想？
      </text>
    </g>
  </g>
);

/** 完美橡皮擦, shatters when t >= 0 */
export const Eraser: React.FC<{ x: number; y: number; rot?: number; t?: number; s?: number }> = ({ x, y, rot = 0, t = -1, s = 1 }) => {
  const w = 130;
  const h = 58;
  if (t < 0)
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#fff" stroke="#e03131" strokeWidth={4} />
        <rect x={-w / 2 + 34} y={-h / 2} width={48} height={h} fill="#ffc9c9" stroke="#e03131" strokeWidth={3} />
        <text x={0} y={-h / 2 - 10} textAnchor="middle" fontSize={20} fontWeight={900} fontFamily={CJK} fill="#e03131">
          完美橡皮擦
        </text>
      </g>
    );
  if (t > 45) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - t / 45}>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + R(`er${i}`);
        const v = 6 + R(`erv${i}`) * 6;
        return (
          <polygon
            key={i}
            points="-12,-10 14,-6 8,12 -10,8"
            fill={i % 2 ? "#ffc9c9" : "#fff"}
            stroke="#e03131"
            strokeWidth={3}
            transform={`translate(${Math.cos(a) * v * t} ${Math.sin(a) * v * t + 0.4 * t * t}) rotate(${t * 18 * (i % 2 ? 1 : -1)})`}
          />
        );
      })}
    </g>
  );
};

export const Zzz: React.FC<{ x: number; y: number; frame: number; color?: string }> = ({ x, y, frame, color = "#1c7ed6" }) => (
  <g fontFamily={CJK} fontWeight={900} fill={color}>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 20) % 60) / 60;
      return (
        <text key={i} x={x + t * 40 + i * 8} y={y - t * 70} fontSize={18 + i * 8} opacity={1 - t}>
          Z
        </text>
      );
    })}
  </g>
);

/** word brick for the Act4 assembly line */
export const WordBrick: React.FC<{ x: number; y: number; label: string; painted?: number; rot?: number }> = ({
  x,
  y,
  label,
  painted = 0,
  rot = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-46} y={-17} width={92} height={34} rx={4} fill="#f1f3f5" stroke="#495057" strokeWidth={3} />
    {painted > 0 && (
      <rect x={-46} y={-17} width={92 * painted} height={34} rx={4} fill="#d3f9d8" stroke="#2f9e44" strokeWidth={3} />
    )}
    <text x={0} y={7} textAnchor="middle" fontSize={17} fontWeight={800} fontFamily={CJK} fill={painted >= 1 ? "#2b8a3e" : "#495057"}>
      {label}
    </text>
  </g>
);

/** 内耗计分板 (HTML, panel-space) */
export const Scoreboard: React.FC<{ x: number; y: number; frame: number; start: number; end: number; keys: number; burn: number; words: number }> = ({
  x,
  y,
  frame,
  start,
  end,
  keys,
  burn,
  words,
}) => {
  if (frame < start || frame > end) return null;
  const t = frame - start;
  const s = t < 10 ? 0.5 + (t / 10) * 0.6 : 1.1 - Math.min(0.1, (t - 10) * 0.02);
  const o = Math.min(1, (end - frame) / 8);
  const row = (k: string, v: string, col: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 24, fontSize: 26, lineHeight: "40px" }}>
      <span style={{ color: "#495057" }}>{k}</span>
      <span style={{ fontFamily: '"Noto Sans Mono CJK SC",monospace', fontWeight: 900, color: col }}>{v}</span>
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 440,
        transform: `scale(${s})`,
        transformOrigin: "100% 100%",
        opacity: o,
        background: "#fff",
        border: "5px solid #111",
        borderRadius: 14,
        padding: "10px 20px 12px",
        fontFamily: CJK,
        boxShadow: "6px 7px 0 rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 900, color: "#e03131", borderBottom: "3px solid #111", marginBottom: 6, paddingBottom: 4 }}>
        ▣ 内耗计分板
      </div>
      {row("累计敲击键盘", `${keys} 次`, "#111")}
      {row("消耗脑细胞/精力", `${burn}%`, "#f08c00")}
      {row("当前文档剩余字数", `${words} 字`, "#e03131")}
    </div>
  );
};
