import React from "react";
import { random } from "remotion";
import { DOC_TITLE, DocState, W } from "../timeline";
import { FONT } from "../utils";
import { Keycap, Sparks } from "./Effects";

/**
 * Pure-SVG laptop in desk-world coordinates (first-person: screen faces viewer,
 * keyboard deck foreshortened below it). Must be rendered inside an <svg>.
 */

const DT = W.deckTop;
const DB = W.deckBot;
const xl = (y: number) => 470 + (400 - 470) * ((y - DT) / (DB - DT));
const xr = (y: number) => 1450 + (1520 - 1450) * ((y - DT) / (DB - DT));
const ROW_Y = (r: number) => 352 + r * 27;
const ROW_H = 23;
const UNITS = 15;
const ux = (y: number, u: number) => {
  const a = xl(y) + 24;
  const b = xr(y) - 24;
  return a + ((b - a) * u) / UNITS;
};
const quad = (r: number, u0: number, u1: number) => {
  const y0 = ROW_Y(r);
  const y1 = y0 + ROW_H;
  const g = 0.08;
  return `${ux(y0, u0 + g)},${y0} ${ux(y0, u1 - g)},${y0} ${ux(y1, u1 - g)},${y1} ${ux(y1, u0 + g)},${y1}`;
};

const ROWS: number[][] = [
  [...Array(13).fill(1), 2],
  [1.5, ...Array(12).fill(1), 1.5],
  [1.75, ...Array(11).fill(1), 2.25],
  [2.25, ...Array(10).fill(1), 2.75],
  [1.5, 1.5, 7, 1.5, 1.5, 2],
];

const bsY = ROW_Y(0) + ROW_H / 2;
export const BS_CENTER = { x: (ux(bsY, 13) + ux(bsY, 15)) / 2, y: bsY, w: ux(bsY, 15) - ux(bsY, 13) - 4 };

export type LaptopProps = {
  frame: number;
  doc: DocState;
  pdfs?: number; // windows shown 0..20
  pdfClose?: number; // 0..1 closing
  bigCursor?: number | null; // heartbeat pulse 0..1 (null = off)
  showSubmit?: boolean;
  pressed?: boolean;
  success?: number;
  arrow?: { x: number; y: number } | null; // world coords
  bsFlash?: number; // 0..1
  keycap?: "on" | "pry" | "off";
  pry?: number; // 0..1 while prying
  typing?: boolean;
  dim?: number; // 0..1 screen darkening
};

const PDF_POS = Array.from({ length: 20 }).map((_, i) => ({
  x: 490 + random(`px${i}`) * 640,
  y: 70 + random(`py${i}`) * 110,
  r: (random(`pr${i}`) - 0.5) * 10,
}));

export const Laptop: React.FC<LaptopProps> = ({
  frame,
  doc,
  pdfs = 0,
  pdfClose = 0,
  bigCursor = null,
  showSubmit = false,
  pressed = false,
  success = 0,
  arrow = null,
  bsFlash = 0,
  keycap = "on",
  pry = 0,
  typing = false,
  dim = 0,
}) => {
  const S = W.screen;
  const I = W.inner;
  const cursorOn = Math.floor(frame / 15) % 2 === 0;
  const zero = doc.count === 0;
  const shown = doc.lines.length > 5 ? [doc.lines[0], doc.lines[1], ...doc.lines.slice(-3)] : doc.lines;
  const lineY0 = I.y + 132;
  const LH = 34;
  const hotKey = typing ? Math.floor(random(`k${Math.floor(frame / 3)}`) * 60) : -1;
  let ki = 0;

  return (
    <g fontFamily={FONT}>
      <defs>
        <clipPath id="scr">
          <rect x={I.x} y={I.y} width={I.w} height={I.h} rx={4} />
        </clipPath>
      </defs>
      {/* screen glow onto wall */}
      <ellipse cx={960} cy={180} rx={640} ry={240} fill="#e7f5ff" opacity={0.5 * (1 - dim)} />
      {/* lid */}
      <rect x={S.x} y={S.y} width={S.w} height={S.h} rx={16} fill="#111" />
      <g clipPath="url(#scr)">
        <rect x={I.x} y={I.y} width={I.w} height={I.h} fill="#fff" />
        {/* title bar */}
        <rect x={I.x} y={I.y} width={I.w} height={26} fill="#f1f3f5" />
        <line x1={I.x} y1={I.y + 26} x2={I.x + I.w} y2={I.y + 26} stroke="#111" strokeWidth={2} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={I.x + 16 + i * 16} cy={I.y + 13} r={5} fill="none" stroke="#111" strokeWidth={2} />
        ))}
        <text x={I.x + 70} y={I.y + 19} fontSize={15} fill="#495057">
          <tspan fontWeight={900} fill="#111">
            W{" "}
          </tspan>
          马原实践作业.docx
        </text>
        {/* word-count badge (top-right of doc) */}
        <g transform={`translate(${I.x + I.w - 96} ${I.y + 52})`}>
          <rect x={-78} y={-20} width={156} height={40} rx={10} fill={zero ? "#fff5f5" : "#ebfbee"} stroke={zero ? "#e03131" : "#2f9e44"} strokeWidth={3} />
          <text x={0} y={9} textAnchor="middle" fontSize={24} fontWeight={900} fill={zero ? "#e03131" : "#2b8a3e"}>
            字数：{doc.count}
          </text>
        </g>
        {/* title */}
        <text x={I.x + I.w / 2 - 40} y={I.y + 90} textAnchor="middle" fontSize={30} fontWeight={900} fill="#111">
          {DOC_TITLE}
        </text>
        {/* body */}
        {shown.length === 0 && bigCursor === null && (
          <line x1={I.x + 40} y1={lineY0 - 22} x2={I.x + 40} y2={lineY0 + 4} stroke="#111" strokeWidth={2.5} opacity={cursorOn ? 1 : 0} />
        )}
        {shown.map((l, i) => {
          const y = lineY0 + i * LH;
          const last = i === shown.length - 1;
          if (l.kind === "bar") {
            const w = (I.w - 100) * l.w;
            return (
              <g key={i}>
                {l.hl ? <rect x={I.x + 36} y={y - 20} width={w + 8} height={26} rx={4} fill="#d3f9d8" /> : null}
                <rect x={I.x + 40} y={y - 14} width={w} height={12} rx={6} fill={l.hl ? "#8ce99a" : "#ced4da"} />
                {last && <line x1={I.x + 44 + w} y1={y - 22} x2={I.x + 44 + w} y2={y + 4} stroke="#111" strokeWidth={2.5} opacity={cursorOn ? 1 : 0} />}
              </g>
            );
          }
          return (
            <g key={i}>
              {l.hl ? <rect x={I.x + 34} y={y - 24} width={l.t.length * 24 + 12} height={32} rx={4} fill="#ebfbee" /> : null}
              <text x={I.x + 40} y={y} fontSize={24} fill="#111" fontWeight={l.hl ? 700 : 400}>
                {l.t}
                {last && (
                  <tspan fontWeight={300} opacity={cursorOn ? 1 : 0}>
                    |
                  </tspan>
                )}
              </text>
            </g>
          );
        })}
        {doc.deleting && (
          <rect x={I.x} y={I.y + 26} width={I.w} height={I.h} fill="#e03131" opacity={0.08 + 0.08 * Math.sin(frame)} />
        )}
        {/* PDF windows */}
        {pdfs > 0 &&
          PDF_POS.slice(0, Math.ceil(pdfs)).map((p, i) => {
            const pop = Math.min(1, pdfs - i);
            const fall = pdfClose * (1 + (i % 5) * 0.2);
            return (
              <g
                key={i}
                transform={`translate(${p.x + 150} ${p.y + 95 + fall * 420}) rotate(${p.r + fall * (i % 2 ? 30 : -30)}) scale(${0.6 + pop * 0.4})`}
                opacity={pop * (1 - Math.min(1, fall))}
              >
                <rect x={-150} y={-95} width={300} height={190} rx={6} fill="#fff" stroke="#111" strokeWidth={3} />
                <rect x={-150} y={-95} width={300} height={28} rx={6} fill="#ffe3e3" stroke="#111" strokeWidth={3} />
                <text x={-138} y={-75} fontSize={16} fontWeight={800} fill="#c92a2a">
                  PDF 核心文献{String(i + 1).padStart(2, "0")}.pdf
                </text>
                <text x={136} y={-75} fontSize={16} fontWeight={900} textAnchor="end" fill="#111">
                  ×
                </text>
                {[0, 1, 2, 3, 4].map((k) => (
                  <rect key={k} x={-130} y={-50 + k * 24} width={k === 4 ? 140 : 250} height={9} rx={4} fill="#dee2e6" />
                ))}
              </g>
            );
          })}
        {/* heartbeat cursor */}
        {bigCursor !== null && (
          <g transform={`translate(${I.x + I.w / 2} ${I.y + 175}) scale(${1 + bigCursor * 0.45})`}>
            <rect x={-I.w} y={-I.h} width={I.w * 2} height={I.h * 2} fill="#e03131" opacity={bigCursor * 0.12} />
            <g opacity={0.35 + bigCursor * 0.65}>
              <line x1={0} y1={-62} x2={0} y2={62} stroke="#111" strokeWidth={9} strokeLinecap="round" />
              <line x1={-16} y1={-62} x2={16} y2={-62} stroke="#111" strokeWidth={7} strokeLinecap="round" />
              <line x1={-16} y1={62} x2={16} y2={62} stroke="#111" strokeWidth={7} strokeLinecap="round" />
            </g>
          </g>
        )}
        {/* submit */}
        {showSubmit && (
          <g transform={`translate(${I.x + I.w - 120} ${I.y + I.h - 34}) scale(${pressed ? 0.93 : 1})`}>
            <rect x={-96} y={-22} width={192} height={44} rx={10} fill={pressed ? "#2f9e44" : "#fff"} stroke="#2f9e44" strokeWidth={4} />
            <text x={0} y={9} textAnchor="middle" fontSize={24} fontWeight={900} fill={pressed ? "#fff" : "#2b8a3e"}>
              【提交作业】
            </text>
          </g>
        )}
        {success > 0 && (
          <g>
            <rect x={I.x} y={I.y} width={I.w} height={I.h} fill="#fff" opacity={Math.min(0.92, success)} />
            <g transform={`translate(${I.x + I.w / 2} ${I.y + I.h / 2 - 16}) scale(${success})`}>
              <circle r={86} fill="#2f9e44" />
              <path d="M-44 4 L-12 36 L48 -30" stroke="#fff" strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text y={128} textAnchor="middle" fontSize={34} fontWeight={900} fill="#2b8a3e">
                作业已提交 · 1500 字
              </text>
            </g>
          </g>
        )}
        {arrow && (
          <path
            transform={`translate(${arrow.x} ${arrow.y})`}
            d="M0 0 L0 30 L8 23 L14 36 L19 34 L13 21 L24 21 Z"
            fill="#fff"
            stroke="#111"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        )}
        {dim > 0 && <rect x={I.x} y={I.y} width={I.w} height={I.h} fill="#111" opacity={dim * 0.45} />}
      </g>
      {/* hinge */}
      <rect x={S.x + 20} y={S.y + S.h - 4} width={S.w - 40} height={10} rx={4} fill="#343a40" />
      {/* keyboard deck */}
      <path
        d={`M${xl(DT)} ${DT} L${xr(DT)} ${DT} L${xr(DB)} ${DB} L${xl(DB)} ${DB} Z`}
        fill="#e9ecef"
        stroke="#111"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d={`M${xl(DB)} ${DB} L${xr(DB)} ${DB} L${xr(DB) - 6} ${DB + 10} L${xl(DB) + 6} ${DB + 10} Z`} fill="#adb5bd" stroke="#111" strokeWidth={3} />
      {ROWS.map((row, r) => {
        let u = 0;
        return row.map((w, c) => {
          const u0 = u;
          u += w;
          const isBs = r === 0 && c === row.length - 1;
          const id = ki++;
          if (isBs) {
            return (
              <g key={`${r}-${c}`}>
                {/* socket (visible once keycap is gone) */}
                <polygon points={quad(r, u0, u)} fill="#343a40" stroke="#111" strokeWidth={2} />
                <rect x={BS_CENTER.x - 6} y={BS_CENTER.y - 6} width={12} height={12} rx={2} fill="#e03131" opacity={keycap === "on" ? 0 : 1} />
              </g>
            );
          }
          const hot = id === hotKey;
          return <polygon key={`${r}-${c}`} points={quad(r, u0, u)} fill={hot ? "#adb5bd" : "#fff"} stroke="#111" strokeWidth={2} />;
        });
      })}
      {/* backspace keycap on the deck */}
      {keycap !== "off" && (
        <g transform={`translate(0 ${-pry * 12}) rotate(${-pry * 14} ${BS_CENTER.x + BS_CENTER.w / 2} ${BS_CENTER.y})`}>
          <Keycap x={BS_CENTER.x} y={BS_CENTER.y - 2} w={BS_CENTER.w} h={ROW_H} glow={bsFlash} />
          {bsFlash > 0 && <rect x={BS_CENTER.x - BS_CENTER.w / 2} y={BS_CENTER.y - 13} width={BS_CENTER.w} height={ROW_H} rx={5} fill="#e03131" opacity={bsFlash * 0.55} />}
        </g>
      )}
      {bsFlash > 0 && <Sparks x={BS_CENTER.x} y={BS_CENTER.y - 10} frame={frame} size={46} n={12} seed="bs" />}
      {/* trackpad */}
      <polygon points={`${880},${490} ${1040},${490} ${1046},${514} ${874},${514}`} fill="#f8f9fa" stroke="#111" strokeWidth={3} />
    </g>
  );
};
