import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CirclingStars, Eraser, ImpactBurst, IronBall, Keycap, Shockwave, SmokePuff, StandardWall, Zzz } from "../components/Effects";
import {
  ARMS_CROSS,
  BUILD_WALL,
  CARRY,
  FLAIL,
  HUG_KNEES,
  idleSway,
  LIE_DAZED,
  lerpPose,
  offsetPose,
  Pose,
  POINT,
  PULL_KEYCAP,
  SHRINK,
  SIT_GROUND,
  SLEEP_UNDER_WALL,
  STAND,
  walkCycle,
} from "../components/poses";
import { Pop, SpeechBubble } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { ACTS, KEYCAP, ROUGH1, ROUGH2, ROUGH_T } from "../timeline";
import { C, FONT, hop, ip, lin, track } from "../utils";
import { headY, LIE_Y, moving, MS, STAND_Y } from "./common";

const WALL_X = 1180;
const WALL_L = WALL_X - 186;
const BALL_R = 78;
const BALL_Y = 430 - BALL_R;
const IMPACT = 4830;
export const BALL_END_X = 1330;

/** ball centre x over time (global frames) */
const BALL_X: [number, number][] = [
  [4705, 680],
  [4740, 790],
  [4790, 830],
  [IMPACT, WALL_L - BALL_R + 10],
  [4900, 1250],
  [5100, 1250],
  [5560, BALL_END_X],
];

export const Act3: React.FC = () => {
  const F = useCurrentFrame() + ACTS.act3.from;

  // ------------------------------------------------ wall
  const built = Math.floor(ip(F, [3815, 4050], [0, 33], lin));
  const labelO = ip(F, [4055, 4075], [0, 1]);
  const wallT = F >= IMPACT ? F - IMPACT : -1;

  // ------------------------------------------------ RED
  const redKeys: [number, number][] = [
    [3800, 930],
    [4700, 930],
    [4730, 905],
    [4740, 790 + BALL_R + 34],
    [4790, 830 + BALL_R + 34],
  ];
  let rx = track(F, redKeys);
  let ry = STAND_Y;
  let rRot = 0;
  let rPose: Pose = idleSway(ARMS_CROSS, F, 2);
  if (F < 4055) {
    const ph = Math.floor((F - 3800) / 14) % 2;
    rPose = idleSway(ph ? BUILD_WALL : CARRY, F, 3);
  }
  if (F >= 4700 && F < 4740) rPose = moving(F, redKeys) ? walkCycle(F, 8) : POINT;
  let eraserT = -1;
  if (F >= 4740 && F < 4792) {
    rPose = offsetPose(POINT, { rHand: { x: 0, y: Math.sin(F * 1.4) * 10 }, lKnee: { x: 8, y: 0 }, lFoot: { x: 20, y: 0 } });
    rx = track(F, BALL_X) + BALL_R + 34;
  }
  if (F >= 4790) eraserT = F - 4790;
  if (F >= 4792 && F < 4840) {
    // knocked flying back over to the left
    const t = ip(F, [4792, 4840], [0, 1], lin);
    rx = 864 + (470 - 864) * t;
    ry = STAND_Y + hop(F, 4792, 4840, 220) + ip(F, [4820, 4840], [0, LIE_Y - STAND_Y]);
    rRot = -t * 340;
    rPose = FLAIL;
  }
  if (F >= 4840) {
    rx = 470;
    ry = LIE_Y;
    rPose = F < 5000 ? LIE_DAZED : SIT_GROUND;
  }
  const rFacing: 1 | -1 = F < 4700 ? 1 : -1;
  const rEyes = F >= 4792 ? "dizzy" : F >= 4700 ? "wide" : "angry";
  const rMouth = F >= 4055 && F < 4700 ? "smile" : F >= 4700 && F < 4792 ? "grit" : "frown";

  // ------------------------------------------------ BLUE
  let uPose: Pose = SLEEP_UNDER_WALL;
  let ux = 1450;
  let uy = LIE_Y;
  let uFacing: 1 | -1 = -1;
  if (F >= 4840) {
    uFacing = -1;
    ux = 1500;
    uy = STAND_Y + hop(F, 4840, 4870, 90);
    uPose = F < 4870 ? FLAIL : idleSway(SHRINK, F, 2);
  }
  const uEyes = F >= 4840 ? "wide" : "closed";

  // ------------------------------------------------ BLACK
  const bKeys: [number, number][] = [
    [3800, 560],
    [4900, 560],
    [5000, 1250 - BALL_R - 52],
    [5100, 1250 - BALL_R - 52],
    [5560, BALL_END_X - BALL_R - 52],
  ];
  const bx = track(F, bKeys);
  let by = LIE_Y;
  let bPose: Pose = HUG_KNEES;
  if (F >= 4100 && F < 4130) bPose = offsetPose(HUG_KNEES, { head: { x: 0, y: -10 }, neck: { x: 0, y: -4 } });
  if (F >= 4130) {
    const k = ip(F, [4130, 4155], [0, 1]);
    bPose = lerpPose(HUG_KNEES, STAND, k);
    by = LIE_Y + (STAND_Y - LIE_Y) * k;
  }
  if (F >= 4155) bPose = idleSway(STAND, F, 2);
  if (F >= 4260 && F < KEYCAP.pop + 10) {
    const strain = F >= KEYCAP.pryStart ? Math.sin(F * 2.8) * 3 : 0;
    bPose = offsetPose(PULL_KEYCAP, { head: { x: strain, y: 0 } });
  }
  const gathering = F >= ROUGH_T.a0 && F < 4705;
  if (gathering) bPose = idleSway(CARRY, F, 2);
  if (F >= 4700 && F < 4720) bPose = POINT;
  if (moving(F, bKeys)) bPose = walkCycle(F, 12);
  else if (F >= 5000) bPose = offsetPose(CARRY, { lHand: { x: 10, y: 10 }, rHand: { x: 10, y: 10 }, head: { x: 10, y: 4 } });
  if (F >= 5100 && F < 5560) bPose = offsetPose(walkCycle(F, 20), { lHand: { x: 34, y: -30 }, rHand: { x: 34, y: -30 }, lElbow: { x: 20, y: -14 }, rElbow: { x: 20, y: -14 } });
  const bEyes = F >= 4100 ? "determined" : "sad";
  const bMouth = F >= 5300 ? "smile" : F >= 4100 ? "grit" : "frown";

  // giant keycap in the mind (pulled out of the ground)
  const pry = ip(F, [KEYCAP.pryStart, KEYCAP.pop], [0, 1], (t) => t * t);
  let kc = { x: 660, y: 418 - pry * 14, rot: -pry * 10, o: F >= 4240 ? ip(F, [4240, 4256], [0, 1]) : 0 };
  if (F >= KEYCAP.pop) {
    const t = ip(F, [KEYCAP.pop, KEYCAP.land], [0, 1], lin);
    kc = { x: 660 + (400 - 660) * t, y: 404 + hop(F, KEYCAP.pop, KEYCAP.land, 220) + t * 10, rot: -10 - t * 400, o: ip(F, [4880, 4920], [1, 0]) };
  }

  // ------------------------------------------------ ball
  const ballGrow = ip(F, [ROUGH_T.a0 + 10, 4700], [0, 1]);
  let ball: { x: number; y: number; r: number; rot: number; speed: number } | null = null;
  if (F >= ROUGH_T.a0 + 10 && F < 4705) {
    ball = { x: bx + 96, y: STAND_Y - 50, r: 14 + (BALL_R - 14) * ballGrow, rot: 0, speed: 0 };
  } else if (F >= 4705) {
    const x = track(F, BALL_X);
    const y = F < 4720 ? ip(F, [4705, 4720], [STAND_Y - 50, BALL_Y]) : BALL_Y;
    const v = Math.abs(track(F + 1, BALL_X) - x);
    ball = { x, y, r: BALL_R, rot: ((x - 680) / BALL_R) * 57.3 * 0.25, speed: v > 2 ? Math.min(6, v / 2) : 0 };
  }
  // flying text glyphs (typed words turning into the ball)
  const glyphSrc = ROUGH1 + ROUGH2;
  const glyphs = gathering
    ? Array.from({ length: 14 }).map((_, i) => {
        const t = ((F - ROUGH_T.a0 + i * 9) % 40) / 40;
        const ch = glyphSrc[(Math.floor((F - ROUGH_T.a0) / 40) * 3 + i) % glyphSrc.length];
        const sx = 960 + (i - 7) * 30;
        return { x: sx + (bx + 96 - sx) * t, y: 520 + (STAND_Y - 50 - 520) * t, ch, o: 1 - t * 0.6 };
      })
    : [];

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* brick pile */}
        {F < 4060 && (
          <g opacity={ip(F, [4040, 4060], [1, 0])}>
            {[0, 1, 2].map((i) => (
              <rect key={i} x={800 + (i % 2) * 18} y={398 - i * 30} width={58} height={30} rx={3} fill="#ffe3e3" stroke="#e03131" strokeWidth={3} />
            ))}
          </g>
        )}
        <StandardWall x={WALL_X} ground={430} built={built} t={wallT} label={labelO} />
        {wallT >= 0 && <Shockwave x={WALL_L} y={430} t={wallT} max={520} />}
        {wallT >= 0 && [0, 1, 2, 3, 4, 5].map((i) => <SmokePuff key={i} x={WALL_L + 40 + i * 50} y={400} t={wallT - i * 3} seed={`wd${i}`} dark={false} />)}

        {kc.o > 0 && <Keycap x={kc.x} y={kc.y} w={150} h={46} rot={kc.rot} glow={F >= KEYCAP.pryStart && F < KEYCAP.pop ? 0.6 : 0} />}
        {F >= 4240 && F < KEYCAP.pop && <rect x={580} y={424} width={160} height={10} fill="#f8f9fa" />}

        <StickFigure pose={uPose} x={ux} y={uy} scale={MS} facing={uFacing} scaleY={F >= 4870 ? 0.93 : 1} color={C.blue} eyes={uEyes} mouth={F >= 4840 ? "open" : "flat"} />
        {F < 4840 && <Zzz x={1560} y={360} frame={F} />}

        <StickFigure pose={bPose} x={bx} y={by} scale={MS} color={C.black} eyes={bEyes} mouth={bMouth} />

        {glyphs.map((g, i) => (
          <text key={i} x={g.x} y={g.y} fontSize={24} fontWeight={900} fontFamily={FONT} fill="#111" opacity={g.o} textAnchor="middle">
            {g.ch}
          </text>
        ))}
        {ball && <IronBall x={ball.x} y={ball.y} r={ball.r} rot={ball.rot} speed={ball.speed} />}

        <StickFigure
          pose={rPose}
          x={rx}
          y={ry}
          scale={MS}
          rotate={rRot}
          facing={rFacing}
          color={C.red}
          glasses
          eyes={rEyes}
          mouth={rMouth}
          extras={(p) => (
            <>
              {F < 4055 && (
                <rect x={(p.lHand.x + p.rHand.x) / 2 - 20} y={(p.lHand.y + p.rHand.y) / 2 - 22} width={40} height={20} rx={2} fill="#ffe3e3" stroke="#e03131" strokeWidth={2.5} />
              )}
              {F >= 4720 && eraserT < 0 && <Eraser x={p.rHand.x + 30} y={p.rHand.y} s={0.62} rot={Math.sin(F * 1.4) * 12} />}
            </>
          )}
        />
        {eraserT >= 0 && <Eraser x={830 + BALL_R + 10} y={STAND_Y - 40} t={eraserT} s={0.9} />}
        {F >= 4850 && F < 5300 && <CirclingStars x={470 + 6 * MS} y={LIE_Y - 60} frame={F} r={40} />}
        <ImpactBurst x={WALL_L} y={350} t={F - IMPACT} size={110} />
        <ImpactBurst x={870} y={STAND_Y - 40} t={F - 4790} size={70} />
      </svg>
      <Pop x={560} y={300} start={4100} dur={30} text="！" size={70} frame={F} />
      <Pop x={660} y={330} start={KEYCAP.pop} dur={26} text="拔！" size={60} color="#111" frame={F} />
      <SpeechBubble frame={F} x={930} y={headY(STAND_Y) - 40} start={4705} end={4790} side="right" width={360} color={C.red} shout text="擦掉！擦掉它！" />
      <Pop x={880} y={230} start={4790} dur={30} text="咔嚓！" size={64} color={C.red} frame={F} />
      <Pop x={1080} y={250} start={IMPACT} dur={40} text="轰——！！" size={90} color="#111" frame={F} />
      <Pop x={1500} y={250} start={4842} dur={30} text="？！" size={56} color={C.blue} frame={F} />
      <Pop x={1180} y={180} start={5320} dur={70} text="继续！" size={44} color="#111" rot={0} frame={F} />
    </AbsoluteFill>
  );
};
