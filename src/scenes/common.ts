import { L } from "../timeline";

export const MS = 1.6; // mind-theater figure scale
export const STAND_Y = L.ground + 6 - 64 * MS; // hip y for standing figures
export const LIE_Y = L.ground - 6 * MS; // hip y for lying/ground poses
export const SIT_Y = L.ground + 6 - 38 * MS; // hip y for figures sitting on a stool/chair
export const headY = (hipY: number, headDy = -86) => hipY + headDy * MS;
export const talk = (f: number, a: number, b: number) =>
  f >= a && f < b && Math.floor(f / 5) % 2 === 0 ? ("open" as const) : ("flat" as const);

import React from "react";
import { track } from "../utils";

/** true when a keyframed x track is changing at frame f */
export const moving = (f: number, keys: [number, number][]) => Math.abs(track(f + 1, keys) - track(f - 1, keys)) > 0.4;

/** stool / chair in the mind theater (x = seat centre) */
export const Chair = ({ x, back = -1, opacity = 1 }: { x: number; back?: 1 | -1; opacity?: number }) =>
  React.createElement(
    "g",
    { stroke: "#111", strokeWidth: 5, strokeLinecap: "round", fill: "none", opacity },
    React.createElement("line", { x1: x - 34, y1: SIT_Y + 6, x2: x + 34, y2: SIT_Y + 6 }),
    React.createElement("line", { x1: x - 28, y1: SIT_Y + 6, x2: x - 30, y2: L_GROUND }),
    React.createElement("line", { x1: x + 28, y1: SIT_Y + 6, x2: x + 30, y2: L_GROUND }),
    React.createElement("line", { x1: x + back * 34, y1: SIT_Y + 6, x2: x + back * 40, y2: SIT_Y - 70 }),
  );
const L_GROUND = 432;
