import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clock } from "../components/Clock";
import { DizzySpiral, SmokePuff } from "../components/Effects";
import { EnergyBar } from "../components/EnergyBar";
import { Laptop } from "../components/Laptop";
import { offsetPose, Pose, poseTrack } from "../components/poses";
import { Pop } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { batteryAt, clockSeconds, docLines, energyAt, L, progressAt } from "../timeline";
import { ip } from "../utils";

/**
 * First-person / tight over-shoulder desk poses.
 * Transform origin ≈ bottom-center of frame; hands reach UP onto the keyboard.
 * Full body is never drawn — only armsOnly + a soft shoulder silhouette.
 */
const p = (x: number, y: number) => ({ x, y });

const FP = (o: Partial<Pose> = {}): Pose => ({
  // neck near bottom of frame; elbows mid-low; hands reach up onto keyboard
  head: p(0, -22),
  neck: p(0, -6),
  hip: p(0, 60),
  lElbow: p(-95, -28),
  lHand: p(-130, -78),
  rElbow: p(95, -28),
  rHand: p(130, -78),
  lKnee: p(-18, 80),
  lFoot: p(-22, 110),
  rKnee: p(18, 80),
  rFoot: p(22, 110),
  ...o,
});

const FP_SIT = FP();
const FP_HOVER = FP({
  lElbow: p(-100, -40),
  lHand: p(-110, -105),
  rElbow: p(100, -40),
  rHand: p(110, -105),
});
const FP_TYPE = FP({
  lElbow: p(-92, -32),
  lHand: p(-120, -88),
  rElbow: p(92, -32),
  rHand: p(120, -88),
});
const FP_TYPE_LEAN = FP({
  head: p(0, -16),
  neck: p(0, -2),
  lElbow: p(-88, -38),
  lHand: p(-112, -96),
  rElbow: p(88, -38),
  rHand: p(112, -96),
});
/** hands clutch toward face (toward bottom of frame / viewer) */
const FP_GRAB = FP({
  lElbow: p(-40, -8),
  lHand: p(-28, 18),
  rElbow: p(40, -8),
  rHand: p(28, 18),
});
const FP_DROOP = FP({
  head: p(4, -24),
  neck: p(2, -10),
  lElbow: p(-60, -30),
  lHand: p(-90, -55),
  rElbow: p(60, -30),
  rHand: p(90, -55),
});
const FP_SLUMP = FP({
  head: p(8, -14),
  neck: p(4, -4),
  lElbow: p(-50, -18),
  lHand: p(-70, -28),
  rElbow: p(50, -18),
  rHand: p(70, -28),
});
const FP_JOLT = FP({
  head: p(0, -30),
  neck: p(0, -12),
  lElbow: p(-110, -50),
  lHand: p(-80, -120),
  rElbow: p(110, -50),
  rHand: p(80, -120),
});
const FP_ENTER = FP({
  lElbow: p(-90, -30),
  lHand: p(-118, -86),
  rElbow: p(70, -55),
  rHand: p(50, -115),
});
const FP_LEAN_BACK = FP({
  head: p(0, -42),
  neck: p(0, -22),
  lElbow: p(-55, -10),
  lHand: p(-70, 25),
  rElbow: p(55, -10),
  rHand: p(70, 25),
});

const HERO_TRACK: [number, Pose][] = [
  [0, FP_SIT],
  [330, FP_SIT],
  [365, FP_HOVER],
  [420, FP_HOVER],
  [440, FP_SIT],
  [1050, FP_SIT],
  [1075, FP_GRAB],
  [1180, FP_GRAB],
  [1200, FP_TYPE],
  [1440, FP_TYPE],
  [1460, FP_HOVER],
  [1495, FP_HOVER],
  [1505, FP_TYPE],
  [1580, FP_TYPE],
  [1600, FP_HOVER],
  [1800, FP_HOVER],
  [1900, FP_DROOP],
  [2350, FP_DROOP],
  [2480, FP_SLUMP],
  [2702, FP_SLUMP],
  [2712, FP_JOLT],
  [2790, FP_JOLT],
  [2830, FP_HOVER],
  [3120, FP_HOVER],
  [3160, FP_TYPE_LEAN],
  [4200, FP_TYPE_LEAN],
  [4230, FP_TYPE],
  [4650, FP_TYPE],
  [4672, FP_ENTER],
  [4688, FP_ENTER],
  [4692, FP_TYPE],
  [4785, FP_TYPE],
  [4830, FP_LEAN_BACK],
];

const handJitter = (F: number, phase = 0) => {
  const z = { x: 0, y: 0 };
  let l = z;
  let r = z;
  const f = F + phase;
  if (F >= 1200 && F < 1440) {
    l = { x: 0, y: Math.max(0, Math.sin(f * 0.45)) * -5 };
    r = { x: 0, y: Math.max(0, Math.sin(f * 0.45 + Math.PI)) * -5 };
  } else if (F >= 1505 && F < 1580) {
    r = { x: 0, y: Math.abs(Math.sin(f * 1.6)) * -9 };
  } else if (F >= 1580 && F < 1800) {
    l = { x: Math.sin(f * 2.3) * 2, y: Math.cos(f * 2.9) * 2 };
    r = { x: Math.sin(f * 2.7) * 2, y: Math.cos(f * 2.1) * 2 };
  } else if (F >= 3170 && F < 4190) {
    l = { x: Math.sin(f * 1.3) * 5, y: Math.abs(Math.sin(f * 2.1)) * -11 };
    r = { x: Math.cos(f * 1.7) * 5, y: Math.abs(Math.sin(f * 2.1 + 1.6)) * -11 };
  } else if (F >= 4235 && F < 4645) {
    l = { x: 0, y: Math.max(0, Math.sin(f * 0.8)) * -5 };
    r = { x: 0, y: Math.max(0, Math.sin(f * 0.8 + Math.PI)) * -5 };
  } else if (F >= 4700 && F < 4785) {
    r = { x: ip(F, [4700, 4760], [0, 6]), y: F >= 4768 && F < 4776 ? 3 : 0 };
  }
  return { l, r };
};

export const heroPoseAt = (F: number, phase = 0) => {
  const base = poseTrack(F, HERO_TRACK);
  const j = handJitter(F, phase);
  return offsetPose(base, { lHand: j.l, rHand: j.r });
};

/** Soft head/shoulder anchor for thought-bubble trail (bottom-center of desk half). */
export const heroHead = (F: number) => {
  const pose = poseTrack(F, HERO_TRACK);
  return {
    x: L.heroX + pose.head.x * L.heroScale,
    y: Math.min(1065, L.heroY + pose.head.y * L.heroScale),
  };
};

export const Desk: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pose = heroPoseAt(F);
  const head = heroHead(F);
  const jolt = F >= 2702 && F < 2730 ? -ip(F, [2702, 2712, 2730], [0, 18, 0]) : 0;
  const frantic = F >= 3170 && F < 4190;
  const S = L.screen;
  const keyY = S.y + S.h + 6; // keyboard deck top

  // Act1 opening: brief angled → full FP (≈1s), then stay FP
  const cam = ip(F, [0, 28], [0, 1]);
  const camSkew = (1 - cam) * 7;
  const camOx = (1 - cam) * 90;
  const camScale = 0.94 + cam * 0.06;

  const redFlash =
    F >= 2705 && F < 3150 ? (Math.floor(F / 8) % 2 === 0 ? 1 : 0.25) * ip(F, [3080, 3150], [1, 0]) : 0;
  const arrow =
    F >= 4690 && F < 4950
      ? { x: ip(F, [4700, 4760], [520, 1180]), y: ip(F, [4700, 4760], [160, 310]) }
      : null;
  const success = F >= 4780 ? spring({ frame: F - 4780, fps, config: { damping: 9, stiffness: 140 } }) : 0;
  const marked = F >= 4510 ? 3 : F >= 4470 ? 2 : F >= 4430 ? 1 : 0;

  const armsY = L.heroY + jolt;

  return (
    <AbsoluteFill>
      {/* Camera-warped desk world (angled → FP in first second) */}
      <AbsoluteFill
        style={{
          transformOrigin: "50% 85%",
          transform: `translateX(${camOx}px) skewX(${-camSkew}deg) scale(${camScale})`,
        }}
      >
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {/* soft room floor strip */}
          <rect x={0} y={1040} width={1920} height={40} fill="#f8f9fa" />
          <line x1={40} y1={1040} x2={1880} y2={1040} stroke="#ced4da" strokeWidth={3} />

          {/* desk surface under keyboard */}
          <g stroke="#111" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
            <rect x={S.x - 30} y={keyY + 52} width={S.w + 60} height={14} fill="#fff" />
            <line x1={S.x} y1={keyY + 66} x2={S.x + 30} y2={1060} />
            <line x1={S.x + S.w} y1={keyY + 66} x2={S.x + S.w - 30} y2={1060} />
          </g>

          {/* keyboard / laptop base — foreshortened toward viewer */}
          <path
            d={`M${S.x + 50} ${keyY} L${S.x + S.w - 50} ${keyY} L${S.x + S.w + 20} ${keyY + 58} L${S.x - 20} ${keyY + 58} Z`}
            fill="#e9ecef"
            stroke="#111"
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* key rows hint */}
          {[0, 1, 2].map((r) => (
            <line
              key={r}
              x1={S.x + 80 + r * 8}
              y1={keyY + 14 + r * 14}
              x2={S.x + S.w - 80 - r * 8}
              y2={keyY + 14 + r * 14}
              stroke="#adb5bd"
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}

          {/* trackpad */}
          <rect
            x={S.x + S.w / 2 - 70}
            y={keyY + 28}
            width={140}
            height={22}
            rx={4}
            fill="#fff"
            stroke="#111"
            strokeWidth={3}
          />

          {/* mug on desk right */}
          <g stroke="#111" strokeWidth={3.5} fill="#fff">
            <rect x={S.x + S.w + 36} y={keyY + 8} width={34} height={40} rx={4} />
            <path d={`M${S.x + S.w + 70} ${keyY + 16} q16 4 0 22`} fill="none" />
          </g>

          {/* soft shoulder mounds + tiny head bump — cropped at bottom edge only */}
          <g opacity={0.9}>
            <ellipse cx={L.heroX - 120} cy={1095} rx={130} ry={48} fill="#111" />
            <ellipse cx={L.heroX + 120} cy={1095} rx={130} ry={48} fill="#111" />
            <ellipse cx={L.heroX} cy={1088} rx={70} ry={36} fill="#111" />
          </g>

          {/* frantic ghost arm overlays */}
          {frantic &&
            [9, 17].map((ph, i) => (
              <StickFigure
                key={i}
                pose={heroPoseAt(F, ph)}
                x={L.heroX}
                y={armsY}
                scale={L.heroScale}
                armsOnly
                strokeWidth={6}
                opacity={0.2 - i * 0.06}
              />
            ))}

          {/* primary typing arms — NEVER a full sitting stickman */}
          <StickFigure
            pose={pose}
            x={L.heroX}
            y={armsY}
            scale={L.heroScale}
            strokeWidth={7}
            armsOnly
          />

          {F >= 1600 && F < 2760 && (
            <DizzySpiral
              x={head.x}
              y={head.y - 30}
              frame={F}
              opacity={ip(F, [1600, 1640, 2720, 2760], [0, 1, 1, 0])}
            />
          )}
          {F >= 1900 && F < 2700 &&
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((i) => (
              <SmokePuff key={i} x={head.x + 8} y={head.y - 24} t={F - (1900 + i * 45)} seed={`hs${i}`} />
            ))}
          {F >= 2712 && F < 3150 &&
            [0, 1].map((i) => {
              const t = (F - 2712 + i * 20) % 40;
              return (
                <path
                  key={i}
                  d={`M${head.x - 36 - i * 10} ${head.y - 10 + t * 1.1} q-6 10 0 14 q6 -4 0 -14`}
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
      </AbsoluteFill>

      {/* HUD floats in screen space (not skewed) so clock/energy stay readable */}
      <Clock seconds={clockSeconds(F)} x={L.clock.x} y={L.clock.y} alarm={F >= 2705 && F < 4650} frame={F} />
      <EnergyBar value={energyAt(F)} x={56} y={660} frame={F} />

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Pop
          key={i}
          x={1640 + (i % 2) * 80}
          y={740}
          start={20 + i * 45}
          dur={22}
          text={i % 2 ? "答" : "滴"}
          size={34}
          color="#868e96"
          rot={0}
        />
      ))}
      {F >= 1060 && F < 1790 && (
        <div
          style={{
            position: "absolute",
            left: 1600,
            top: 728,
            fontSize: 30,
            fontWeight: 900,
            color: "#868e96",
            fontFamily: "sans-serif",
          }}
        >
          ▶▶ ×120
        </div>
      )}
      {[0, 1, 2, 3].map((i) => (
        <Pop
          key={`bs${i}`}
          x={620 + i * 90}
          y={keyY + 8}
          start={1505 + i * 18}
          dur={20}
          text="哒哒哒"
          size={30}
          color="#495057"
          rot={-4 + i * 3}
        />
      ))}
      <Pop x={520} y={keyY + 28} start={1508} dur={70} text="⌫ Backspace!!" size={30} color="#e03131" rot={0} />
      {Array.from({ length: 16 }).map((_, i) => (
        <Pop
          key={`ty${i}`}
          x={560 + (i % 4) * 180}
          y={keyY + 6 + (i % 2) * 22}
          start={3180 + i * 62}
          dur={26}
          text="哒哒哒哒"
          size={30}
          color="#111"
          rot={i % 2 ? 6 : -6}
        />
      ))}
      <Pop x={700} y={keyY + 8} start={4686} dur={28} text="回车！" size={44} color="#111" />
      <Pop x={1100} y={S.y + 200} start={4770} dur={20} text="Click" size={30} color="#111" rot={0} />
      <Pop x={1200} y={S.y + 40} start={4782} dur={40} text="叮——" size={40} color="#2f9e44" rot={0} />
      <Pop x={860} y={980} start={4840} dur={70} text="呼……" size={40} color="#868e96" rot={0} />
    </AbsoluteFill>
  );
};
