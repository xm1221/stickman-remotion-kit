import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrawlCloud, CirclingStars, ImpactBurst, Meteor, Rock, Shockwave, SmokePuff } from "../components/Effects";
import { LIE_DAZED } from "../components/poses";
import { Pop, SpeechBubble } from "../components/SpeechBubble";
import { StickFigure } from "../components/StickFigure";
import { ACTS, L, METEORS } from "../timeline";
import { C, FONT, hop, ip, lin } from "../utils";
import { CLOUD } from "./Act2";
import { heroHead } from "./Desk";
import { LIE_Y, MS } from "./common";

export const ROCK_Y = L.ground - 32;
export const RED_LAND_X = 700;
export const BLUE_LAND_X = 1290;

const FLIGHT = 30;

const bez = (t: number, a: number, b: number, c: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
const bezD = (t: number, a: number, b: number, c: number) => 2 * (1 - t) * (b - a) + 2 * t * (c - b);

export const Act3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const G = f + ACTS.act3.from;
  const meteors = METEORS.map((m) => ({ ...m, l: m.launch - ACTS.act3.from, hit: m.launch - ACTS.act3.from + FLIGHT }));
  const firstHit = meteors[0].hit;

  const cloudS = f < firstHit ? 1.15 : ip(f, [firstHit, firstHit + 16], [1.15, 1.7]);
  const cloudO = f < firstHit ? 1 : ip(f, [firstHit, firstHit + 16], [1, 0]);

  // flung fighters
  const flungT = ip(f, [firstHit, firstHit + 28], [0, 1], lin);
  const landed = f >= firstHit + 28;
  const bounce = meteors.slice(1).reduce((acc, m) => acc + hop(f, m.hit, m.hit + 14, 26), 0);

  const alertOn = f >= 5 && f < 450;
  const alertPop = spring({ frame: f - 5, fps, config: { damping: 10, stiffness: 160 } });
  const alertOut = ip(f, [400, 450], [1, 0]);
  const flash = Math.floor(f / 8) % 2 === 0;
  const hh = heroHead(G);

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {cloudO > 0 && <BrawlCloud x={CLOUD.x} y={CLOUD.y} frame={f + 1650} scale={cloudS} opacity={cloudO} />}
        {f < firstHit &&
          Array.from({ length: 30 }).map((_, i) => (
            <SmokePuff key={i} x={CLOUD.x + ((i % 3) - 1) * 120} y={CLOUD.y - 60} t={f - (i * 24 - 20)} seed={`c3${i}`} />
          ))}
        {/* rocks already landed */}
        {meteors.map((m, i) =>
          f >= m.hit ? <Rock key={i} x={m.tx} y={ROCK_Y} label={m.label} rot={[-6, 4, -3][i]} /> : null,
        )}
        {/* fighters flung out */}
        {f >= firstHit && (
          <>
            <StickFigure
              pose={LIE_DAZED}
              x={landed ? RED_LAND_X : CLOUD.x + (RED_LAND_X - CLOUD.x) * flungT}
              y={landed ? LIE_Y + bounce : CLOUD.y + (LIE_Y - CLOUD.y) * flungT + hop(f, firstHit, firstHit + 28, 160)}
              rotate={landed ? 0 : (f - firstHit) * -26}
              scale={MS}
              facing={1}
              color={C.red}
              glasses
              glassesTilt={landed ? 28 : 0}
              eyes="dizzy"
              mouth="open"
            />
            <StickFigure
              pose={LIE_DAZED}
              x={landed ? BLUE_LAND_X : CLOUD.x + (BLUE_LAND_X - CLOUD.x) * flungT}
              y={landed ? LIE_Y + bounce : CLOUD.y + (LIE_Y - CLOUD.y) * flungT + hop(f, firstHit, firstHit + 28, 160)}
              rotate={landed ? 0 : (f - firstHit) * 26}
              scale={MS}
              facing={-1}
              color={C.blue}
              eyes="dizzy"
              mouth="open"
            />
            {landed && <CirclingStars x={RED_LAND_X - 86 * MS} y={LIE_Y - 60} frame={f} r={44} />}
            {landed && <CirclingStars x={BLUE_LAND_X + 86 * MS} y={LIE_Y - 60} frame={f + 20} r={44} />}
          </>
        )}
        {/* meteors in flight */}
        {meteors.map((m, i) => {
          if (f < m.l || f >= m.hit) return null;
          const t = (f - m.l) / FLIGHT;
          const te = t * t;
          const x0 = L.screen.x + L.screen.w / 2;
          const y0 = L.screen.y + 40;
          const x = bez(te, x0, m.tx + 260, m.tx);
          const y = bez(te, y0, -320, ROCK_Y);
          const a = Math.atan2(bezD(te, y0, -320, ROCK_Y), bezD(te, x0, m.tx + 260, m.tx));
          return <Meteor key={i} x={x} y={y} angle={a} label={m.label} t={f - m.l} />;
        })}
        {meteors.map((m, i) => (
          <g key={`fx${i}`}>
            <Shockwave x={m.tx} y={L.ground} t={f - m.hit} max={i === 0 ? 700 : 480} />
            <ImpactBurst x={m.tx} y={ROCK_Y - 20} t={f - m.hit} size={90} />
            {[0, 1, 2, 3].map((k) => (
              <SmokePuff key={k} x={m.tx + (k - 1.5) * 50} y={L.ground - 10} t={f - m.hit - k} seed={`m${i}${k}`} dark={false} />
            ))}
          </g>
        ))}
        {/* alert red flash over everything */}
        {alertOn && <rect x={0} y={0} width={1920} height={1080} fill="#e03131" opacity={(flash ? 0.32 : 0.1) * alertOut} />}
      </svg>

      {meteors.map((m, i) => (
        <Pop key={i} x={m.tx} y={ROCK_Y - 130} start={m.hit} text="轰！！" size={72} rot={[-10, 8, -6][i]} dur={30} />
      ))}
      <Pop x={hh.x + 10} y={hh.y - 80} start={10} text="！！" size={70} dur={40} rot={0} />
      {alertOn && (
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 520,
            transform: `translate(-50%,-50%) scale(${alertPop * (0.95 + (flash ? 0.05 : 0))})`,
            opacity: alertOut,
            background: "#fff",
            border: "10px solid #e03131",
            borderRadius: 24,
            padding: "30px 56px",
            fontFamily: FONT,
            textAlign: "center",
            boxShadow: "0 0 0 12px rgba(224,49,49,0.25)",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 900, color: "#e03131" }}>⚠️ 紧急警告</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#111", marginTop: 14 }}>电池电量仅剩 3%！</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#111" }}>距离提交截止仅剩 8 分钟！</div>
        </div>
      )}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Pop key={`b${i}`} x={i % 2 ? 1700 : 220} y={140 + (i % 3) * 120} start={10 + i * 60} dur={30} text="嘀嘀嘀！" size={40} color="#e03131" rot={0} />
      ))}
      <SpeechBubble x={hh.x + 10} y={hh.y - 40} start={440} end={530} side="left" width={240} shout text="拼了！" />
    </AbsoluteFill>
  );
};
