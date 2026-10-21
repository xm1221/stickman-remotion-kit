import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clock } from "../components/Clock";
import { DizzySpiral, SmokePuff } from "../components/Effects";
import { EnergyBar } from "../components/EnergyBar";
import { Laptop } from "../components/Laptop";
import {
  offsetPose,
  Pose,
  poseTrack,
  SIT,
  SIT_DROOP,
  SIT_ENTER_UP,
  SIT_GRAB_HEAD,
  SIT_HOVER,
  SIT_JOLT,
  SIT_LEAN_BACK,
  SIT_SLUMP,
  SIT_TYPE,
  SIT_TYPE_LEAN,
} from "../components/poses";
import { Pop } from "../components/SpeechBubble";
import { Eyes, Mouth, StickFigure } from "../components/StickFigure";
import { batteryAt, clockSeconds, docLines, energyAt, L, progressAt } from "../timeline";
import { ip } from "../utils";

const HERO_TRACK: [number, Pose][] = [
  [0, SIT],
  [330, SIT],
  [365, SIT_HOVER],
  [420, SIT_HOVER],
  [440, SIT],
  [1050, SIT],
  [1075, SIT_GRAB_HEAD],
  [1180, SIT_GRAB_HEAD],
  [1200, SIT_TYPE],
  [1440, SIT_TYPE],
  [1460, SIT_HOVER],
  [1495, SIT_HOVER],
  [1505, SIT_TYPE],
  [1580, SIT_TYPE],
  [1600, SIT_HOVER],
  [1800, SIT_HOVER],
  [1900, SIT_DROOP],
  [2350, SIT_DROOP],
  [2480, SIT_SLUMP],
  [2702, SIT_SLUMP],
  [2712, SIT_JOLT],
  [2790, SIT_JOLT],
  [2830, SIT_HOVER],
  [3120, SIT_HOVER],
  [3160, SIT_TYPE_LEAN],
  [4200, SIT_TYPE_LEAN],
  [4230, SIT_TYPE],
  [4650, SIT_TYPE],
  [4672, SIT_ENTER_UP],
  [4688, SIT_ENTER_UP],
  [4692, SIT_TYPE],
  [4785, SIT_TYPE],
  [4830, SIT_LEAN_BACK],
];

/** additive hand motion for typing / trembling */
const handJitter = (F: number, phase = 0) => {
  const z = { x: 0, y: 0 };
  let l = z;
  let r = z;
  const f = F + phase;
  if (F >= 1200 && F < 1440) {
    l = { x: 0, y: Math.max(0, Math.sin(f * 0.45)) * -6 };
    r = { x: 0, y: Math.max(0, Math.sin(f * 0.45 + Math.PI)) * -6 };
  } else if (F >= 1505 && F < 1580) {
    r = { x: 0, y: Math.abs(Math.sin(f * 1.6)) * -10 };
  } else if (F >= 1580 && F < 1800) {
    l = { x: Math.sin(f * 2.3) * 2, y: Math.cos(f * 2.9) * 2.5 };
    r = { x: Math.sin(f * 2.7) * 2, y: Math.cos(f * 2.1) * 2.5 };
  } else if (F >= 3170 && F < 4190) {
    l = { x: Math.sin(f * 1.3) * 4, y: Math.abs(Math.sin(f * 2.1)) * -12 };
    r = { x: Math.cos(f * 1.7) * 4, y: Math.abs(Math.sin(f * 2.1 + 1.6)) * -12 };
  } else if (F >= 4235 && F < 4645) {
    l = { x: 0, y: Math.max(0, Math.sin(f * 0.8)) * -6 };
    r = { x: 0, y: Math.max(0, Math.sin(f * 0.8 + Math.PI)) * -6 };
  } else if (F >= 4700 && F < 4785) {
    // touchpad move then click
    r = { x: ip(F, [4700, 4760], [0, 8]), y: F >= 4768 && F < 4776 ? 3 : 0 };
  }
  return { l, r };
};

const heroFace = (F: number): { eyes: Eyes; mouth: Mouth } => {
  if (F < 440) return { eyes: "normal", mouth: "smile" };
  if (F < 1050) return { eyes: "normal", mouth: "flat" };
  if (F < 1200) return { eyes: "sad", mouth: "frown" };
  if (F < 1500) return { eyes: "normal", mouth: "flat" };
  if (F < 1600) return { eyes: "angry", mouth: "grit" };
  if (F < 2702) return { eyes: "dizzy", mouth: "frown" };
  if (F < 2830) return { eyes: "wide", mouth: "open" };
  if (F < 3150) return { eyes: "wide", mouth: "flat" };
  if (F < 4230) return { eyes: "angry", mouth: "grit" };
  if (F < 4790) return { eyes: "normal", mouth: "smile" };
  return { eyes: "up", mouth: "grin" };
};

export const heroPoseAt = (F: number, phase = 0) => {
  const base = poseTrack(F, HERO_TRACK);
  const j = handJitter(F, phase);
  return offsetPose(base, { lHand: j.l, rHand: j.r });
};

export const heroHead = (F: number) => {
  const p = poseTrack(F, HERO_TRACK);
  return { x: L.heroX + p.head.x * L.heroScale, y: L.heroY + p.head.y * L.heroScale };
};

export const Desk: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pose = heroPoseAt(F);
  const face = heroFace(F);
  const head = heroHead(F);
  const jolt = F >= 2702 && F < 2730 ? -ip(F, [2702, 2712, 2730], [0, 26, 0]) : 0;
  const frantic = F >= 3170 && F < 4190;
  const S = L.screen;

  const redFlash =
    F >= 2705 && F < 3150 ? (Math.floor(F / 8) % 2 === 0 ? 1 : 0.25) * ip(F, [3080, 3150], [1, 0]) : 0;
  const arrow =
    F >= 4690 && F < 4950
      ? { x: ip(F, [4700, 4760], [260, 560]), y: ip(F, [4700, 4760], [110, 238]) }
      : null;
  const success = F >= 4780 ? spring({ frame: F - 4780, fps, config: { damping: 9, stiffness: 140 } }) : 0;
  const marked = F >= 4510 ? 3 : F >= 4470 ? 2 : F >= 4430 ? 1 : 0;

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* floor */}
        <line x1={120} y1={1044} x2={1800} y2={1044} stroke="#ced4da" strokeWidth={4} />
        {/* chair */}
        <g stroke="#111" strokeWidth={6} strokeLinecap="round" fill="none">
          <line x1={588} y1={938} x2={690} y2={938} />
          <line x1={590} y1={938} x2={570} y2={792} />
          <line x1={598} y1={938} x2={592} y2={1040} />
          <line x1={680} y1={938} x2={688} y2={1040} />
        </g>
        {/* desk */}
        <g stroke="#111" strokeWidth={6} strokeLinecap="round">
          <rect x={716} y={903} width={860} height={14} fill="#fff" />
          <line x1={740} y1={917} x2={740} y2={1040} />
          <line x1={1550} y1={917} x2={1550} y2={1040} />
        </g>
        {/* laptop base / keyboard */}
        <path
          d={`M${S.x - 30} 903 L${S.x + S.w + 30} 903 L${S.x + S.w + 6} ${S.y + S.h - 2} L${S.x + 6} ${S.y + S.h - 2} Z`}
          fill="#f1f3f5"
          stroke="#111"
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {/* mug */}
        <g stroke="#111" strokeWidth={4} fill="#fff">
          <rect x={1495} y={858} width={38} height={45} rx={5} />
          <path d="M1533 868 q18 4 0 24" fill="none" />
        </g>
        {/* ghost hands for frantic typing */}
        {frantic &&
          [9, 17].map((ph, i) => (
            <StickFigure
              key={i}
              pose={heroPoseAt(F, ph)}
              x={L.heroX}
              y={L.heroY}
              scale={L.heroScale}
              armsOnly
              opacity={0.22 - i * 0.07}
            />
          ))}
        <StickFigure
          pose={pose}
          x={L.heroX}
          y={L.heroY + jolt}
          scale={L.heroScale}
          strokeWidth={5}
          eyes={face.eyes}
          mouth={face.mouth}
        />
        {/* dizzy + smoke when drained */}
        {F >= 1600 && F < 2760 && (
          <DizzySpiral x={head.x} y={head.y - 56} frame={F} opacity={ip(F, [1600, 1640, 2720, 2760], [0, 1, 1, 0])} />
        )}
        {F >= 1900 && F < 2700 &&
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((i) => (
            <SmokePuff key={i} x={head.x + 10} y={head.y - 40} t={F - (1900 + i * 45)} seed={`hs${i}`} />
          ))}
        {/* sweat drops in crisis */}
        {F >= 2712 && F < 3150 &&
          [0, 1].map((i) => {
            const t = (F - 2712 + i * 20) % 40;
            return (
              <path
                key={i}
                d={`M${head.x - 40 - i * 10} ${head.y - 20 + t * 1.2} q-6 10 0 14 q6 -4 0 -14`}
                fill="#74c0fc"
                stroke="#1c7ed6"
                strokeWidth={2}
                opacity={1 - t / 40}
              />
            );
          })}
      </svg>

      <Laptop
        x={S.x}
        y={S.y}
        w={S.w}
        h={S.h}
        frame={F}
        lines={docLines(F)}
        battery={batteryAt(F)}
        progress={progressAt(F)}
        redFlash={redFlash}
        showSubmit={F >= 4640}
        pressed={F >= 4768 && F < 4782}
        arrow={arrow}
        success={success}
        markedLines={marked}
      />
      <Clock seconds={clockSeconds(F)} x={L.clock.x} y={L.clock.y} alarm={F >= 2705 && F < 4650} frame={F} />
      <EnergyBar value={energyAt(F)} x={360} y={690} frame={F} />

      {/* ticking */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Pop key={i} x={1640 + (i % 2) * 80} y={740} start={20 + i * 45} dur={22} text={i % 2 ? "答" : "滴"} size={34} color="#868e96" rot={0} />
      ))}
      {/* fast-forward marker */}
      {F >= 1060 && F < 1790 && (
        <div style={{ position: "absolute", left: 1600, top: 728, fontSize: 30, fontWeight: 900, color: "#868e96", fontFamily: "sans-serif" }}>
          ▶▶ ×120
        </div>
      )}
      {/* backspace mashing */}
      {[0, 1, 2, 3].map((i) => (
        <Pop key={`bs${i}`} x={880 + i * 70} y={935} start={1505 + i * 18} dur={20} text="哒哒哒" size={30} color="#495057" rot={-4 + i * 3} />
      ))}
      <Pop x={720} y={960} start={1508} dur={70} text="⌫ Backspace!!" size={30} color="#e03131" rot={0} />
      {/* frantic typing */}
      {Array.from({ length: 16 }).map((_, i) => (
        <Pop key={`ty${i}`} x={820 + (i % 4) * 160} y={938 + (i % 2) * 22} start={3180 + i * 62} dur={26} text="哒哒哒哒" size={30} color="#111" rot={i % 2 ? 6 : -6} />
      ))}
      <Pop x={1010} y={940} start={4686} dur={28} text="回车！" size={44} color="#111" />
      <Pop x={1200} y={830} start={4770} dur={20} text="Click" size={30} color="#111" rot={0} />
      <Pop x={1300} y={600} start={4782} dur={40} text="叮——" size={40} color="#2f9e44" rot={0} />
      <Pop x={500} y={800} start={4840} dur={70} text="呼……" size={40} color="#868e96" rot={0} />
    </AbsoluteFill>
  );
};
