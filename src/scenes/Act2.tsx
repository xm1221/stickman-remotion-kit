import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Book, BrawlCloud, ImpactBurst, Slime, SmokePuff } from "../components/Effects";
import {
  DRAG,
  FLAIL,
  HUG_KNEES,
  OVERHEAD,
  POINT,
  poseTrack,
  STAND,
  idleSway,
  walkCycle,
  YELL,
} from "../components/poses";
import { Pop, SpeechBubble } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { ACTS, L } from "../timeline";
import { C, hop, ip, lin, track } from "../utils";
import { heroHead } from "./Desk";
import { pointerStick } from "./Act1";
import { LIE_Y, MS, STAND_Y, talk } from "./common";

const BLUE_X = 1160;
export const CLOUD = { x: 960, y: 300 };

const walkPose = (f: number) => walkCycle(f, 12);

export const Act2: React.FC = () => {
  const f = useCurrentFrame();
  const G = f + ACTS.act2.from;

  // ---------------- RED ----------------
  let redX: number;
  let redFacing: 1 | -1 = 1;
  let redPose = STAND;
  let redRot = 0;
  if (f < 750) {
    redX = 780 + Math.sin(f / 40) * 70;
    redFacing = Math.cos(f / 40) >= 0 ? 1 : -1;
    redPose = f >= 440 && f < 530 ? YELL : f % 160 < 110 ? walkPose(f) : idleSway(POINT, f, 2.5);
  } else if (f < 850) {
    redX = ip(f, [750, 840], [780 + Math.sin(750 / 40) * 70, 470], lin);
    redFacing = -1;
    redPose = walkPose(f);
  } else if (f < 930) {
    redX = ip(f, [850, 930], [470, 880], lin);
    redPose = poseTrack(f, [[850, DRAG], [855, DRAG]]);
    redPose = { ...DRAG, lKnee: walkPose(f).lKnee, lFoot: walkPose(f).lFoot, rKnee: walkPose(f).rKnee, rFoot: walkPose(f).rFoot };
  } else if (f < 1160) {
    redX = 880;
    redPose = poseTrack(f, [
      [930, DRAG],
      [955, OVERHEAD],
      [968, OVERHEAD],
      [985, YELL],
      [1150, YELL],
    ]);
  } else {
    redX = 880;
    redPose = FLAIL;
    redRot = f >= 1200 ? Math.sin(f * 0.6) * 12 : 0;
  }
  const redY = STAND_Y + (f >= 955 && f < 970 ? hop(f, 955, 970, 20) : 0);

  // ---------------- BOOK ----------------
  let book: { x: number; y: number; rot: number } | null = null;
  const bookH = 230;
  if (f >= 850 && f < 930) book = { x: redX - 64 - 70, y: L.ground - bookH / 2, rot: 0 };
  else if (f >= 930 && f < 968) {
    const t = ip(f, [930, 955], [0, 1]);
    book = { x: track(t, [[0, 880 - 134], [1, 880]]), y: track(t, [[0, L.ground - bookH / 2], [1, STAND_Y - 200 - 60]]), rot: 90 * t };
  } else if (f >= 968 && f < 986) {
    const t = ip(f, [968, 985], [0, 1], (x) => x * x);
    book = { x: 880 + (BLUE_X + 20 - 880) * t, y: STAND_Y - 260 + (L.ground - 110 - (STAND_Y - 260)) * t, rot: 90 + 25 * Math.sin(t * Math.PI) };
  } else if (f >= 986 && f < 1150) book = { x: BLUE_X + 20, y: L.ground - 110, rot: 90 + Math.sin((f - 986) * 0.8) * ip(f, [986, 1010], [6, 0]) };
  else if (f >= 1150) {
    const t = ip(f, [1150, 1185], [0, 1]);
    book = { x: BLUE_X + 20 + 150 * t, y: L.ground - 110 + 40 * t, rot: 90 + 8 * Math.sin(t * Math.PI) };
  }

  // ---------------- BLUE ----------------
  const blueSquash = f >= 985 ? ip(f, [985, 990], [1, 0.35]) : 1;
  const blueAlpha = f < 1150 ? 1 : ip(f, [1150, 1175], [1, 0]);
  const slimeT = ip(f, [1165, 1235], [0, 1]);
  const slimeX = BLUE_X + (redX - BLUE_X) * slimeT;
  const slimeY = LIE_Y - 50 + (STAND_Y - 62 * MS - (LIE_Y - 50)) * slimeT;

  // ---------------- CLOUD ----------------
  const cloudS = ip(f, [1355, 1395], [0, 1.15]);
  const fightersAlpha = ip(f, [1360, 1378], [1, 0]);

  // energy particles: thinking drains doing
  const hh = heroHead(G);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {f >= 40 && f < 760 &&
          Array.from({ length: 14 }).map((_, i) => {
            const t = (((f - 40) / 70 + i / 14) % 1 + 1) % 1;
            const x = 480 + (hh.x + 40 - 480) * Math.min(1, t * 2) + (t > 0.5 ? (960 - hh.x - 40) * (t - 0.5) * 2 : 0);
            const y = 705 + (hh.y - 60 - 705) * Math.min(1, t * 2) + (t > 0.5 ? (360 - hh.y + 60) * (t - 0.5) * 2 : 0);
            return <circle key={i} cx={x} cy={y} r={7 * (1 - t * 0.5)} fill={C.green} opacity={0.75 * (1 - t) * ip(f, [40, 80, 700, 760], [0, 1, 1, 0])} />;
          })}
        {/* grumble lightning between them */}
        {f >= 300 && f < 750 && Math.floor(f / 6) % 3 !== 0 && (
          <path d={`M${1000} ${300} l20 -24 l-6 24 l22 -20`} stroke="#868e96" strokeWidth={4} fill="none" strokeLinecap="round" />
        )}
        {f < 1175 && (
          <StickFigure
            pose={HUG_KNEES}
            x={BLUE_X}
            y={LIE_Y}
            scale={MS}
            scaleY={blueSquash}
            rotate={f < 985 ? Math.sin(f / 11) * 7 : 0}
            facing={-1}
            color={C.blue}
            eyes={f >= 985 ? "dizzy" : "sad"}
            mouth={f >= 985 ? "open" : "frown"}
            opacity={blueAlpha}
          />
        )}
        {book && <Book x={book.x} y={book.y} rot={book.rot} h={bookH} />}
        {f < 1378 && (
          <StickFigure
            pose={redPose}
            x={redX}
            y={redY}
            scale={MS}
            rotate={redRot}
            facing={redFacing}
            color={C.red}
            glasses
            eyes={f >= 1180 ? "wide" : "angry"}
            mouth={f >= 1180 ? "open" : f >= 985 && f < 1150 ? talk(f, 985, 1150) : f >= 440 && f < 530 ? "open" : talk(f, 120, 280)}
            opacity={fightersAlpha}
            extras={(p) => (f < 750 ? pointerStick(p) : null)}
          />
        )}
        {f >= 1165 && f < 1378 && (
          <g opacity={fightersAlpha}>
            <Slime x={slimeX} y={slimeY} frame={f} scale={ip(f, [1165, 1185], [0.3, 0.75])} />
          </g>
        )}
        <ImpactBurst x={BLUE_X} y={L.ground - 70} t={f - 985} size={80} />
        {cloudS > 0 && <BrawlCloud x={CLOUD.x} y={CLOUD.y} frame={f} scale={cloudS} />}
        {f >= 1380 &&
          Array.from({ length: 12 }).map((_, i) => (
            <SmokePuff key={i} x={CLOUD.x + ((i % 3) - 1) * 120} y={CLOUD.y - 60} t={f - (1380 + i * 22)} seed={`c${i}`} />
          ))}
        {/* heartbeat vignette */}
        {f >= 450 && f < 750 && (
          <rect x={0} y={0} width={1920} height={1080} fill="url(#vig)" opacity={0.35 + 0.35 * Math.max(0, Math.sin(f * 0.3))} />
        )}
        <defs>
          <radialGradient id="vig" cx="50%" cy="60%" r="70%">
            <stop offset="60%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#7a0000" stopOpacity={0.6} />
          </radialGradient>
        </defs>
      </svg>

      <SpeechBubble x={780} y={STAND_Y - 180} start={120} end={280} side="left" width={420} color={C.red} text="要引经据典！要有高度！" />
      <SpeechBubble x={BLUE_X - 30} y={LIE_Y - 150} start={290} end={430} side="right" width={360} color={C.blue} text="好难啊……写不动……" />
      <SpeechBubble x={780} y={STAND_Y - 180} start={440} end={535} side="left" width={380} color={C.red} shout text="删掉！太浅了！" />
      <SpeechBubble x={BLUE_X - 30} y={LIE_Y - 150} start={560} end={720} side="right" width={380} color={C.blue} text="要不……先睡一会儿？" />
      <Pop x={470} y={300} start={845} text="嘿咻——" size={36} color={C.red} dur={40} rot={0} />
      <Pop x={BLUE_X} y={250} start={985} text="咚！！" size={80} />
      <SpeechBubble x={850} y={STAND_Y - 180} start={992} end={1150} side="left" width={460} color={C.red} shout text="这句太俗！重写！立意要高！" />
      <SpeechBubble x={1000} y={160} start={1210} end={1360} side="right" width={560} color={C.blue} text="写不出来！根本做不到！干脆摆烂重修吧！" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Pop
          key={i}
          x={CLOUD.x + [-200, 210, -160, 190, -220, 230, -150, 200, -180][i]}
          y={CLOUD.y + [-120, -90, 110, 90, -40, 30, -130, 120, 60][i]}
          start={1400 + i * 28}
          text={["砰！", "啪！", "嘭！", "咣！", "砰！", "啪！", "呼——", "咚！", "啪！"][i]}
          size={50}
          color={i % 2 ? C.blue : C.red}
          rot={i % 2 ? 10 : -10}
        />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <Pop key={`h${i}`} x={hh.x - 70} y={hh.y + 90} start={450 + i * 23} dur={14} text="咚" size={34} color="#c92a2a" rot={0} />
      ))}
      <SpeechBubble x={hh.x - 40} y={hh.y - 30} start={1500} end={1630} side="left" width={220} color="#868e96" fontSize={28} text="唉……" />
    </AbsoluteFill>
  );
};
