import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IronBall, SmokePuff, Star, WordBrick } from "../components/Effects";
import {
  ADJUST_GLASSES,
  ASSEMBLY_BRUSH_HI,
  ASSEMBLY_BRUSH_LO,
  ASSEMBLY_CARRY,
  ASSEMBLY_LAY,
  CHEER,
  idleSway,
  lerpPose,
  offsetPose,
  Pose,
  SCRATCH_HEAD,
  SHRINK,
  SIT_GROUND,
  STAND,
  walkCycle,
} from "../components/poses";
import { Pop, SpeechBubble } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { ACTS } from "../timeline";
import { C, hop, ip, lin, track } from "../utils";
import { headY, LIE_Y, moving, MS, STAND_Y, talk } from "./common";
import { BALL_END_X } from "./Act3";

const N = 12;
const B0 = 1480;
const BW = 96;
const T0 = 6010;
const PER = 36;
const brickX = (i: number) => B0 - i * BW;
const laidAt = (i: number) => T0 + i * PER;
const paintAt = (i: number) => laidAt(i) + 60;
const RAW = ["废话", "大白话", "开头", "例子", "吐槽", "想法", "废话", "草稿", "句子", "段落", "废话", "结尾"];
const PAINTED = ["矛盾", "同一性", "斗争性", "普遍性", "特殊性", "实践", "认识", "再实践", "量变", "质变", "统一", "完成"];
const SUCCESS = 6650;

export const Act4: React.FC = () => {
  const F = useCurrentFrame() + ACTS.act4.from;

  // ------------------------------------------------ BLUE (front, laying bricks)
  let ux = 1500;
  let uPose: Pose = idleSway(SHRINK, F, 2);
  let uFacing: 1 | -1 = -1;
  if (F >= 5620 && F < 5800) uPose = offsetPose(SCRATCH_HEAD, { rHand: { x: Math.sin(F * 0.9) * 5, y: 0 } });
  if (F >= 5800 && F < T0 - 20) uPose = idleSway(STAND, F, 2);
  if (F >= T0 - 20) {
    const i = Math.max(0, Math.min(N - 1, Math.floor((F - T0) / PER)));
    const c = (F - laidAt(i)) / PER;
    const at = brickX(i) + BW;
    if (F < T0) {
      ux = ip(F, [T0 - 20, T0], [1500, at]);
      uPose = walkCycle(F, 10);
    } else if (F < laidAt(N - 1) + PER) {
      if (c < 0.45) {
        ux = at;
        uPose = lerpPose(ASSEMBLY_CARRY, ASSEMBLY_LAY, Math.min(1, c / 0.2));
      } else {
        ux = at - ip(c, [0.45, 1], [0, BW]);
        uPose = offsetPose(walkCycle(F, 10), { lHand: { x: 16, y: -30 }, rHand: { x: 20, y: -28 } });
      }
    } else {
      ux = track(F, [[laidAt(N - 1) + PER, brickX(N - 1)], [6560, 820]]);
      uPose = moving(F, [[laidAt(N - 1) + PER, brickX(N - 1)], [6560, 820]]) ? walkCycle(F, 10) : idleSway(STAND, F, 2);
      uFacing = F < 6560 ? 1 : -1;
    }
  }
  const uCarry = F >= T0 && F < laidAt(N - 1) + PER && ((F - T0) % PER) / PER >= 0.45;

  // ------------------------------------------------ RED (behind, polishing)
  const redKeys: [number, number][] = [
    [5600, 470],
    [5640, 470],
    [5700, 760],
    [5995, 760],
    [paintAt(0) - 5, brickX(0) + 100],
  ];
  let rx = track(F, redKeys);
  let ry = STAND_Y;
  let rPose: Pose = idleSway(STAND, F, 2);
  if (F < 5640) {
    const k = ip(F, [5600, 5640], [0, 1]);
    rPose = lerpPose(SIT_GROUND, STAND, k);
    ry = LIE_Y + (STAND_Y - LIE_Y) * k;
  }
  if (moving(F, redKeys)) rPose = walkCycle(F, 10);
  if (F >= 5800 && F < 5990) rPose = idleSway(ADJUST_GLASSES, F, 2);
  if (F >= paintAt(0) && F < paintAt(N - 1) + 30) {
    const i = Math.max(0, Math.min(N - 1, Math.floor((F - paintAt(0)) / PER)));
    const c = (F - paintAt(i)) / PER;
    rx = brickX(i) + 100 - (c > 0.8 ? ip(c, [0.8, 1], [0, BW]) : 0);
    rPose = c > 0.8 ? walkCycle(F, 8) : Math.floor(F / 5) % 2 ? ASSEMBLY_BRUSH_HI : ASSEMBLY_BRUSH_LO;
  }
  if (F >= paintAt(N - 1) + 30) {
    const k: [number, number][] = [[paintAt(N - 1) + 30, brickX(N - 1) + 100], [6580, 1100]];
    rx = track(F, k);
    rPose = moving(F, k) ? walkCycle(F, 10) : idleSway(STAND, F, 2);
  }
  const rFacing: 1 | -1 = F < 5800 ? 1 : F < paintAt(N - 1) + 30 ? -1 : F < 6580 ? 1 : -1;
  const rBrush = F >= paintAt(0) - 5 && F < paintAt(N - 1) + 30;

  // ------------------------------------------------ BLACK (walks the finished road)
  const bKeys: [number, number][] = [
    [5600, BALL_END_X - 130],
    [paintAt(0) + 10, BALL_END_X - 130],
    [paintAt(N - 1) + 40, brickX(N - 1) + 230],
    [6580, 960],
  ];
  let bx = track(F, bKeys);
  let bPose: Pose = moving(F, bKeys) ? walkCycle(F, 14) : idleSway(STAND, F, 2);
  if (F >= paintAt(0) && F < paintAt(N - 1) + 30) {
    // walk on the freshly painted road, right behind red
    bx = Math.min(BALL_END_X - 130, rx + 150);
    bPose = walkCycle(F, 14);
  }
  if (F >= paintAt(N - 1) + 30) {
    const k: [number, number][] = [[paintAt(N - 1) + 30, brickX(N - 1) + 250], [6580, 960]];
    bx = track(F, k);
    bPose = moving(F, k) ? walkCycle(F, 14) : idleSway(STAND, F, 2);
  }
  let by = STAND_Y;
  // celebrate
  let ry2 = ry;
  let uy = STAND_Y;
  if (F >= SUCCESS) {
    bPose = CHEER;
    rPose = CHEER;
    uPose = CHEER;
    const h = (o: number) => hop(F, SUCCESS + o, SUCCESS + o + 24, 50) + hop(F, SUCCESS + o + 40, SUCCESS + o + 64, 40);
    by = STAND_Y + h(0);
    ry2 = STAND_Y + h(6);
    uy = STAND_Y + h(12);
  }
  const bFacing: 1 | -1 = F < paintAt(N - 1) + 30 ? -1 : F < 6580 ? 1 : -1;

  const ballO = ip(F, [5980, 6005], [1, 0]);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {ballO > 0 && <IronBall x={BALL_END_X} y={430 - 78} r={78} />}
        {ballO > 0 && ballO < 1 && <g opacity={ballO}><circle cx={BALL_END_X} cy={352} r={78 * (1 + (1 - ballO))} fill="none" stroke="#111" strokeWidth={4} /></g>}
        {[0, 1, 2].map((i) => (
          <SmokePuff key={i} x={BALL_END_X - 40 + i * 40} y={400} t={F - 5985 - i * 3} seed={`bp${i}`} dark={false} />
        ))}
        {/* word-brick road */}
        {Array.from({ length: N }).map((_, i) => {
          if (F < laidAt(i)) return null;
          const drop = ip(F, [laidAt(i), laidAt(i) + 8], [-30, 0]);
          const painted = ip(F, [paintAt(i), paintAt(i) + 26], [0, 1], lin);
          return <WordBrick key={i} x={brickX(i)} y={413 + drop} label={painted >= 1 ? PAINTED[i] : RAW[i]} painted={painted} />;
        })}
        <StickFigure pose={bPose} x={bx} y={by} scale={MS} facing={bFacing} color={C.black} eyes={F >= SUCCESS ? "up" : "normal"} mouth={F >= 6000 ? "smile" : "flat"} />
        <StickFigure
          pose={rPose}
          x={rx}
          y={F >= SUCCESS ? ry2 : ry}
          scale={MS}
          facing={rFacing}
          color={C.red}
          glasses
          glassesTilt={F >= 5810 && F < 5840 ? -12 : 0}
          eyes={F >= SUCCESS ? "up" : "normal"}
          mouth={F >= 5800 && F < 5990 ? talk(F, 5810, 5980) : F >= 6000 ? "smile" : "flat"}
          extras={(p) =>
            rBrush ? (
              <g>
                <line x1={p.rHand.x} y1={p.rHand.y} x2={p.rHand.x + 14} y2={p.rHand.y + 18} stroke="#8d6e63" strokeWidth={4} strokeLinecap="round" />
                <rect x={p.rHand.x + 8} y={p.rHand.y + 16} width={16} height={12} rx={2} fill="#2f9e44" stroke="#111" strokeWidth={2} />
              </g>
            ) : null
          }
        />
        <StickFigure
          pose={uPose}
          x={ux}
          y={uy}
          scale={MS}
          scaleY={F >= T0 ? 1 : 0.95}
          facing={uFacing}
          color={C.blue}
          eyes={F >= SUCCESS ? "up" : F >= 5620 && F < 5800 ? "normal" : "normal"}
          mouth={F >= 5620 && F < 5800 ? talk(F, 5630, 5790) : F >= T0 ? "smile" : "flat"}
          extras={(p) => (uCarry ? <WordBrick x={(p.lHand.x + p.rHand.x) / 2 + 10} y={(p.lHand.y + p.rHand.y) / 2 - 8} label="下一段" /> : null)}
        />
        {F >= SUCCESS &&
          Array.from({ length: 16 }).map((_, i) => {
            const t = F - SUCCESS;
            return (
              <Star
                key={i}
                x={600 + i * 50 + Math.sin(t / 10 + i) * 20}
                y={60 + ((t * (2 + (i % 4)) + i * 40) % 380)}
                size={8 + (i % 3) * 4}
                color={["#ffd43b", "#ff6b6b", "#4dabf7", "#69db7c"][i % 4]}
                rot={t * 8}
              />
            );
          })}
      </svg>
      <SpeechBubble frame={F} x={1490} y={headY(STAND_Y) - 40} start={5630} end={5800} side="left" width={600} color={C.blue} text="咦？有了开头好像也没那么难，我顺着往下接两段！" />
      <SpeechBubble frame={F} x={770} y={headY(STAND_Y) - 40} start={5815} end={5995} side="right" width={620} color={C.red} text="啧，话虽然糙，但把这几个词改成马原概念，逻辑居然通了！" />
      <Pop x={1500} y={330} start={5622} dur={30} text="？" size={50} color={C.blue} rot={0} frame={F} />
    </AbsoluteFill>
  );
};
