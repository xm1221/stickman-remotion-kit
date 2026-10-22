import React from "react";
import { random } from "remotion";
import { W } from "../timeline";
import { FONT } from "../utils";

/** Night study room behind / around the laptop. Desk-world coords, pure SVG. */
export const RoomBack: React.FC<{ frame: number; lamp?: number }> = ({ frame, lamp = 1 }) => {
  const f = frame;
  const flick = 0.92 + 0.08 * Math.sin(f * 0.37) * Math.sin(f * 0.11);
  const curtain = Math.sin(f / 40) * 6;
  return (
    <g fontFamily={FONT}>
      {/* wall */}
      <rect x={-700} y={-600} width={3320} height={940} fill="#eef1f6" />
      {[...Array(14)].map((_, i) => (
        <line key={i} x1={-700 + i * 240} y1={-600} x2={-700 + i * 240} y2={340} stroke="#e3e8ef" strokeWidth={2} />
      ))}
      {/* top shelf + calendar (seen when hero looks up) */}
      <rect x={300} y={-250} width={520} height={14} fill="#fff" stroke="#111" strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={320 + i * 30} y={-330 + (i % 2) * 10} width={24} height={80 - (i % 2) * 10} fill={i % 3 === 0 ? "#ffe3e3" : "#fff"} stroke="#111" strokeWidth={3} />
      ))}
      <g transform="translate(1180 -330)">
        <rect x={0} y={0} width={190} height={210} rx={8} fill="#fff" stroke="#111" strokeWidth={4} />
        <rect x={0} y={0} width={190} height={46} rx={8} fill="#e03131" />
        <text x={95} y={33} textAnchor="middle" fontSize={26} fontWeight={900} fill="#fff">
          10 月
        </text>
        <text x={95} y={140} textAnchor="middle" fontSize={84} fontWeight={900} fill="#111">
          23
        </text>
        <circle cx={95} cy={112} r={58} fill="none" stroke="#e03131" strokeWidth={5} />
        <text x={95} y={192} textAnchor="middle" fontSize={22} fontWeight={800} fill="#e03131">
          作业截止 DDL
        </text>
      </g>
      {/* window */}
      <g>
        <rect x={90} y={62} width={330} height={240} rx={6} fill="#1b2540" stroke="#111" strokeWidth={6} />
        {[...Array(18)].map((_, i) => {
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / (14 + (i % 5) * 4) + i));
          return <circle key={i} cx={100 + random(`sx${i}`) * 310} cy={70 + random(`sy${i}`) * 120} r={1.6 + (i % 3) * 0.6} fill="#fff" opacity={tw} />;
        })}
        <circle cx={350} cy={112} r={26} fill="#fff3bf" />
        <circle cx={362} cy={104} r={22} fill="#1b2540" />
        {/* skyline */}
        {[
          [96, 210, 50],
          [146, 180, 40],
          [186, 230, 60],
          [246, 196, 44],
          [290, 220, 56],
          [346, 170, 70],
        ].map(([x, y, w], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={300 - y} fill="#0f1626" />
            {[...Array(6)].map((_, k) => {
              const on = random(`w${i}-${k}-${Math.floor((f + k * 37 + i * 11) / 90)}`) > 0.45;
              return (
                <rect key={k} x={x + 8 + (k % 2) * (w / 2 - 4)} y={y + 10 + Math.floor(k / 2) * 22} width={10} height={10} fill="#ffd43b" opacity={on ? 0.85 : 0.08} />
              );
            })}
          </g>
        ))}
        <line x1={255} y1={62} x2={255} y2={302} stroke="#111" strokeWidth={5} />
        <line x1={90} y1={182} x2={420} y2={182} stroke="#111" strokeWidth={4} />
        {/* curtain */}
        <path d={`M70 50 q ${20 + curtain} 120 0 270 l 60 0 q ${-14 - curtain} -140 6 -270 Z`} fill="#fff" stroke="#111" strokeWidth={4} />
        <path d={`M440 50 q ${-20 - curtain} 120 0 270 l -50 0 q ${14 + curtain} -140 -6 -270 Z`} fill="#fff" stroke="#111" strokeWidth={4} />
        <line x1={50} y1={50} x2={470} y2={50} stroke="#111" strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* lamp (behind laptop on right) */}
      <g stroke="#111" strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M1700 392 L1748 250 L1640 150" />
        <circle cx={1748} cy={250} r={8} fill="#fff" />
      </g>
      <ellipse cx={1700} cy={392} rx={62} ry={14} fill="#fff" stroke="#111" strokeWidth={5} />
      <path d="M1580 126 L1680 162 L1650 206 L1556 170 Z" fill="#fff" stroke="#111" strokeWidth={5} strokeLinejoin="round" />
      {/* desk */}
      <rect x={-700} y={330} width={3320} height={600} fill="#f4ead9" />
      <line x1={-700} y1={330} x2={2620} y2={330} stroke="#111" strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M-700 ${370 + i * 42} C 200 ${360 + i * 44}, 900 ${384 + i * 40}, 2620 ${366 + i * 44}`} stroke="#e6d6bd" strokeWidth={3} fill="none" />
      ))}
      {/* lamp light pool */}
      <ellipse cx={1500} cy={420} rx={420} ry={120} fill="#ffe066" opacity={0.18 * lamp * flick} />
      {/* mug + steam */}
      <g stroke="#111" strokeWidth={4} fill="#fff">
        <rect x={250} y={372} width={58} height={68} rx={8} />
        <path d="M308 386 q26 6 0 36" fill="none" />
        <path d="M262 396 h34 M262 410 h22" stroke="#adb5bd" strokeWidth={3} />
      </g>
      {[0, 1, 2].map((i) => {
        const t = ((f + i * 25) % 75) / 75;
        return (
          <path
            key={i}
            d={`M${270 + i * 10} ${366 - t * 70} q 8 -12 0 -24 q -8 -12 0 -24`}
            stroke="#adb5bd"
            strokeWidth={3}
            fill="none"
            opacity={(1 - t) * 0.8}
          />
        );
      })}
      {/* trash can */}
      <g>
        <path d={`M${W.trash.x - 62} ${W.trash.y} L${W.trash.x + 62} ${W.trash.y} L${W.trash.x + 50} ${W.trash.y + 104} L${W.trash.x - 50} ${W.trash.y + 104} Z`} fill="#fff" stroke="#111" strokeWidth={5} strokeLinejoin="round" />
        {[-30, 0, 30].map((dx) => (
          <line key={dx} x1={W.trash.x + dx} y1={W.trash.y + 16} x2={W.trash.x + dx * 0.82} y2={W.trash.y + 92} stroke="#adb5bd" strokeWidth={3} />
        ))}
        <ellipse cx={W.trash.x} cy={W.trash.y} rx={62} ry={12} fill="#495057" stroke="#111" strokeWidth={4} />
        {/* crumpled paper balls */}
        <circle cx={W.trash.x - 22} cy={W.trash.y - 6} r={14} fill="#fff" stroke="#111" strokeWidth={3} />
        <circle cx={W.trash.x + 18} cy={W.trash.y - 4} r={11} fill="#fff" stroke="#111" strokeWidth={3} />
      </g>
    </g>
  );
};

/** lamp cone drawn over everything (additive feel) */
export const LampCone: React.FC<{ frame: number; lamp?: number }> = ({ frame, lamp = 1 }) => {
  const flick = 0.9 + 0.1 * Math.sin(frame * 0.37) * Math.sin(frame * 0.13);
  const moth = { x: 1610 + Math.cos(frame / 9) * 46, y: 220 + Math.sin(frame / 6) * 22 };
  return (
    <g>
      <polygon points="1556,170 1650,206 1840,520 1180,520" fill="#ffe066" opacity={0.12 * lamp * flick} />
      <g transform={`translate(${moth.x} ${moth.y})`} opacity={lamp}>
        <ellipse cx={-4} cy={0} rx={5} ry={3} fill="#495057" transform={`rotate(${Math.sin(frame * 2) * 40})`} />
        <ellipse cx={4} cy={0} rx={5} ry={3} fill="#495057" transform={`rotate(${-Math.sin(frame * 2) * 40})`} />
      </g>
    </g>
  );
};
