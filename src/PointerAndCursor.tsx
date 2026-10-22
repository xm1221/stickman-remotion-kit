import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { ThoughtFrame } from "./components/ThoughtFrame";
import { Act1 } from "./scenes/Act1";
import { Act2 } from "./scenes/Act2";
import { Act3 } from "./scenes/Act3";
import { Act4 } from "./scenes/Act4";
import { Credits } from "./scenes/Credits";
import { Desk, heroHead } from "./scenes/Desk";
import { ACTS, L, shakeAt } from "./timeline";
import { FONT, ip } from "./utils";

export const PointerAndCursor: React.FC = () => {
  const F = useCurrentFrame();
  const shrink = ip(F, [ACTS.credits.from, ACTS.credits.from + 40], [1, 0]);
  const shake = shakeAt(F);
  const head = heroHead(F);
  const grow = ip(F, [300, 345], [0, 1]);
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      {shrink > 0 && (
        <AbsoluteFill
          style={{
            background: "#fff",
            transform: `translate(${shake.x}px, ${shake.y}px) scale(${shrink})`,
            opacity: Math.min(1, shrink * 1.5),
            borderRadius: (1 - shrink) * 80,
            overflow: "hidden",
          }}
        >
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <line x1={0} y1={L.divider} x2={1920} y2={L.divider} stroke="#dee2e6" strokeWidth={3} strokeDasharray="10 10" />
            <text x={40} y={L.divider + 36} fontSize={22} fill="#adb5bd" fontFamily={FONT}>
              现实
            </text>
            <ThoughtFrame grow={grow} frame={F} headX={head.x} headY={head.y} />
          </svg>
          <Desk />
          <Sequence from={ACTS.act1.from} durationInFrames={ACTS.act1.dur} name="第一幕 对峙与同一体">
            <Act1 />
          </Sequence>
          <Sequence from={ACTS.act2.from} durationInFrames={ACTS.act2.dur} name="第二幕 内耗空转">
            <Act2 />
          </Sequence>
          <Sequence from={ACTS.act3.from} durationInFrames={ACTS.act3.dur} name="第三幕 危机与实践">
            <Act3 />
          </Sequence>
          <Sequence from={ACTS.act4.from} durationInFrames={ACTS.act4.dur} name="第四幕 矛盾转化">
            <Act4 />
          </Sequence>
        </AbsoluteFill>
      )}
      <Sequence from={ACTS.credits.from} durationInFrames={ACTS.credits.dur} name="尾声 黑场">
        <Credits />
      </Sequence>
    </AbsoluteFill>
  );
};
