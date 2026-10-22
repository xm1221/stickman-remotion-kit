import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ImpactBurst, PaperBrick, Phone, SmokePuff } from "../components/Effects";
import {
  ADJUST_GLASSES,
  ARMS_CROSS,
  HANDS_HIP,
  HIGH_FIVE,
  idleSway,
  offsetPose,
  Pose,
  POINT,
  poseTrack,
  PRESS_DOWN,
  SHRINK,
  SIT,
  STAND,
  walkCycle,
} from "../components/poses";
import { Pop, SpeechBubble } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { ACTS } from "../timeline";
import { C, FONT, ip, track } from "../utils";
import { Chair, headY, moving, MS, SIT_Y, STAND_Y, talk } from "./common";

/** teacher's pointer stick (black) drawn from the hand along the forearm */
export const pointerStick = (p: Pose, color = "#111") => {
  const dx = p.rHand.x - p.rElbow.x;
  const dy = p.rHand.y - p.rElbow.y;
  const n = Math.hypot(dx, dy) || 1;
  return (
    <g>
      <line x1={p.rHand.x} y1={p.rHand.y} x2={p.rHand.x + (dx / n) * 62} y2={p.rHand.y + (dy / n) * 62} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={p.rHand.x + (dx / n) * 62} cy={p.rHand.y + (dy / n) * 62} r={4} fill={color} />
    </g>
  );
};

const BLACK_X: [number, number][] = [
  [200, 520],
  [250, 640],
  [1500, 640],
  [1585, 900],
];
const RED_X: [number, number][] = [
  [240, 1100],
  [755, 1100],
  [775, 1152],
  [860, 1152],
  [945, 752],
  [1465, 752],
  [1560, 1480],
];
const BLUE_X: [number, number][] = [
  [450, 1640],
  [480, 1560],
  [505, 1560],
  [530, 1450],
  [548, 1450],
  [580, 1300],
  [710, 1300],
  [725, 1320],
  [755, 1320],
  [770, 1300],
  [860, 1300],
  [960, 530],
  [1465, 530],
  [1540, 640],
];

export const Act1: React.FC = () => {
  const F = useCurrentFrame() + ACTS.act1.from;

  const titleO = ip(F, [10, 40, 130, 160], [0, 1, 1, 0]);

  // ---------------- BLACK (hero avatar)
  const bx = track(F, BLACK_X);
  const sitting = F >= 912 && F < 1470;
  let bPose: Pose = moving(F, BLACK_X) ? walkCycle(F, 12) : idleSway(STAND, F, 2);
  if (F >= 250 && F < 300) bPose = offsetPose(bPose, { head: { x: -8, y: 2 }, neck: { x: -4, y: 0 } });
  if (sitting) {
    const squirm = F > 1000 ? Math.sin(F / 6) * 3 : 0;
    bPose = offsetPose(SIT, { head: { x: squirm, y: 2 }, lHand: { x: 0, y: squirm }, rHand: { x: 0, y: -squirm } });
  }
  const bY = sitting ? SIT_Y : STAND_Y;
  const bScale = ip(F, [200, 212], [0.2, MS]);
  const bEyes = sitting ? (F > 1100 ? "dizzy" : "wide") : F >= 250 && F < 450 ? "wide" : F >= 1470 ? "sad" : "normal";

  // ---------------- RED (完美主义)
  const rx = track(F, RED_X);
  let rPose: Pose = poseTrack(F, [
    [240, STAND],
    [250, STAND],
    [262, ADJUST_GLASSES],
    [280, ADJUST_GLASSES],
    [292, POINT],
    [440, POINT],
    [455, ARMS_CROSS],
    [700, ARMS_CROSS],
    [708, HANDS_HIP],
    [755, HANDS_HIP],
    [768, HIGH_FIVE],
    [790, HIGH_FIVE],
    [800, HANDS_HIP],
    [945, HANDS_HIP],
    [960, PRESS_DOWN],
    [1460, PRESS_DOWN],
    [1470, HANDS_HIP],
    [1565, ARMS_CROSS],
  ]);
  if (moving(F, RED_X)) rPose = walkCycle(F, 10);
  else if (F < 945 || F > 1560) rPose = idleSway(rPose, F, 2.5);
  if (F >= 960 && F < 1460) {
    // one hand presses the shoulder, the other stuffs the paper brick
    const push = Math.sin(F / 8) * 3;
    rPose = offsetPose(rPose, { lHand: { x: 0, y: push }, rHand: { x: -6, y: 14 + push } });
  }
  const rFacing: 1 | -1 = F < 700 ? -1 : F < 860 ? 1 : F < 1465 ? -1 : F < 1560 ? 1 : -1;
  const rEyes = F >= 700 && F < 755 ? "angry" : F >= 755 && F < 860 ? "normal" : F >= 280 ? "angry" : "normal";
  const rMouth = F >= 285 && F < 440 ? talk(F, 285, 440) : F >= 765 && F < 860 ? "grin" : F >= 960 && F < 1460 ? "grin" : "flat";
  const rScale = ip(F, [240, 252], [0.2, MS]);

  // ---------------- BLUE (畏难逃避) — timid: shrinks, hesitates
  const ux = track(F, BLUE_X);
  let uPose: Pose = SHRINK;
  if (moving(F, BLUE_X)) uPose = walkCycle(F, 12);
  if (F >= 548 && F < 700) uPose = offsetPose(SHRINK, { rElbow: { x: 10, y: -4 }, rHand: { x: 18, y: -12 } });
  if (F >= 700 && F < 755) uPose = offsetPose(SHRINK, { head: { x: -6, y: 6 }, neck: { x: -3, y: 4 } });
  if (F >= 760 && F < 795) uPose = HIGH_FIVE;
  if (F >= 795 && F < 860) uPose = idleSway(HANDS_HIP, F, 2);
  if (F >= 960 && F < 1460) {
    uPose = offsetPose(PRESS_DOWN, {
      rElbow: { x: -6, y: -8 },
      rHand: { x: -22, y: -28 + Math.sin(F / 9) * 3 },
    });
  }
  if (!moving(F, BLUE_X) && !(F >= 960 && F < 1460)) uPose = idleSway(uPose, F, 2);
  const uFacing: 1 | -1 = F < 860 ? -1 : 1;
  const uScaleY = F >= 760 && F < 860 ? 1 : 0.93; // shrunk posture
  const uEyes = F >= 760 && F < 860 ? "up" : F >= 700 && F < 755 ? "wide" : "sad";
  const uMouth = F >= 552 && F < 700 ? talk(F, 552, 700) : F >= 765 && F < 860 ? "grin" : F >= 960 && F < 1460 ? "smile" : "frown";
  const uPhone = F >= 540 && F < 1460;

  const chairO = ip(F, [898, 912, 1470, 1490], [0, 1, 1, 0]);
  const goalO = ip(F, [210, 240, 840, 870], [0, 1, 1, 0]);
  const capO = ip(F, [780, 800, 990, 1010], [0, 1, 1, 0]);
  const brickOnLap = F >= 1000 && F < 1470;

  return (
    <AbsoluteFill>
      {titleO > 0 && (
        <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", opacity: titleO, fontFamily: FONT }}>
          <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: 14, color: "#111" }}>《指针与光标》</div>
          <div style={{ fontSize: 34, color: "#e03131", fontWeight: 900, letterSpacing: 6, marginTop: 18 }}>2.0 · 拔掉退格键</div>
        </div>
      )}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* the assignment waiting on the right */}
        {goalO > 0 && (
          <g opacity={goalO} transform={`translate(1450 ${376 + Math.sin(F / 15) * 4})`}>
            <rect x={-34} y={-44} width={68} height={88} rx={4} fill="#fff" stroke="#111" strokeWidth={4} />
            {[0, 1, 2].map((i) => (
              <line key={i} x1={-20} y1={-20 + i * 16} x2={20} y2={-20 + i * 16} stroke="#adb5bd" strokeWidth={3} />
            ))}
            <text x={0} y={70} textAnchor="middle" fontSize={20} fontWeight={800} fontFamily={FONT} fill="#495057">
              作业
            </text>
          </g>
        )}
        <Chair x={640} back={-1} opacity={chairO} />
        {/* blue behind black when passing */}
        {F >= 450 && (
          <StickFigure
            pose={uPose}
            x={ux}
            y={STAND_Y}
            scale={MS}
            scaleY={uScaleY}
            facing={uFacing}
            color={C.blue}
            eyes={uEyes}
            mouth={uMouth}
            extras={(p) => (uPhone ? <Phone x={p.rHand.x + 2} y={p.rHand.y - 8} frame={F} /> : null)}
          />
        )}
        {F >= 200 && (
          <StickFigure
            pose={bPose}
            x={bx}
            y={bY}
            scale={bScale}
            color={C.black}
            eyes={bEyes}
            mouth={sitting ? "frown" : F >= 250 && F < 440 ? "open" : "flat"}
            extras={() => (brickOnLap ? <PaperBrick x={30} y={-6} s={0.8} /> : null)}
          />
        )}
        {F >= 240 && (
          <StickFigure
            pose={rPose}
            x={rx}
            y={STAND_Y}
            scale={rScale}
            facing={rFacing}
            color={C.red}
            glasses
            glassesTilt={F >= 255 && F < 285 ? -14 : 0}
            eyes={rEyes}
            mouth={rMouth}
            extras={(p) => (
              <>
                {F >= 285 && F < 445 && pointerStick(p)}
                {F >= 930 && F < 1000 && <PaperBrick x={p.rHand.x} y={p.rHand.y + 8} s={0.6} />}
              </>
            )}
          />
        )}
        {[0, 1, 2, 3].map((i) => (
          <SmokePuff key={i} x={1080 + i * 24} y={400} t={F - 240 - i * 2} seed={`r${i}`} dark={false} />
        ))}
        <ImpactBurst x={1226} y={STAND_Y - 118 * MS} t={F - 772} size={70} />
        <ImpactBurst x={690} y={360} t={F - 1000} size={40} />
        {capO > 0 && (
          <g opacity={capO} fontFamily={FONT} fontWeight={900} textAnchor="middle">
            <text x={960} y={92} fontSize={42}>
              <tspan fill={C.red}>高标准</tspan>
              <tspan fill="#111"> + </tspan>
              <tspan fill={C.blue}>低行动</tspan>
              <tspan fill="#111"> = 完美合谋</tspan>
            </text>
          </g>
        )}
      </svg>
      <Pop x={1100} y={300} start={240} text="嘭！" size={48} frame={F} />
      <SpeechBubble frame={F} x={1080} y={headY(STAND_Y) - 40} start={290} end={440} side="left" width={560} color={C.red} shout text="慢着！格局太小！先看完 20 篇核心文献！" />
      <Pop x={600} y={170} start={300} dur={40} text="？！" size={50} frame={F} />
      <SpeechBubble frame={F} x={1290} y={headY(STAND_Y, -76) - 30} start={555} end={700} side="left" width={600} color={C.blue} text="对对对！文献太难了，先刷会儿短视频补补多巴胺！" />
      <Pop x={1210} y={240} start={705} dur={40} text="VS" size={60} color="#868e96" rot={0} frame={F} />
      <Pop x={1226} y={110} start={772} dur={30} text="啪！" size={64} color="#111" frame={F} />
      <Pop x={640} y={300} start={900} dur={22} text="嘭" size={40} frame={F} />
      <Pop x={720} y={300} start={1000} dur={26} text="咚！" size={44} color={C.red} frame={F} />
      <Pop x={560} y={180} start={1040} dur={60} text="刷刷刷～" size={34} color={C.blue} rot={0} frame={F} />
      <Pop x={760} y={180} start={1120} dur={60} text="读完再写！" size={34} color={C.red} rot={0} frame={F} />
    </AbsoluteFill>
  );
};
