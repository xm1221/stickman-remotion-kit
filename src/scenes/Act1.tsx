import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ImpactBurst, Phone, Pillow, SmokePuff } from "../components/Effects";
import {
  ARMS_CROSS,
  FLAIL,
  HANDS_HIP,
  KICK,
  LIE_PHONE,
  offsetPose,
  PHONE_HOLD,
  POINT,
  poseTrack,
  STAND,
  SWING_DOWN,
  SWING_UP,
  WALK_A,
  WALK_B,
  YELL,
} from "../components/poses";
import { Pop, SpeechBubble } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { C, hop, ip, lin, track } from "../utils";
import { LIE_Y, MS, STAND_Y, talk } from "./common";

/** teacher's pointer stick drawn from the hand along the forearm direction */
export const pointerStick = (p: ReturnType<typeof poseTrack>, color = C.red) => {
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

const BLUE_LIE_X = 1180;
const PHONE0 = { x: BLUE_LIE_X + (LIE_PHONE.rHand.x + 4) * MS, y: LIE_Y + (LIE_PHONE.rHand.y - 6) * MS };
const KICK_X = PHONE0.x - KICK.rFoot.x * MS;
const RED_HEAD_Y = STAND_Y + STAND.head.y * MS;

export const Act1: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 280) {
    const o = ip(f, [20, 60, 240, 280], [0, 1, 1, 0]);
    return (
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: 200,
            width: "100%",
            textAlign: "center",
            fontSize: 72,
            fontWeight: 900,
            color: "#111",
            opacity: o,
            fontFamily: '"Noto Serif CJK SC",serif',
            letterSpacing: 12,
          }}
        >
          《指针与光标》
          <div style={{ fontSize: 28, fontWeight: 400, color: "#868e96", letterSpacing: 4, marginTop: 16 }}>
            一个关于“想”与“做”的晚上
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ----- RED (完美怪) -----
  const redX = track(f, [
    [360, 960],
    [395, 890],
    [810, 890],
    [858, KICK_X],
    [962, KICK_X],
    [968, KICK_X - 26],
    [1000, KICK_X - 16],
  ]);
  const redScale = ip(f, [360, 372], [0.2, MS]);
  let redPose = poseTrack(f, [
    [360, STAND],
    [395, STAND],
    [425, YELL],
    [470, YELL],
    [490, POINT],
    [600, POINT],
    [625, ARMS_CROSS],
    [800, ARMS_CROSS],
    [812, HANDS_HIP],
    [822, WALK_A],
    [834, WALK_B],
    [846, WALK_A],
    [858, KICK],
    [890, KICK],
    [905, HANDS_HIP],
    [962, HANDS_HIP],
    [966, FLAIL],
    [990, FLAIL],
    [1005, HANDS_HIP],
  ]);
  if (f >= 490 && f < 600) redPose = offsetPose(redPose, { rHand: { x: 0, y: Math.sin(f * 0.5) * 8 } });
  const redRot = track(f, [
    [962, 0],
    [967, -24],
    [985, -8],
    [998, -26],
    [1010, 0],
  ]);
  const redFacing = f < 805 ? -1 : 1;
  const redEyes = f >= 964 && f < 1010 ? "closed" : f >= 425 ? "angry" : "normal";

  // ----- BLUE (畏难怪) -----
  const blueX = track(f, [
    [360, 960],
    [395, 1030],
    [640, 1030],
    [680, BLUE_LIE_X],
    [905, BLUE_LIE_X],
    [935, KICK_X + 112],
  ]);
  const blueY = track(f, [
    [640, STAND_Y],
    [680, LIE_Y],
    [905, LIE_Y],
    [930, STAND_Y],
  ]) + hop(f, 905, 935, 70);
  const blueScale = ip(f, [360, 372], [0.2, MS]);
  const bluePose = poseTrack(f, [
    [360, STAND],
    [395, STAND],
    [600, STAND],
    [620, PHONE_HOLD],
    [640, PHONE_HOLD],
    [680, LIE_PHONE],
    [905, LIE_PHONE],
    [930, STAND],
    [940, SWING_UP],
    [958, SWING_UP],
    [964, SWING_DOWN],
    [980, SWING_UP],
    [994, SWING_UP],
    [1000, SWING_DOWN],
    [1030, HANDS_HIP],
  ]);
  const blueFacing = f < 900 ? 1 : -1;
  const hasPhone = f >= 620 && f < 862;
  const hasPillow = f >= 935;

  // flying phone
  const phoneT = ip(f, [862, 905], [0, 1], lin);
  const phoneX = PHONE0.x + (1680 - PHONE0.x) * phoneT;
  const phoneY = PHONE0.y + (80 - PHONE0.y) * phoneT + hop(f, 862, 905, 140);
  const startY = (y: number) => y + hop(f, 360, 395, 110);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {[0, 1, 2, 3].map((i) => (
          <SmokePuff key={i} x={930 + i * 30} y={400} t={f - 360 - i * 2} seed={`e${i}`} dark={false} />
        ))}
        <StickFigure
          pose={bluePose}
          x={blueX}
          y={f < 395 ? startY(STAND_Y) : blueY}
          scale={blueScale}
          facing={blueFacing}
          color={C.blue}
          eyes={f >= 862 && f < 905 ? "wide" : f >= 905 ? "angry" : f >= 680 ? "closed" : "normal"}
          mouth={f >= 640 && f < 862 ? "smile" : f >= 905 ? "grit" : talk(f, 640, 800)}
          extras={(p) => (
            <>
              {hasPhone && <Phone x={p.rHand.x + 4} y={p.rHand.y - 6} frame={f} />}
              {hasPillow && <Pillow x={(p.lHand.x + p.rHand.x) / 2} y={(p.lHand.y + p.rHand.y) / 2 - 14} rot={p.rHand.y < -90 ? -20 : 30} />}
            </>
          )}
        />
        <StickFigure
          pose={redPose}
          x={redX}
          y={f < 395 ? startY(STAND_Y) : STAND_Y}
          scale={redScale}
          rotate={redRot}
          facing={redFacing}
          color={C.red}
          glasses
          eyes={redEyes}
          mouth={f >= 425 && f < 600 ? talk(f, 425, 600) : f >= 800 ? "frown" : "flat"}
          extras={(p) => (f >= 425 && f < 812 ? pointerStick(p) : null)}
        />
        {f >= 862 && f < 905 && <Phone x={phoneX} y={phoneY} rot={(f - 862) * 25} frame={f} />}
        <ImpactBurst x={PHONE0.x} y={PHONE0.y} t={f - 860} />
        <ImpactBurst x={KICK_X + 10} y={RED_HEAD_Y} t={f - 964} />
        <ImpactBurst x={KICK_X + 10} y={RED_HEAD_Y} t={f - 1000} />
      </svg>
      <Pop x={960} y={360} start={360} text="嘭！" size={48} />
      <SpeechBubble x={870} y={RED_HEAD_Y - 40} start={440} end={605} side="left" width={560} color={C.red} shout text="慢着！第一句不够深刻震撼怎么行？必须先通读三本原著！" />
      <SpeechBubble x={1080} y={RED_HEAD_Y - 30} start={630} end={800} side="right" width={520} color={C.blue} text="就是就是，既然任务这么宏大，先刷 10 分钟短视频找灵感嘛～" />
      <SpeechBubble x={KICK_X - 10} y={RED_HEAD_Y - 40} start={806} end={852} side="left" width={160} color={C.red} shout text="哼！" />
      <Pop x={PHONE0.x + 40} y={PHONE0.y - 70} start={862} text="砰！" size={60} />
      <Pop x={1500} y={110} start={890} text="我的手机——" size={30} color={C.blue} dur={30} rot={0} />
      <Pop x={KICK_X - 30} y={RED_HEAD_Y - 70} start={964} text="啪！" size={60} color={C.blue} />
      <Pop x={KICK_X - 60} y={RED_HEAD_Y - 80} start={1000} text="啪！！" size={66} color={C.blue} />
      <Pop x={720} y={640} start={455} text="？" size={56} dur={40} />
    </AbsoluteFill>
  );
};
