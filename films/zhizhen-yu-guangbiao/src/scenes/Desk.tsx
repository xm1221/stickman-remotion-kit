import React from "react";
import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Clock } from "../components/Clock";
import { Keycap, Scoreboard } from "../components/Effects";
import { EnergyBar } from "../components/EnergyBar";
import { BS_CENTER, Laptop } from "../components/Laptop";
import { LampCone, RoomBack } from "../components/Room";
import { Pop } from "../components/SpeechBubble";
import {
  ACTS,
  camAt,
  clockSeconds,
  docState,
  energyAt,
  FACE_INSERT,
  HEARTBEAT,
  heartbeat,
  KEYCAP,
  keystrokesAt,
  L,
  loopAt,
  LOOPS,
  ROUGH_T,
  W,
} from "../timeline";
import { FONT, hop, ip, lin, track } from "../utils";

type P = { x: number; y: number };
const lerp = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

const REST_L: P = { x: 800, y: 432 };
const REST_R: P = { x: 1120, y: 432 };
const SLUMP_L: P = { x: 760, y: 508 };
const SLUMP_R: P = { x: 1160, y: 508 };
const PHONE_DESK: P = { x: 400, y: 470 };
const PHONE_UP: P = { x: 640, y: 300 };
const BS: P = { x: BS_CENTER.x, y: BS_CENTER.y + 6 };
const CORNER: P = W.corner;
const PAD: P = { x: 960, y: 500 };

/** move between two points over [a,b] with ease */
const mv = (F: number, a: number, b: number, p0: P, p1: P) => lerp(p0, p1, ip(F, [a, b], [0, 1]));

const isTyping = (F: number) => {
  const lp = loopAt(F);
  if (lp && F >= lp.t0 && F < lp.t1) return true;
  if (F >= ROUGH_T.a0 && F < 5560) return true;
  if (F >= 5640 && F < 6420) return true;
  return false;
};

const typingJitter = (F: number, side: number, speed: number, amp: number) => ({
  x: Math.sin(F * speed * 0.7 + side) * amp * 0.4,
  y: -Math.abs(Math.sin(F * speed + side * 1.7)) * amp,
});

/** hand targets in desk-world coordinates */
export const handsAt = (F: number): { l: P; r: P; holdPhone: boolean; holdKey: boolean } => {
  let l = REST_L;
  let r = REST_R;
  let holdPhone = false;
  let holdKey = false;
  // breathing idle
  const br = Math.sin(F / 25) * 3;
  l = { x: l.x, y: l.y + br };
  r = { x: r.x, y: r.y + br };

  // ---- Act1: phone
  if (F >= 1110 && F < 1460) {
    if (F < 1150) l = mv(F, 1110, 1150, REST_L, PHONE_DESK);
    else if (F < 1190) l = mv(F, 1150, 1190, PHONE_DESK, PHONE_UP);
    else if (F < 1400) l = { x: PHONE_UP.x, y: PHONE_UP.y + Math.sin(F / 13) * 4 };
    else if (F < 1430) l = mv(F, 1400, 1430, PHONE_UP, PHONE_DESK);
    else l = mv(F, 1430, 1460, PHONE_DESK, REST_L);
    holdPhone = F >= 1150 && F < 1430;
    if (F >= 1190 && F < 1400) {
      // thumb-scroll with right hand reaching over
      r = { x: 760 + Math.sin(F / 7) * 10, y: 330 - Math.abs(Math.sin(F / 9)) * 40 };
    } else if (F >= 1150 && F < 1190) r = mv(F, 1150, 1190, REST_R, { x: 760, y: 330 });
    else if (F >= 1400 && F < 1440) r = mv(F, 1400, 1440, { x: 760, y: 330 }, REST_R);
  }

  // ---- typing
  if (isTyping(F)) {
    const lp = loopAt(F);
    const shaky = lp && (lp === LOOPS[0] || lp === LOOPS[1]);
    const frantic = F >= 4446 && F < 4740;
    const flow = F >= 5640;
    const sp = frantic ? 1.6 : flow ? 0.9 : shaky ? 0.55 : 1.1;
    const amp = frantic ? 16 : flow ? 9 : 7;
    const jl = typingJitter(F, 0, sp, amp);
    const jr = typingJitter(F, 2, sp, amp);
    const trem = shaky ? Math.sin(F * 2.9) * 3 : 0;
    l = { x: REST_L.x + jl.x + trem, y: REST_L.y + jl.y };
    r = { x: REST_R.x + jr.x - trem, y: REST_R.y + jr.y };
  }

  // ---- Act2 backspace slams
  for (const lp of LOOPS) {
    if (F >= lp.d0 - 12 && F < lp.d1 + 12) {
      const k = ip(F, [lp.d0 - 12, lp.d0, lp.d1, lp.d1 + 12], [0, 1, 1, 0]);
      const pound = F >= lp.d0 && F < lp.d1 ? -Math.abs(Math.sin(F * 0.9)) * 14 : 0;
      r = lerp(REST_R, { x: BS.x - 58, y: BS.y + 52 + pound }, k);
    }
  }
  // heartbeat freeze
  if (F >= HEARTBEAT.from && F < 3800) {
    const tr = Math.sin(F * 3.1) * 1.5;
    l = { x: REST_L.x - 20 + tr, y: REST_L.y - 30 };
    r = { x: REST_R.x + 20 - tr, y: REST_R.y - 30 };
  }

  // ---- Act3
  if (F >= 3800 && F < 4250) {
    const up = ip(F, [4090, 4130], [0, 1]);
    l = lerp(SLUMP_L, REST_L, up);
    r = lerp(SLUMP_R, REST_R, up);
  }
  if (F >= 4250 && F < 4446) {
    l = REST_L;
    if (F < 4290) r = mv(F, 4250, 4290, REST_R, { x: BS.x - 10, y: BS.y + 30 });
    else if (F < KEYCAP.pop) {
      const strain = Math.sin(F * 3.3) * ip(F, [4290, 4330], [1, 4]);
      r = { x: BS.x - 10 + strain, y: BS.y + 30 - ip(F, [4290, KEYCAP.pop], [0, 12]) + Math.cos(F * 2.7) * 2 };
    } else if (F < 4365) {
      const t = ip(F, [KEYCAP.pop, 4365], [0, 1], lin);
      const p = lerp({ x: BS.x, y: BS.y - 4 }, { x: CORNER.x, y: CORNER.y - 70 }, t);
      r = { x: p.x, y: p.y + hop(F, KEYCAP.pop, 4365, 60) };
    } else if (F < KEYCAP.slap) {
      r = { x: CORNER.x, y: CORNER.y - 70 - ip(F, [4365, 4384], [0, 30]) + ip(F, [4384, KEYCAP.slap], [0, 100], lin) };
    } else r = { x: CORNER.x, y: CORNER.y + 30 - ip(F, [4410, 4440], [0, 20]) };
    holdKey = F >= KEYCAP.pop && F < KEYCAP.slap;
  }

  // ---- Act4: toss + submit
  if (F >= 6430 && F < 6580) {
    l = REST_L;
    if (F < 6470) r = mv(F, 6430, 6470, REST_R, { x: CORNER.x, y: CORNER.y + 20 });
    else if (F < KEYCAP.toss) r = mv(F, 6470, KEYCAP.toss, { x: CORNER.x, y: CORNER.y + 20 }, { x: CORNER.x - 30, y: CORNER.y - 40 });
    else r = mv(F, KEYCAP.toss, 6510, { x: CORNER.x - 30, y: CORNER.y - 40 }, { x: CORNER.x + 90, y: CORNER.y - 90 });
    holdKey = F >= 6470 && F < KEYCAP.toss;
  }
  if (F >= 6580) {
    l = REST_L;
    if (F < 6620) r = mv(F, 6580, 6620, REST_R, PAD);
    else if (F < 6700) r = { x: PAD.x + ip(F, [6620, 6640], [0, 30]), y: PAD.y + (F >= 6642 && F < 6650 ? 4 : 0) };
    else {
      const back = ip(F, [6700, 6760], [0, 1]);
      l = lerp(REST_L, { x: 720, y: 520 }, back);
      r = lerp({ x: PAD.x + 30, y: PAD.y }, { x: 1200, y: 520 }, back);
    }
  }
  return { l, r, holdPhone, holdKey };
};

/** first-person arm: shoulder off-screen bottom → elbow → hand */
const Arm: React.FC<{ s: P; h: P; side: -1 | 1; opacity?: number }> = ({ s, h, side, opacity = 1 }) => {
  const mx = (s.x + h.x) / 2;
  const my = (s.y + h.y) / 2;
  const dx = h.x - s.x;
  const dy = h.y - s.y;
  const n = Math.hypot(dx, dy) || 1;
  const bend = Math.max(0, 300 - n) * 0.35 + 18;
  const e = { x: mx + (-dy / n) * bend * side, y: my + (dx / n) * bend * side };
  const ang = (Math.atan2(h.y - e.y, h.x - e.x) * 180) / Math.PI;
  return (
    <g opacity={opacity}>
      <polyline points={`${s.x},${s.y} ${e.x},${e.y} ${h.x},${h.y}`} fill="none" stroke="#111" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(${h.x} ${h.y}) rotate(${ang + 90})`}>
        <ellipse cx={0} cy={4} rx={26} ry={22} fill="#111" />
        {[-14, -5, 5, 14].map((fx, i) => (
          <line key={i} x1={fx} y1={-6} x2={fx * 1.1} y2={-24 - (i === 1 || i === 2 ? 4 : 0)} stroke="#111" strokeWidth={9} strokeLinecap="round" />
        ))}
      </g>
    </g>
  );
};

const PhoneBig: React.FC<{ x: number; y: number; F: number; held: boolean }> = ({ x, y, F, held }) => {
  const s = held ? 1 : 0.5;
  const scroll = (F * 6) % 120;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${held ? -4 : 70})`}>
      <rect x={-62} y={-118} width={124} height={236} rx={16} fill="#111" />
      <rect x={-54} y={-104} width={108} height={208} rx={8} fill="#1c7ed6" />
      <defs>
        <clipPath id="ph">
          <rect x={-54} y={-104} width={108} height={208} rx={8} />
        </clipPath>
      </defs>
      <g clipPath="url(#ph)">
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(0 ${-104 + i * 120 - scroll})`}>
            <rect x={-54} y={0} width={108} height={116} fill={["#4dabf7", "#f783ac", "#ffd43b", "#69db7c"][i]} />
            <circle cx={0} cy={50} r={20} fill="#fff" opacity={0.7} />
            <polygon points="-6,40 -6,60 10,50" fill="#111" />
          </g>
        ))}
        <text x={36} y={64} fontSize={22} fill="#e03131" textAnchor="middle">
          ♥
        </text>
      </g>
      {!held && Math.floor(F / 20) % 3 === 0 && <circle cx={44} cy={-96} r={8} fill="#e03131" />}
    </g>
  );
};

const FaceInsert: React.FC<{ F: number }> = ({ F }) => {
  const t = F - FACE_INSERT.from;
  const punch = ip(t, [0, 8], [1.25, 1], lin);
  const glint = 0.6 + 0.4 * Math.abs(Math.sin(t / 3));
  return (
    <AbsoluteFill style={{ background: "#1b2540" }}>
      <svg width={1920} height={532}>
        {Array.from({ length: 40 }).map((_, i) => {
          const a = (i / 40) * Math.PI * 2;
          const r0 = 230 + random(`fl${i}`) * 60;
          return (
            <line
              key={i}
              x1={960 + Math.cos(a) * r0}
              y1={270 + Math.sin(a) * r0 * 0.7}
              x2={960 + Math.cos(a) * 1200}
              y2={270 + Math.sin(a) * 900}
              stroke="#fff"
              strokeWidth={2 + (i % 3)}
              opacity={0.25 + 0.25 * ((i + Math.floor(t / 2)) % 2)}
            />
          );
        })}
        <g transform={`translate(960 280) scale(${punch})`}>
          <circle r={190} fill="#fff" stroke="#111" strokeWidth={14} />
          {/* thick determined brows */}
          <line x1={-120} y1={-78} x2={-30} y2={-40} stroke="#111" strokeWidth={22} strokeLinecap="round" />
          <line x1={120} y1={-78} x2={30} y2={-40} stroke="#111" strokeWidth={22} strokeLinecap="round" />
          {/* eyes with red glint */}
          {[-62, 62].map((ex) => (
            <g key={ex}>
              <circle cx={ex} cy={-6} r={20} fill="#111" />
              <circle cx={ex + 7} cy={-13} r={8} fill="#ff2d2d" opacity={glint} />
              <circle cx={ex - 6} cy={-2} r={3} fill="#fff" />
            </g>
          ))}
          {/* set jaw */}
          <path d="M-60 90 L60 84" stroke="#111" strokeWidth={14} strokeLinecap="round" />
          <path d="M150 -150 l22 -30 M170 -120 l34 -14" stroke="#e03131" strokeWidth={8} strokeLinecap="round" opacity={t > 20 ? 1 : 0} />
        </g>
      </svg>
      {t > 34 && (
        <div
          style={{
            position: "absolute",
            left: 1240,
            top: 150,
            fontFamily: FONT,
            fontSize: 54,
            fontWeight: 900,
            color: "#fff",
            transform: `scale(${ip(t, [34, 42], [0.6, 1])})`,
          }}
        >
          ……拔了它。
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Desk: React.FC = () => {
  const F = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam0 = camAt(F);
  const drift = { x: Math.sin(F / 70) * 6, y: Math.cos(F / 90) * 4 };
  const cam = { ...cam0, cx: cam0.cx + drift.x / cam0.s, cy: cam0.cy + drift.y / cam0.s };
  const tx = 960 - cam.cx * cam.s;
  const ty = L.panelH / 2 - cam.cy * cam.s;
  const doc = docState(F);
  const hands = handsAt(F);
  const lp = loopAt(F);
  const deleting = !!lp && F >= lp.d0 && F < lp.d1;
  const bsFlash = deleting ? (Math.floor(F / 3) % 2 === 0 ? 1 : 0.45) : 0;
  const pdfs = F >= 320 ? ip(F, [320, 440], [0, 20], lin) : 0;
  const pdfClose = ip(F, [1440, 1500], [0, 1]);
  const inHeart = F >= HEARTBEAT.from && F < HEARTBEAT.to;
  const beat = inHeart ? heartbeat(F) : 0;
  const dimAct3 = ip(F, [3800, 3830, 4090, 4140], [0, 1, 1, 0]);
  const lamp = 1 - dimAct3 * 0.5;
  const keycapState: "on" | "pry" | "off" = F < KEYCAP.pryStart ? "on" : F < KEYCAP.pop ? "pry" : "off";
  const pry = ip(F, [KEYCAP.pryStart, KEYCAP.pop], [0, 1], (t) => t * t);
  const showSubmit = F >= 6576 && F < 6800;
  const pressed = F >= 6642 && F < 6652;
  const success = F >= 6650 ? spring({ frame: F - 6650, fps, config: { damping: 10, stiffness: 140 } }) : 0;
  const arrow =
    F >= 6590 && F < 6660
      ? { x: ip(F, [6595, 6638], [900, W.inner.x + W.inner.w - 130]), y: ip(F, [6595, 6638], [200, W.inner.y + W.inner.h - 40]) }
      : null;

  const SH_L: P = { x: 700, y: 650 };
  const SH_R: P = { x: 1220, y: 650 };
  const frantic = F >= 4446 && F < 4740;

  // keycap world position (when not on keyboard)
  let keycapWorld: { x: number; y: number; rot: number } | null = null;
  if (hands.holdKey) keycapWorld = { x: hands.r.x, y: hands.r.y - 26, rot: -10 };
  else if (F >= KEYCAP.slap && F < 6470) keycapWorld = { x: CORNER.x, y: CORNER.y, rot: -8 };
  else if (F >= KEYCAP.toss && F < KEYCAP.inBin) {
    const t = ip(F, [KEYCAP.toss, KEYCAP.inBin], [0, 1], lin);
    keycapWorld = {
      x: CORNER.x - 30 + (W.trash.x - CORNER.x + 30) * t,
      y: CORNER.y - 66 + (W.trash.y - 8 - CORNER.y + 66) * t + hop(F, KEYCAP.toss, KEYCAP.inBin, 80),
      rot: t * 540,
    };
  } else if (F >= KEYCAP.inBin) keycapWorld = { x: W.trash.x + 6, y: W.trash.y - 10, rot: 24 };

  const ks = keystrokesAt(F);
  const burn = Math.round(track(F, [[2930, 0], [3330, 85]]));

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: L.divider, width: 1920, height: L.panelH, overflow: "hidden", background: "#eef1f6" }}>
        <svg width={1920} height={L.panelH} style={{ position: "absolute" }}>
          <g transform={`translate(${tx} ${ty}) scale(${cam.s})`}>
            <RoomBack frame={F} lamp={lamp} />
            <Laptop
              frame={F}
              doc={doc}
              pdfs={F < 1500 ? pdfs : 0}
              pdfClose={pdfClose}
              bigCursor={inHeart ? beat : null}
              showSubmit={showSubmit}
              pressed={pressed}
              success={success}
              arrow={arrow}
              bsFlash={bsFlash}
              keycap={keycapState}
              pry={pry}
              typing={isTyping(F) || deleting}
              dim={dimAct3}
            />
            {!hands.holdPhone && <PhoneBig x={PHONE_DESK.x} y={PHONE_DESK.y} F={F} held={false} />}
            {keycapWorld && <Keycap x={keycapWorld.x} y={keycapWorld.y} w={BS_CENTER.w} h={23} rot={keycapWorld.rot} />}
            {/* corner slap dust */}
            {F >= KEYCAP.slap && F < KEYCAP.slap + 12 &&
              [0, 1, 2, 3, 4, 5].map((i) => (
                <line
                  key={i}
                  x1={CORNER.x + Math.cos(i) * 50}
                  y1={CORNER.y + Math.sin(i) * 20}
                  x2={CORNER.x + Math.cos(i) * (70 + (F - KEYCAP.slap) * 4)}
                  y2={CORNER.y + Math.sin(i) * (28 + (F - KEYCAP.slap) * 2)}
                  stroke="#111"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              ))}
            <LampCone frame={F} lamp={lamp} />
            {/* arms */}
            {frantic &&
              [6, 12].map((ph, i) => {
                const g = handsAt(F - ph);
                return (
                  <g key={i}>
                    <Arm s={SH_L} h={g.l} side={-1} opacity={0.22 - i * 0.08} />
                    <Arm s={SH_R} h={g.r} side={1} opacity={0.22 - i * 0.08} />
                  </g>
                );
              })}
            <Arm s={SH_L} h={hands.l} side={-1} />
            <Arm s={SH_R} h={hands.r} side={1} />
            {hands.holdPhone && <PhoneBig x={hands.l.x + 10} y={hands.l.y - 60} F={F} held />}
            {/* shoulder silhouette */}
            <ellipse cx={680} cy={600} rx={230} ry={70} fill="#111" />
            <ellipse cx={1240} cy={600} rx={230} ry={70} fill="#111" />
          </g>
        </svg>
        {/* panel overlays */}
        {inHeart && (
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse at center, rgba(224,49,49,0) 40%, rgba(224,49,49,${0.15 + beat * 0.35}) 100%)`,
            }}
          />
        )}
        {dimAct3 > 0 && <AbsoluteFill style={{ background: "#0f1626", opacity: dimAct3 * 0.35 }} />}
        {F >= FACE_INSERT.from && F < FACE_INSERT.to && <FaceInsert F={F} />}
      </div>

      {/* HUD (screen space) */}
      <Clock seconds={clockSeconds(F)} x={1590} y={556} alarm={F >= 3800 && F < 4100} frame={F} />
      <EnergyBar value={energyAt(F)} x={40} y={562} frame={F} />
      <Scoreboard x={1410} y={830} frame={F} start={2935} end={3790} keys={ks} burn={burn} words={0} />
      {F >= 4395 && F < 4590 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1920,
            top: 960,
            display: "flex",
            justifyContent: "center",
            opacity: Math.min(1, (F - 4395) / 6, (4590 - F) / 10),
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 40,
              fontWeight: 900,
              color: "#fff",
              background: "#111",
              border: "4px solid #e03131",
              borderRadius: 12,
              padding: "8px 26px",
              transform: `scale(${ip(F, [4395, 4405], [1.3, 1])})`,
              boxShadow: "0 6px 0 rgba(224,49,49,0.45)",
            }}
          >
            [已物理禁用：自我否定/退格键]
          </div>
        </div>
      )}

      {/* sound words */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Pop key={`pdf${i}`} x={700 + (i % 5) * 140} y={600 + (i % 3) * 30} start={320 + i * 6} dur={14} text="叮" size={30} color="#c92a2a" rot={0} frame={F} />
      ))}
      {LOOPS.map((lp, i) => (
        <Pop key={`del${i}`} x={1500} y={700} start={lp.d0} dur={Math.max(16, lp.d1 - lp.d0)} text="⌫⌫⌫" size={44} color="#e03131" rot={-6} frame={F} />
      ))}
      {Array.from({ length: 22 }).map((_, i) => {
        const st = HEARTBEAT.from + 10 + i * 28;
        return st < HEARTBEAT.to - 20 ? <Pop key={`hb${i}`} x={260} y={900} start={st} dur={14} text="咚" size={44} color="#c92a2a" rot={0} frame={F} /> : null;
      })}
      <Pop x={1500} y={680} start={4110} dur={26} text="！" size={90} color="#111" rot={0} frame={F} />
      <Pop x={1320} y={700} start={KEYCAP.pop} dur={28} text="咔——！" size={70} color="#111" frame={F} />
      <Pop x={1300} y={760} start={KEYCAP.slap} dur={34} text="啪！" size={96} color="#e03131" frame={F} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Pop key={`ty${i}`} x={560 + (i % 4) * 260} y={1000 - (i % 2) * 30} start={4600 + i * 28} dur={20} text="哒哒哒哒" size={32} color="#111" rot={i % 2 ? 6 : -6} frame={F} />
      ))}
      <Pop x={1640} y={820} start={KEYCAP.inBin} dur={30} text="咚。" size={56} color="#111" rot={0} frame={F} />
      <Pop x={1100} y={980} start={6642} dur={24} text="Click" size={36} color="#111" rot={0} frame={F} />
      <Pop x={1500} y={640} start={6655} dur={50} text="叮——" size={48} color="#2f9e44" rot={0} frame={F} />
      {F >= ACTS.act1.from && F < 160 && (
        <div style={{ position: "absolute", left: 40, top: 1030, fontFamily: FONT, fontSize: 22, color: "#868e96" }}>现实</div>
      )}
    </AbsoluteFill>
  );
};
