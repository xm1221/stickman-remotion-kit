import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { ThoughtFrame } from "./components/ThoughtFrame";
import { Act1 } from "./scenes/Act1";
import { Act2 } from "./scenes/Act2";
import { Act3 } from "./scenes/Act3";
import { Act4 } from "./scenes/Act4";
import { Credits } from "./scenes/Credits";
import { Desk } from "./scenes/Desk";
import { ACTS, L, shakeAt } from "./timeline";
import { FONT, ip } from "./utils";

export const PointerAndCursor: React.FC = () => {
  const F = useCurrentFrame();
  const shake = shakeAt(F);
  const grow = ip(F, [150, 195], [0, 1]);
  const filmO = ip(F, [ACTS.credits.from - 10, ACTS.credits.from + 30], [1, 0]);
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      {filmO > 0 && (
        <AbsoluteFill
          style={{
            background: "#fff",
            transform: `translate(${shake.x}px, ${shake.y}px)`,
            opacity: filmO,
            overflow: "hidden",
          }}
        >
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <ThoughtFrame grow={grow} frame={F} headX={960} headY={1080} />
          </svg>
          <Desk />
          <svg width={1920} height={1080} style={{ position: "absolute", pointerEvents: "none" }}>
            <line x1={0} y1={L.divider} x2={1920} y2={L.divider} stroke="#111" strokeWidth={4} />
          </svg>
          <Sequence from={ACTS.act1.from} durationInFrames={ACTS.act1.dur} name="第一幕 虚假的繁荣与合谋">
            <Act1 />
          </Sequence>
          <Sequence from={ACTS.act2.from} durationInFrames={ACTS.act2.dur} name="第二幕 死循环拉锯战">
            <Act2 />
          </Sequence>
          <Sequence from={ACTS.act3.from} durationInFrames={ACTS.act3.dur} name="第三幕 拔掉退格键">
            <Act3 />
          </Sequence>
          <Sequence from={ACTS.act4.from} durationInFrames={ACTS.act4.dur} name="第四幕 在运动中统一">
            <Act4 />
          </Sequence>
        </AbsoluteFill>
      )}
      <Sequence from={ACTS.credits.from} durationInFrames={ACTS.credits.dur} name="尾声 留白">
        <Credits />
      </Sequence>
    </AbsoluteFill>
  );
};
