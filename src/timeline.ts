import { ip, lin, track } from "./utils";

export const FPS = 30;
export const DURATION = 5040; // ~2:48 — acts + short black hold

export const ACTS = {
  act1: { from: 0, dur: 1050 },
  act2: { from: 1050, dur: 1650 },
  act3: { from: 2700, dur: 1500 },
  act4: { from: 4200, dur: 750 },
  credits: { from: 4950, dur: 90 }, // black hold only
};

/** layout constants — lower half is true first-person desk */
export const L = {
  divider: 548,
  ground: 430, // mind-theater ground line
  // FP: arms origin bottom-center; large screen facing viewer
  heroX: 960,
  heroY: 1205,
  heroScale: 2.5,
  deskY: 1010,
  screen: { x: 240, y: 560, w: 1440, h: 390 },
  clock: { x: 1705, y: 575 },
};

const H = (h: number, m: number, s = 0) => h * 3600 + m * 60 + s;

/** seconds of the day shown on the clock */
export const clockSeconds = (F: number) => {
  if (F < 1050) return H(22, 0) + Math.floor(F / 30) * 8;
  if (F < 1800) return Math.floor(track(F, [[1050, H(22, 4, 40)], [1800, H(23, 20)]]));
  if (F < 2705) return Math.floor(track(F, [[1800, H(23, 20)], [2700, H(23, 46)]], lin));
  if (F < 4200) return Math.floor(track(F, [[2705, H(23, 51)], [4200, H(23, 56, 30)]], lin));
  if (F < 4650) return Math.floor(track(F, [[4200, H(23, 56, 30)], [4650, H(23, 58, 30)]], lin));
  return H(23, 58, 30) + Math.floor((F - 4650) / 30);
};

export const fmtClock = (s: number) => {
  const h = Math.floor(s / 3600) % 24;
  const m = Math.floor(s / 60) % 60;
  const sec = s % 60;
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(h)}:${z(m)}:${z(sec)}`;
};

export const energyAt = (F: number) =>
  track(F, [
    [0, 100],
    [1100, 100],
    [1760, 15],
    [2700, 15],
    [2760, 8],
    [3180, 8],
    [4200, 62],
    [4700, 86],
  ]);

export const batteryAt = (F: number) => {
  if (F < 2700) return Math.round(track(F, [[0, 78], [2700, 11]], lin));
  return 3;
};

export const LINE0 = "马克思指出，实践是……";
export const BODY = [
  "1. 选题背景：大学生的内耗",
  "2. 核心原因：思虑过多与行动停滞",
  "3. 解决路径：先做起来再迭代",
];
export const EXAMPLE = "   例：期末前夜，一边焦虑一边刷手机……";

const typed = (s: string, F: number, a: number, b: number) =>
  s.slice(0, Math.floor(ip(F, [a, b], [0, s.length], lin)));

/** document lines shown on the laptop */
export const docLines = (F: number): string[] => {
  if (F < 1200) return [];
  if (F < 1500) return [typed(LINE0, F, 1200, 1440)];
  if (F < 1600) {
    const n = LINE0.length - Math.floor(ip(F, [1500, 1580], [0, LINE0.length], lin));
    return n > 0 ? [LINE0.slice(0, n)] : [];
  }
  if (F < 3200) return [];
  const lines = [
    typed(BODY[0], F, 3200, 3410),
    typed(BODY[1], F, 3460, 3710),
    typed(BODY[2], F, 3760, 3990),
  ].filter((s) => s.length > 0);
  if (F >= 4350) lines.push(typed(EXAMPLE, F, 4350, 4600));
  return lines;
};

export const progressAt = (F: number) =>
  Math.round(track(F, [[3150, 0], [4200, 60], [4640, 100]], lin));

/** global camera shake */
export const shakeAt = (F: number) => {
  const bursts: [number, number, number][] = [
    // start, duration, amplitude
    [1500, 80, 3],
    [2700, 70, 16],
    [3440, 18, 12],
    [3740, 18, 12],
    [4020, 18, 14],
    [4690, 8, 6],
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

/** meteor schedule (global frames): launch -> impact after 30f */
export const METEORS = [
  { launch: 3412, label: "选题背景", tx: 880 },
  { launch: 3712, label: "核心原因", tx: 1000 },
  { launch: 3992, label: "解决路径", tx: 1120 },
];
