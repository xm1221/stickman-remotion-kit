import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ImpactBurst, MindCursor, Plaque, RedX } from "../components/Effects";
import {
  ARMS_CROSS,
  DRAG,
  idleSway,
  offsetPose,
  OVERHEAD,
  Pose,
  SHRINK,
  SIT_DESK,
  SIT_SLUMP,
  STAND,
  SWING_DOWN,
  walkCycle,
} from "../components/poses";
import { Pop, SpeechBubble } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { ACTS, HEARTBEAT, heartbeat, loopAt, LOOPS } from "../timeline";
import { C, FONT, ip, lin, track } from "../utils";
import { Chair, headY, moving, MS, SIT_Y, STAND_Y, talk } from "./common";

const PQ = { x: 1200, y: 200, w: 440 };
const RED_HOME = 1480;
const BLUE_HOME = 640;
const BLACK_X = 900;

/** mind-theater writing desk */
export const MindDesk: React.FC<{ x: number; frame: number; glow?: boolean }> = ({ x, frame, glow = true }) => (
  <g stroke="#111" strokeWidth={5} strokeLinecap="round">
    <line x1={x - 60} y1={318} x2={x + 90} y2={318} />
    <line x1={x - 50} y1={318} x2={x - 50} y2={432} />
    <line x1={x + 80} y1={318} x2={x + 80} y2={432} />
    <rect x={x - 6} y={262} width={78} height={52} rx={5} fill="#fff" strokeWidth={4} />
    {glow && <rect x={x + 2} y={270} width={62} height={36} fill="#e7f5ff" stroke="none" opacity={0.6 + 0.4 * Math.sin(frame / 10)} />}
  </g>
);

export const Act2: React.FC = () => {
  const F = useCurrentFrame() + ACTS.act2.from;
  const lp = loopAt(F);
  const idx = lp ? LOOPS.indexOf(lp) : -1;
  const fast = idx >= 2;
  const inHeart = F >= HEARTBEAT.from;
  const beat = inHeart ? heartbeat(F) : 0;

  // ------------------------------------------------ RED track
  const redKeys: [number, number][] = [[1600, RED_HOME]];
  for (const [i, l] of LOOPS.entries()) {
    if (l.killer !== "red") continue;
    if (i === 0) {
      redKeys.push([l.d0 - 70, RED_HOME], [l.d0 - 42, 1470], [l.d1 + 20, 1470], [l.d1 + 60, RED_HOME]);
    }
  }
  redKeys.push([2500, RED_HOME], [2540, 1470], [3140, 1470], [3180, 1400]);
  const rx = track(F, redKeys);
  // red pose
  let rPose: Pose = idleSway(ARMS_CROSS, F, 2.5);
  let holdX = false;
  const redLoop = LOOPS.find((l) => l.killer === "red" && F >= l.d0 - 40 && F < l.d0 + 14);
  if (fast && F < HEARTBEAT.from) {
    rPose = idleSway(OVERHEAD, F, 2);
    holdX = true;
  }
  if (redLoop) {
    const a = redLoop.d0 - 40;
    rPose = F < redLoop.d0 - 8 ? idleSway(OVERHEAD, F, 2) : F < redLoop.d0 + 6 ? SWING_DOWN : OVERHEAD;
    holdX = F < redLoop.d0 - 6 || fast;
    if (F < a + 6) rPose = STAND;
  }
  if (moving(F, redKeys)) rPose = walkCycle(F, 10);
  const rFacing: 1 | -1 = -1;

  // ------------------------------------------------ BLUE track
  const blueKeys: [number, number][] = [[1600, BLUE_HOME]];
  const l1 = LOOPS[1];
  blueKeys.push(
    [l1.d0 - 80, BLUE_HOME],
    [l1.d0 - 66, 690],
    [l1.d0 - 56, 690], // hesitate
    [l1.d0 - 44, 760],
    [l1.d0, 760],
    [l1.d1, 640],
    [2520, 640],
    [2550, 760],
  );
  for (const [i, l] of LOOPS.entries()) {
    if (i < 2 || l.killer !== "blue") continue;
    blueKeys.push([l.d0, 760], [l.d1, 700], [l.d1 + 20, 760]);
  }
  blueKeys.push([3140, 760], [3170, 720]);
  const ux = track(F, blueKeys);
  let uPose: Pose = idleSway(SHRINK, F, 2);
  const blueLoop = LOOPS.find((l) => l.killer === "blue" && F >= l.d0 - 40 && F < l.d1 + 10);
  const roping = (blueLoop && F >= blueLoop.d0 - 40) || (fast && F < HEARTBEAT.from);
  if (roping) uPose = offsetPose(SHRINK, { rElbow: { x: 10, y: -2 }, rHand: { x: 26, y: -8 } });
  const pulling = blueLoop && F >= blueLoop.d0 && F < blueLoop.d1;
  if (moving(F, blueKeys)) uPose = pulling ? offsetPose(walkCycle(F, 10), { head: { x: 12, y: 6 }, neck: { x: 8, y: 4 }, rHand: { x: 30, y: -22 }, rElbow: { x: 16, y: -12 }, lHand: { x: 28, y: -18 } }) : walkCycle(F, 12);
  if (pulling && !moving(F, blueKeys)) uPose = DRAG;
  const uFacing: 1 | -1 = pulling ? -1 : 1;

  // ------------------------------------------------ BLACK at desk
  let bPose: Pose = SIT_DESK;
  const typingNow = lp && F >= lp.t0 && F < lp.t1;
  if (typingNow) {
    const sh = idx < 2 ? Math.sin(F * 2.4) * 2 : 0;
    bPose = offsetPose(SIT_DESK, {
      lHand: { x: sh, y: -Math.abs(Math.sin(F * 0.8)) * 6 },
      rHand: { x: -sh, y: -Math.abs(Math.sin(F * 0.8 + 1.6)) * 6 },
    });
  }
  if (inHeart) bPose = SIT_SLUMP;
  const bEyes = inHeart ? "closed" : lp && F >= lp.d0 ? "dizzy" : "sad";

  // ------------------------------------------------ plaque / cursor
  let plaqueText = "";
  let plaqueT = -1;
  let cursorX = PQ.x - PQ.w / 2 + 18;
  if (lp) {
    const typedN = Math.floor(ip(F, [lp.t0, lp.t1], [0, lp.text.length], lin));
    plaqueText = lp.text.slice(0, typedN);
    if (lp.killer === "red" && F >= lp.d0) plaqueT = F - lp.d0;
    if (lp.killer === "blue" && F >= lp.d0) {
      const n = lp.text.length - Math.floor(ip(F, [lp.d0, lp.d1], [0, lp.text.length], lin));
      plaqueText = lp.text.slice(0, Math.max(0, n));
    }
    cursorX = PQ.x - PQ.w / 2 + 18 + plaqueText.length * 24;
  }
  const plaqueO = lp ? ip(F, [lp.t0, lp.t0 + 6, lp.d1, lp.d1 + 6], [0, 1, 1, 0]) : 0;

  // blue's rope hand (global)
  const handG = { x: ux + uFacing * (uPose.rHand.x * MS), y: STAND_Y + uPose.rHand.y * MS };
  const ropeOn = roping && lp && F >= lp.t0;
  const throwK = blueLoop ? ip(F, [blueLoop.d0 - 40, blueLoop.d0 - 25], [0, 1]) : 1;
  const rope = ropeOn
    ? {
        x2: handG.x + (cursorX - handG.x) * throwK,
        y2: handG.y + (PQ.y + 24 - handG.y) * throwK,
      }
    : null;
  const sag = pulling ? 4 : 30;

  // red X stamp
  const stamp = LOOPS.find((l) => l.killer === "red" && F >= l.d0 - 2 && F < l.d0 + 28);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <MindDesk x={1000} frame={F} />
        <Chair x={BLACK_X} back={-1} />
        {plaqueO > 0 && (
          <g opacity={plaqueO}>
            <Plaque x={PQ.x} y={PQ.y} w={PQ.w} text={plaqueText} t={plaqueT} />
          </g>
        )}
        {lp && plaqueT < 0 && plaqueO > 0 && <MindCursor x={cursorX + 4} y={PQ.y + 24} h={50} blink={Math.floor(F / 8) % 2 === 0 || !!pulling} />}
        {rope && (
          <path
            d={`M${handG.x} ${handG.y} Q ${(handG.x + rope.x2) / 2} ${(handG.y + rope.y2) / 2 + sag} ${rope.x2} ${rope.y2}`}
            stroke="#8d6e63"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {inHeart && <MindCursor x={1200} y={300 + beat * 20} h={120 * (1 + beat * 0.5)} />}
        <StickFigure pose={bPose} x={BLACK_X} y={SIT_Y} scale={MS} color={C.black} eyes={bEyes} mouth={inHeart ? "frown" : "flat"} />
        <StickFigure
          pose={uPose}
          x={ux}
          y={STAND_Y}
          scale={MS}
          scaleY={0.93}
          facing={uFacing}
          color={C.blue}
          eyes={pulling ? "closed" : "sad"}
          mouth={blueLoop === LOOPS[1] ? talk(F, l1.d0 - 40, l1.d0 + 80) : "frown"}
        />
        <StickFigure
          pose={rPose}
          x={rx}
          y={STAND_Y}
          scale={MS}
          facing={rFacing}
          color={C.red}
          glasses
          eyes="angry"
          mouth={redLoop === LOOPS[0] ? talk(F, LOOPS[0].d0 - 20, LOOPS[0].d0 + 90) : "frown"}
          extras={(p) =>
            holdX ? <RedX x={(p.lHand.x + p.rHand.x) / 2} y={(p.lHand.y + p.rHand.y) / 2 - 22} size={26} rot={rPose === SWING_DOWN ? 30 : 0} /> : null
          }
        />
        {stamp && (
          <RedX x={PQ.x} y={PQ.y} size={ip(F, [stamp.d0 - 2, stamp.d0 + 4], [140, 90])} opacity={ip(F, [stamp.d0 + 18, stamp.d0 + 28], [1, 0])} rot={-6} />
        )}
        {stamp && <ImpactBurst x={PQ.x} y={PQ.y} t={F - stamp.d0} size={90} />}
      </svg>
      <SpeechBubble frame={F} x={1340} y={headY(STAND_Y) - 40} start={LOOPS[0].d0 + 4} end={LOOPS[0].d0 + 110} side="left" width={620} color={C.red} shout text="太庸俗！小学生文笔！删掉重写！" />
      <SpeechBubble frame={F} x={780} y={headY(STAND_Y, -76) - 30} start={l1.d0 - 30} end={l1.d0 + 95} side="right" width={600} color={C.blue} text="太枯燥写不下去的，明早再写吧！" />
      {LOOPS.map((l, i) =>
        i >= 1 ? (
          <Pop key={i} x={1200} y={292} start={l.d0} dur={Math.min(40, l.d1 - l.d0 + 14)} text={`重写 ×${i + 1}`} size={40} color="#868e96" rot={0} frame={F} />
        ) : null,
      )}
      <Pop x={PQ.x} y={PQ.y} start={LOOPS[0].d0} dur={26} text="咔嚓！" size={64} color={C.red} frame={F} />
      <Pop x={900} y={150} start={l1.d0 + 4} dur={30} text="嗖——" size={46} color={C.blue} frame={F} />
      {inHeart && (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1920,
            top: 470,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 30,
            color: "#c92a2a",
            fontWeight: 800,
            opacity: ip(F, [HEARTBEAT.from + 60, HEARTBEAT.from + 90, 3760, 3790], [0, 0.85, 0.85, 0]),
          }}
        >
          敲了 2500 次键盘，留下 0 个字。
        </div>
      )}
    </AbsoluteFill>
  );
};
