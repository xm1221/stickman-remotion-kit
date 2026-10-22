import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Keycap } from "../components/Effects";
import { ACTS } from "../timeline";
import { FONT, ip } from "../utils";

/** 尾声：合上的电脑 + 垃圾桶里的退格键特写 → 黑场白字 */
export const Credits: React.FC = () => {
  const f = useCurrentFrame();
  const F = f + ACTS.credits.from;
  const sceneO = ip(f, [0, 30, 150, 190], [0, 1, 1, 0]);
  const push = ip(f, [20, 190], [1, 1.22]);
  const t1 = ip(f, [200, 235], [0, 1]);
  const t2 = ip(f, [245, 290], [0, 1]);
  const t3 = ip(f, [300, 335], [0, 1]);
  const flick = 0.9 + 0.1 * Math.sin(F * 0.3);
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${ip(f, [0, 30], [0, 1])})` }}>
      {sceneO > 0 && (
        <AbsoluteFill style={{ opacity: sceneO }}>
          <svg width={1920} height={1080}>
            <g transform={`translate(960 600) scale(${push}) translate(-1100 -600)`}>
              <rect x={-400} y={-200} width={3000} height={700} fill="#1b2540" />
              <rect x={-400} y={500} width={3000} height={900} fill="#3b3125" />
              <line x1={-400} y1={500} x2={2600} y2={500} stroke="#111" strokeWidth={6} />
              {/* lamp light */}
              <ellipse cx={1050} cy={640} rx={700} ry={180} fill="#ffe066" opacity={0.22 * flick} />
              <polygon points="1060,-200 1240,-200 1700,700 500,700" fill="#ffe066" opacity={0.07 * flick} />
              {/* closed laptop */}
              <g>
                <path d="M300 560 L980 560 L1020 610 L260 610 Z" fill="#dee2e6" stroke="#111" strokeWidth={6} strokeLinejoin="round" />
                <path d="M260 610 L1020 610 L1020 626 L260 626 Z" fill="#868e96" stroke="#111" strokeWidth={5} />
                <circle cx={640} cy={584} r={8} fill="#fff" />
              </g>
              {/* trash can close-up */}
              <g>
                <path d="M1180 470 L1520 470 L1480 760 L1220 760 Z" fill="#f1f3f5" stroke="#111" strokeWidth={7} strokeLinejoin="round" />
                {[1260, 1350, 1440].map((x) => (
                  <line key={x} x1={x} y1={500} x2={x - (x - 1350) * 0.12} y2={740} stroke="#adb5bd" strokeWidth={5} />
                ))}
                <ellipse cx={1350} cy={470} rx={170} ry={30} fill="#343a40" stroke="#111" strokeWidth={6} />
                <circle cx={1270} cy={452} r={34} fill="#fff" stroke="#111" strokeWidth={4} />
                <circle cx={1440} cy={458} r={28} fill="#fff" stroke="#111" strokeWidth={4} />
                <Keycap x={1352} y={440} w={210} h={72} rot={18} />
              </g>
            </g>
          </svg>
        </AbsoluteFill>
      )}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: 16, opacity: t1 }}>《指针与光标》</div>
        <div style={{ fontSize: 38, fontStyle: "italic", marginTop: 40, opacity: t2, color: "#e9ecef", letterSpacing: 2 }}>
          “完美与畏难，本是一体两面的合谋；唯有行动，能击碎空转的循环。”
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 70,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 24,
          color: "#adb5bd",
          opacity: t3,
          letterSpacing: 1,
        }}
      >
        《马克思主义基本原理》实践作业 | 核心隐喻：矛盾的同一性与斗争性 · 实践与认识的辩证运动
      </div>
    </AbsoluteFill>
  );
};
