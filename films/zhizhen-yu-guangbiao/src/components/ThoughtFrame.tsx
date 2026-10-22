import React from "react";

/** Dashed cloud-ish frame for the mind theater, with trail bubbles toward hero head */
export const ThoughtFrame: React.FC<{ grow: number; frame: number; headX: number; headY: number }> = ({
  grow,
  frame,
  headX,
  headY,
}) => {
  if (grow <= 0) return null;
  const cx = 960;
  const cy = 270;
  const wob = Math.sin(frame / 20) * 3;
  const trail = [
    { t: 0.18, r: 10 },
    { t: 0.42, r: 16 },
    { t: 0.68, r: 24 },
  ];
  const tx = 760;
  const ty = 520;
  return (
    <g>
      {trail.map((b, i) => {
        const k = Math.min(1, Math.max(0, grow * 3 - i * 0.6));
        const x = headX + (tx - headX) * b.t;
        const y = headY - 60 + (ty - (headY - 60)) * b.t;
        return <circle key={i} cx={x} cy={y} r={b.r * k} fill="#fff" stroke="#111" strokeWidth={3} strokeDasharray="6 5" />;
      })}
      <g transform={`translate(${cx} ${cy}) scale(${grow}) translate(${-cx} ${-cy})`} opacity={Math.min(1, grow * 1.5)}>
        <rect
          x={300}
          y={24 + wob}
          width={1320}
          height={496}
          rx={110}
          fill="rgba(248,249,250,0.85)"
          stroke="#111"
          strokeWidth={4}
          strokeDasharray="18 12"
          strokeDashoffset={-frame * 0.6}
        />
        <text x={340} y={72 + wob} fontSize={22} fill="#adb5bd" fontFamily='"Noto Sans CJK SC",sans-serif'>
          思维剧场
        </text>
        <line x1={360} y1={436} x2={1560} y2={436} stroke="#ced4da" strokeWidth={3} />
      </g>
    </g>
  );
};
