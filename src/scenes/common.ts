import { L } from "../timeline";

export const MS = 1.6; // mind-theater figure scale
export const STAND_Y = L.ground + 6 - 64 * MS; // hip y for standing figures
export const LIE_Y = L.ground - 6 * MS; // hip y for lying/ground poses
export const talk = (f: number, a: number, b: number) =>
  f >= a && f < b && Math.floor(f / 5) % 2 === 0 ? ("open" as const) : ("flat" as const);
