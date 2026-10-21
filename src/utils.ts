import { Easing, interpolate } from "remotion";

export const FONT =
  '"Noto Sans CJK SC","Noto Serif CJK SC","PingFang SC","Microsoft YaHei",sans-serif';

export const C = {
  black: "#111111",
  red: "#e03131",
  blue: "#1c7ed6",
  gray: "#868e96",
  green: "#2f9e44",
};

const ease = Easing.inOut(Easing.cubic);

/** clamped interpolate with default ease-in-out */
export const ip = (
  f: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = ease,
) =>
  interpolate(f, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const lin = (t: number) => t;

/** numeric keyframe track: [[frame, value], ...] */
export const track = (
  f: number,
  keys: [number, number][],
  easing: (t: number) => number = ease,
) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (f <= f1) {
      if (f1 === f0) return v1;
      return v0 + (v1 - v0) * easing((f - f0) / (f1 - f0));
    }
  }
  return keys[keys.length - 1][1];
};

/** value in [0,1] for a window: fades in over `fade` frames after start, out before end */
export const windowAlpha = (f: number, start: number, end: number, fade = 8) => {
  if (f < start || f > end) return 0;
  return Math.min(1, (f - start) / fade, (end - f) / fade);
};

/** parabolic jump: 0 at ends, `h` at middle */
export const hop = (f: number, start: number, end: number, h: number) => {
  if (f < start || f > end) return 0;
  const t = (f - start) / (end - start);
  return -4 * h * t * (1 - t);
};
