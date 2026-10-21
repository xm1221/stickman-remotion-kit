import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CirclingStars, Rock } from "../components/Effects";
import {
  ADJUST_GLASSES,
  CARRY,
  CHEER,
  INSPECT,
  LIE_DAZED,
  offsetPose,
  poseTrack,
  SHOVEL,
  SIT_GROUND,
  STAND,
  WALK_A,
  WALK_B,
  WRITE,
} from "../components/poses";
import { Pop, SpeechBubble } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { METEORS } from "../timeline";
import { C, FONT, hop, ip, lin, track } from "../utils";
import { BLUE_LAND_X, RED_LAND_X, ROCK_Y } from "./Act3";
import { LIE_Y, MS, STAND_Y, talk } from "./common";

const walkPose = (f: number) => (Math.floor(f / 9) % 2 === 0 ? WALK_A : WALK_B);
const BRICKS = 6;
const PILE_X = 1430;
const DROP_X = 1210;
const tripStart = (i: number) => 420 + i * 46;
const slot = (i: number) => ({ x: 870 + i * 50, y: ROCK_Y - 66 - (i % 2) * 0 });

export const Act4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cheer = f >= 690;

  // ---------------- RED ----------------
  const redX = track(f, [
    [0, RED_LAND_X],
    [40, RED_LAND_X],
    [90, RED_LAND_X],
    [140, 760],
    [400, 760],
    [425, 800],
    [470, 920],
    [515, 1030],
    [560, 780],
  ], lin);
  const redY = track(f, [
    [0, LIE_Y],
    [36, STAND_Y],
  ]) + hop(f, 30, 44, 20) + (cheer ? hop(f, 700, 716, 40) + hop(f, 724, 740, 40) : 0);
  const walkingRed = (f >= 90 && f < 140) || (f >= 400 && f < 425) || (f >= 515 && f < 560);
  let redPose = walkingRed
    ? walkPose(f)
    : poseTrack(f, [
        [0, LIE_DAZED],
        [36, STAND],
        [50, ADJUST_GLASSES],
        [88, ADJUST_GLASSES],
        [140, INSPECT],
        [250, INSPECT],
        [270, STAND],
        [425, WRITE],
        [515, WRITE],
        [560, WRITE],
        [680, WRITE],
        [695, CHEER],
      ]);
  if (f >= 425 && f < 680 && !walkingRed) redPose = offsetPose(redPose, { rHand: { x: Math.sin(f * 0.9) * 6, y: Math.cos(f * 1.3) * 4 } });
  const glassTilt = ip(f, [55, 85], [28, 0]);
  const redFacing: 1 | -1 = f >= 515 && f < 560 ? -1 : 1;

  // ---------------- BLUE ----------------
  let blueX = BLUE_LAND_X;
  let bluePose = poseTrack(f, [
    [0, LIE_DAZED],
    [230, LIE_DAZED],
    [258, SIT_GROUND],
    [395, SIT_GROUND],
    [415, STAND],
  ]);
  let blueY = f < 395 ? LIE_Y : ip(f, [395, 415], [LIE_Y, STAND_Y]);
  let blueFacing: 1 | -1 = -1;
  let carrying = -1;
  const lastTripEnd = tripStart(BRICKS - 1) + 46;
  if (f >= 415 && f < lastTripEnd) {
    const i = Math.floor((f - 420) / 46);
    const lt = f - tripStart(Math.max(0, i));
    if (f < 420 || lt < 20) {
      blueX = ip(lt, [0, 20], [PILE_X, DROP_X], lin);
      bluePose = { ...CARRY, ...pickLegs(f) };
      carrying = Math.max(0, i);
      blueFacing = -1;
    } else if (lt < 26) {
      blueX = DROP_X;
      bluePose = SHOVEL;
    } else {
      blueX = ip(lt, [26, 46], [DROP_X, PILE_X], lin);
      bluePose = { ...SHOVEL, ...pickLegs(f) };
      blueFacing = 1;
    }
    if (f < 420) blueX = BLUE_LAND_X + (PILE_X - BLUE_LAND_X) * ip(f, [415, 420], [0, 1]);
  } else if (f >= lastTripEnd) {
    blueX = track(f, [[lastTripEnd, PILE_X], [lastTripEnd + 40, 1180]], lin);
    bluePose = f < lastTripEnd + 40 ? walkPose(f) : f >= 695 ? CHEER : STAND;
    blueFacing = -1;
  }
  if (cheer) blueY = STAND_Y + hop(f, 704, 720, 40) + hop(f, 728, 744, 40);
  const hasShovel = f >= 415;

  const banner = spring({ frame: f - 650, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* brick pile */}
        {f >= 400 &&
          [0, 1, 2].map((k) => (
            <rect key={k} x={PILE_X + 20 + (k % 2) * 30} y={436 - 26 - Math.floor(k / 2) * 26} width={54} height={24} fill="#fff" stroke={C.blue} strokeWidth={4} opacity={ip(f, [400, 415], [0, 1])} />
          ))}
        {METEORS.map((m, i) => (
          <Rock
            key={i}
            x={m.tx}
            y={ROCK_Y}
            label={m.label}
            rot={[-6, 4, -3][i]}
            mark={f >= 430 + i * 42 ? Math.min(1, spring({ frame: f - 430 - i * 42, fps, config: { damping: 14 } })) : 0}
          />
        ))}
        {/* placed bricks (filling the gaps on top) */}
        {Array.from({ length: BRICKS }).map((_, i) => {
          const t0 = tripStart(i) + 20;
          if (f < t0) return null;
          const s = slot(i);
          const t = ip(f, [t0, t0 + 10], [0, 1], lin);
          const x = DROP_X - 60 + (s.x - (DROP_X - 60)) * t;
          const y = STAND_Y - 20 + (s.y - (STAND_Y - 20)) * t + hop(f, t0, t0 + 10, 80);
          return <rect key={i} x={x - 24} y={y - 12} width={48} height={24} fill="#fff" stroke={C.blue} strokeWidth={4} transform={`rotate(${(1 - t) * 180} ${x} ${y})`} />;
        })}
        <StickFigure
          pose={bluePose}
          x={blueX}
          y={blueY}
          scale={MS}
          facing={blueFacing}
          color={C.blue}
          eyes={f < 230 ? "dizzy" : cheer ? "closed" : "normal"}
          mouth={f < 230 ? "open" : cheer ? "grin" : f >= 260 && f < 410 ? talk(f, 260, 410) : "smile"}
          extras={(p) =>
            hasShovel && !(cheer && f >= 695) ? (
              <g>
                <line x1={p.lHand.x - 10} y1={p.lHand.y - 10} x2={p.rHand.x + 30} y2={p.rHand.y + 20} stroke="#8d6e63" strokeWidth={4} strokeLinecap="round" />
                <path d={`M${p.rHand.x + 26} ${p.rHand.y + 14} l22 4 l-4 18 l-20 -6 z`} fill="#dee2e6" stroke="#111" strokeWidth={3} />
                {carrying >= 0 && <rect x={p.rHand.x + 26} y={p.rHand.y - 6} width={30} height={16} fill="#fff" stroke={C.blue} strokeWidth={3} />}
              </g>
            ) : null
          }
        />
        <StickFigure
          pose={redPose}
          x={redX}
          y={redY}
          scale={MS}
          facing={redFacing}
          color={C.red}
          glasses
          glassesTilt={f < 55 ? 28 : glassTilt}
          eyes={f < 30 ? "dizzy" : cheer ? "closed" : "normal"}
          mouth={cheer ? "grin" : f >= 100 && f < 260 ? talk(f, 100, 260) : "smile"}
          extras={(p) =>
            f >= 425 && f < 690 ? (
              <line x1={p.rHand.x} y1={p.rHand.y} x2={p.rHand.x + 14} y2={p.rHand.y + 22} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
            ) : null
          }
        />
        {f < 30 && <CirclingStars x={RED_LAND_X - 86 * MS} y={LIE_Y - 60} frame={f + 1500} r={44} />}
        {f < 240 && <CirclingStars x={BLUE_LAND_X + 86 * MS} y={LIE_Y - 60} frame={f + 1520} r={44} />}
      </svg>
      <SpeechBubble x={790} y={STAND_Y - 170} start={100} end={262} side="right" width={600} color={C.red} text="这句子虽然粗糙……但核心观点居然立住了？结构改改就能用！" />
      <SpeechBubble x={1300} y={STAND_Y - 100} start={262} end={412} side="left" width={600} color={C.blue} text="既然骨架都有了，我负责填第二段的例子，赶紧搞完睡觉！" />
      <Pop x={1300} y={300} start={240} text="拍拍" size={30} color={C.blue} rot={0} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Pop key={i} x={880 + i * 40} y={ROCK_Y - 110} start={430 + i * 40} dur={22} text="沙沙" size={28} color={C.red} rot={0} />
      ))}
      {f >= 650 && (
        <div
          style={{
            position: "absolute",
            left: 1000,
            top: 186,
            transform: `translate(-50%,-50%) scale(${banner})`,
            fontFamily: FONT,
            fontSize: 38,
            fontWeight: 900,
            color: C.green,
            border: `4px solid ${C.green}`,
            borderRadius: 14,
            padding: "4px 20px",
            background: "#fff",
          }}
        >
          骨架立住了 ✓
        </div>
      )}
    </AbsoluteFill>
  );
};

const pickLegs = (f: number) => {
  const w = Math.floor(f / 9) % 2 === 0 ? WALK_A : WALK_B;
  return { lKnee: w.lKnee, lFoot: w.lFoot, rKnee: w.rKnee, rFoot: w.rFoot };
};
