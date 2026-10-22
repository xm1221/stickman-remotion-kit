import { ip, lin, track } from "./utils";

/**
 * 《指针与光标 2.0：拔掉退格键》 — 4:00 @30fps
 * All frame numbers below are GLOBAL frames.
 */
export const FPS = 30;
export const DURATION = 7200;

export const ACTS = {
  act1: { from: 0, dur: 1600 }, // 0:00–0:53 虚假的繁荣与合谋
  act2: { from: 1600, dur: 2200 }, // 0:53–2:07 死循环拉锯战
  act3: { from: 3800, dur: 1800 }, // 2:07–3:07 拔掉退格键
  act4: { from: 5600, dur: 1200 }, // 3:07–3:47 在运动中统一
  credits: { from: 6800, dur: 400 }, // 3:47–4:00 留白
};

/** global layout. Desk panel = lower half, desk-local coords are (x, y - divider) */
export const L = {
  divider: 548,
  ground: 430, // mind-theater ground line (global y)
  panelH: 532,
};

/** desk-world geometry (desk-local coordinates, wide shot = identity) */
export const W = {
  screen: { x: 460, y: 24, w: 1000, h: 306 },
  inner: { x: 474, y: 38, w: 972, h: 278 },
  deckTop: 338,
  deckBot: 522,
  bs: { x: 1398, y: 364 }, // backspace key centre (computed approx, refined in Laptop)
  corner: { x: 1598, y: 478 }, // where the pulled keycap lands
  trash: { x: 1800, y: 448 }, // trash can mouth centre
};

const H = (h: number, m: number, s = 0) => h * 3600 + m * 60 + s;

export const clockSeconds = (F: number) => {
  if (F < 1600) return Math.floor(track(F, [[0, H(21, 0)], [1600, H(22, 0)]], lin));
  if (F < 3800) return Math.floor(track(F, [[1600, H(22, 0)], [3800, H(23, 15)]], lin));
  if (F < 5600) return Math.floor(track(F, [[3800, H(23, 30)], [5600, H(23, 48)]], lin));
  if (F < 6450) return Math.floor(track(F, [[5600, H(23, 48)], [6450, H(23, 55)]], lin));
  return H(23, 55);
};

export const energyAt = (F: number) =>
  track(F, [
    [0, 100],
    [1600, 70],
    [3700, 15],
    [3800, 10],
    [5620, 10],
    [6500, 60],
  ]);

// ---------------------------------------------------------------- document
export const DOC_TITLE = "《论矛盾的普遍性与特殊性》";
const PUNCT = /[，。！？…：、；“”《》\s]/g;
export const chars = (s: string) => s.replace(PUNCT, "").length;

const typed = (s: string, F: number, a: number, b: number) =>
  s.slice(0, Math.floor(ip(F, [a, b], [0, s.length], lin)));

export type Loop = { text: string; t0: number; t1: number; d0: number; d1: number; killer: "red" | "blue" };
export const LOOPS: Loop[] = [
  { text: "在日常生活中，我们常遇到矛盾……", t0: 1660, t1: 1830, d0: 1900, d1: 1985, killer: "red" },
  { text: "辩证唯物主义认为……", t0: 2120, t1: 2260, d0: 2400, d1: 2475, killer: "blue" },
  { text: "矛盾是事物发展的动力……", t0: 2570, t1: 2640, d0: 2680, d1: 2715, killer: "red" },
  { text: "首先，我们要明确……", t0: 2750, t1: 2800, d0: 2830, d1: 2858, killer: "blue" },
  { text: "综上所述……", t0: 2890, t1: 2925, d0: 2945, d1: 2965, killer: "red" },
  { text: "马克思……", t0: 3000, t1: 3020, d0: 3036, d1: 3050, killer: "blue" },
  { text: "我……", t0: 3075, t1: 3088, d0: 3098, d1: 3108, killer: "red" },
];
export const HEARTBEAT = { from: 3140, to: 3790 };

export const ROUGH1 = "先不管格式和文采了！哪怕写出一堆废话我也得先写完！";
export const ROUGH2 = "第一段：为什么我们总在空想？";
export const ROUGH_T = { a0: 4470, a1: 4630, b0: 4640, b1: 4720 };
const CONT = [
  "我们总在等一个完美的开头，可它从来没有来过。",
  "红叉和退格键看似在反对彼此，其实合伙把我按在原地。",
];
const REFINED = [
  "二、矛盾的同一性：完美主义与畏难相互依存、相互贯通。",
  "三、矛盾的斗争性：只有在实践中，才能打破空转的平衡。",
  "四、实践—认识—再实践：先完成，再完美。",
];

export type DocLine = { kind: "text"; t: string; hl?: number } | { kind: "bar"; w: number; hl?: number };
export type DocState = { lines: DocLine[]; count: number; deleting: boolean };

/** active Act2 loop (typing or deleting) */
export const loopAt = (F: number) => LOOPS.find((l) => F >= l.t0 && F < l.d1 + 6) ?? null;

export const docState = (F: number): DocState => {
  if (F < LOOPS[0].t0) return { lines: [], count: 0, deleting: false };
  if (F < 3800) {
    const lp = loopAt(F);
    if (!lp) return { lines: [], count: 0, deleting: false };
    let s = typed(lp.text, F, lp.t0, lp.t1);
    const deleting = F >= lp.d0 && F < lp.d1;
    if (F >= lp.d0) {
      const n = lp.text.length - Math.floor(ip(F, [lp.d0, lp.d1], [0, lp.text.length], lin));
      s = lp.text.slice(0, Math.max(0, n));
    }
    return { lines: s ? [{ kind: "text", t: s }] : [], count: chars(s), deleting };
  }
  if (F < ROUGH_T.a0) return { lines: [], count: 0, deleting: false };
  // Act3 rough draft + Act4 expansion
  const lines: DocLine[] = [];
  const a = typed(ROUGH1, F, ROUGH_T.a0, ROUGH_T.a1);
  if (a) lines.push({ kind: "text", t: a });
  const b = typed(ROUGH2, F, ROUGH_T.b0, ROUGH_T.b1);
  if (b) lines.push({ kind: "text", t: b });
  const c0 = typed(CONT[0], F, 4760, 4900);
  if (c0) lines.push({ kind: "text", t: c0 });
  const c1 = typed(CONT[1], F, 4920, 5080);
  if (c1) lines.push({ kind: "text", t: c1 });
  const real = lines.reduce((n, l) => n + (l.kind === "text" ? chars(l.t) : 0), 0);
  // scribble bars = rough sentences typed too fast to read
  const nBars = Math.floor(ip(F, [5100, 5560], [0, 8], lin));
  for (let i = 0; i < nBars; i++) lines.push({ kind: "bar", w: 0.55 + ((i * 37) % 40) / 100 });
  if (F >= 5600) {
    const more = Math.floor(ip(F, [6000, 6420], [0, 10], lin));
    for (let i = 0; i < more; i++) lines.push({ kind: "bar", w: 0.6 + ((i * 29) % 35) / 100, hl: 1 });
    const refined = [typed(REFINED[0], F, 5900, 6040), typed(REFINED[1], F, 6080, 6220), typed(REFINED[2], F, 6260, 6380)];
    for (const r of refined) if (r) lines.push({ kind: "text", t: r, hl: 1 });
  }
  let count = real;
  if (F >= 5080) count = Math.round(track(F, [[5080, real], [5560, 300]], lin));
  if (F >= 5600) count = Math.round(track(F, [[5600, 300], [6050, 850], [6400, 1500]]));
  return { lines, count, deleting: false };
};

/** cumulative keystrokes shown on the scoreboard */
export const keystrokesAt = (F: number) => Math.round(track(F, [[2930, 0], [3330, 2500]]));

// ---------------------------------------------------------------- camera
export type Shot = { cx: number; cy: number; s: number };
const SH = {
  OPEN: { cx: 960, cy: 210, s: 0.82 },
  W: { cx: 960, cy: 266, s: 1 },
  SCR: { cx: 960, cy: 178, s: 1.55 },
  KEY: { cx: 1320, cy: 386, s: 2.5 },
  CORNER: { cx: 1560, cy: 430, s: 2.0 },
  PHONE: { cx: 760, cy: 290, s: 1.45 },
  UP: { cx: 960, cy: -70, s: 1.15 },
  TRASH: { cx: 1730, cy: 420, s: 1.8 },
  BEAT: { cx: 960, cy: 178, s: 2.6 },
  DIM: { cx: 960, cy: 300, s: 1.08 },
} satisfies Record<string, Shot>;
type K = [number, Shot, ("cut" | "ease")?];
const CAM: K[] = [
  [0, SH.OPEN],
  [170, SH.W],
  [310, SH.W],
  [311, SH.SCR, "cut"],
  [430, SH.SCR],
  [470, SH.W],
  [1110, SH.W],
  [1150, SH.PHONE],
  [1380, SH.PHONE],
  [1430, SH.W],
  // Act2
  [1620, SH.W],
  [1655, SH.SCR],
  [1880, SH.SCR],
  [1881, SH.KEY, "cut"],
  [1935, SH.KEY],
  [1936, SH.SCR, "cut"],
  [2040, SH.SCR],
  [2070, SH.W],
  [2110, SH.W],
  [2135, SH.SCR],
  [2390, SH.SCR],
  [2391, SH.KEY, "cut"],
  [2445, SH.KEY],
  [2446, SH.SCR, "cut"],
  [2675, SH.SCR],
  [2676, SH.KEY, "cut"],
  [2705, SH.KEY],
  [2706, SH.SCR, "cut"],
  [2826, SH.SCR],
  [2827, SH.KEY, "cut"],
  [2850, SH.KEY],
  [2851, SH.SCR, "cut"],
  [2941, SH.SCR],
  [2942, SH.KEY, "cut"],
  [2960, SH.KEY],
  [2961, SH.W, "cut"],
  [3140, SH.W],
  [3180, SH.SCR],
  [3760, SH.BEAT],
  [3800, SH.DIM, "cut"],
  // Act3
  [4080, SH.DIM],
  [4130, SH.UP],
  [4250, SH.UP],
  [4251, SH.KEY, "cut"], // (face insert covers 4160–4250)
  [4340, SH.KEY],
  [4372, SH.CORNER],
  [4445, SH.CORNER],
  [4446, SH.SCR, "cut"],
  [4740, SH.SCR],
  [4790, SH.W],
  [5040, SH.W],
  [5080, SH.SCR],
  [5320, SH.SCR],
  [5370, SH.W],
  // Act4
  [5680, SH.W],
  [5720, SH.SCR],
  [6020, SH.SCR],
  [6060, SH.W],
  [6440, SH.W],
  [6441, SH.CORNER, "cut"],
  [6480, SH.CORNER],
  [6530, SH.TRASH],
  [6575, SH.TRASH],
  [6576, SH.SCR, "cut"],
  [6720, SH.SCR],
  [6770, SH.W],
];

const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const camAt = (F: number): Shot => {
  if (F <= CAM[0][0]) return CAM[0][1];
  for (let i = 0; i < CAM.length - 1; i++) {
    const [f0, a] = CAM[i];
    const [f1, b, mode] = CAM[i + 1];
    if (F < f1) {
      if (mode === "cut") return a;
      const t = easeIO((F - f0) / (f1 - f0));
      return { cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, s: a.s + (b.s - a.s) * t };
    }
  }
  return CAM[CAM.length - 1][1];
};

export const FACE_INSERT = { from: 4160, to: 4251 };

/** global camera shake (whole frame) */
export const shakeAt = (F: number) => {
  const bursts: [number, number, number][] = [
    [1870, 14, 8],
    [2380, 10, 6],
    [4338, 12, 10],
    [4392, 14, 12],
    [4830, 40, 18],
    [6655, 10, 5],
  ];
  let x = 0;
  let y = 0;
  for (const [s, d, a] of bursts) {
    if (F >= s && F < s + d) {
      const k = a * (1 - (F - s) / d);
      x += Math.sin(F * 2.7) * k;
      y += Math.cos(F * 3.3) * k * 0.7;
    }
  }
  return { x, y };
};

/** heartbeat pulse 0..1 (lub-dub) */
export const heartbeat = (F: number) => {
  const per = Math.round(ip(F, [HEARTBEAT.from, HEARTBEAT.to], [30, 18], lin));
  const t = (F - HEARTBEAT.from) % per;
  const bump = (c: number, w: number) => Math.max(0, 1 - Math.abs(t - c) / w);
  return Math.max(bump(2, 3), bump(8, 3) * 0.7);
};

/** Act3/4: backspace keycap state */
export const KEYCAP = { pryStart: 4290, pop: 4338, land: 4372, slap: 4392, pick: 6450, toss: 6490, inBin: 6535 };
