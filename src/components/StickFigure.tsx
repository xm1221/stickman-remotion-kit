import React from "react";
import { Pose, Pt } from "./poses";

export type Eyes = "normal" | "angry" | "dizzy" | "closed" | "wide" | "up" | "sad";
export type Mouth = "smile" | "frown" | "flat" | "open" | "grit" | "grin" | "none";

export type StickFigureProps = {
  pose: Pose;
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  facing?: 1 | -1;
  scaleY?: number;
  color?: string;
  strokeWidth?: number;
  eyes?: Eyes;
  mouth?: Mouth;
  glasses?: boolean;
  glassesTilt?: number;
  opacity?: number;
  armsOnly?: boolean;
  /** drawn in the figure's local coordinate space (after transform) */
  extras?: (p: Pose) => React.ReactNode;
  /** drawn behind the body, local space */
  behind?: (p: Pose) => React.ReactNode;
  /** over-shoulder / back view: hide face features */
  rear?: boolean;
};

const L = (a: Pt, b: Pt, c: string, w: number) => (
  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c} strokeWidth={w} strokeLinecap="round" />
);

const poly = (pts: Pt[], c: string, w: number) => (
  <polyline
    points={pts.map((q) => `${q.x},${q.y}`).join(" ")}
    fill="none"
    stroke={c}
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

export const HEAD_R = 21;

export const StickFigure: React.FC<StickFigureProps> = ({
  pose,
  x,
  y,
  scale = 1,
  rotate = 0,
  facing = 1,
  scaleY = 1,
  color = "#111",
  strokeWidth = 5,
  eyes = "normal",
  mouth = "flat",
  glasses = false,
  glassesTilt = 0,
  opacity = 1,
  armsOnly = false,
  extras,
  behind,
  rear = false,
}) => {
  const w = strokeWidth;
  const h = pose.head;
  // head tilt follows neck->head direction
  const ang = (Math.atan2(h.y - pose.neck.y, h.x - pose.neck.x) * 180) / Math.PI + 90;

  const eye = (ex: number, ey: number) => {
    switch (eyes) {
      case "closed":
        return <path d={`M${ex - 4},${ey} q4,4 8,0`} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />;
      case "dizzy":
        return (
          <g stroke={color} strokeWidth={2.5} strokeLinecap="round">
            <line x1={ex - 3.5} y1={ey - 3.5} x2={ex + 3.5} y2={ey + 3.5} />
            <line x1={ex + 3.5} y1={ey - 3.5} x2={ex - 3.5} y2={ey + 3.5} />
          </g>
        );
      case "wide":
        return (
          <g>
            <circle cx={ex} cy={ey} r={5} fill="#fff" stroke={color} strokeWidth={2} />
            <circle cx={ex} cy={ey} r={1.8} fill={color} />
          </g>
        );
      case "up":
        return <circle cx={ex} cy={ey - 3} r={2.8} fill={color} />;
      default:
        return <circle cx={ex} cy={ey} r={2.8} fill={color} />;
    }
  };

  const brow = () => {
    if (eyes === "angry")
      return (
        <g stroke={color} strokeWidth={3} strokeLinecap="round">
          <line x1={-2} y1={-12} x2={6} y2={-8} />
          <line x1={18} y1={-12} x2={10} y2={-8} />
        </g>
      );
    if (eyes === "sad")
      return (
        <g stroke={color} strokeWidth={2.5} strokeLinecap="round">
          <line x1={-1} y1={-8} x2={6} y2={-12} />
          <line x1={17} y1={-8} x2={10} y2={-12} />
        </g>
      );
    return null;
  };

  const mouthEl = () => {
    const mx = 8;
    const my = 9;
    switch (mouth) {
      case "smile":
        return <path d={`M${mx - 6},${my - 2} q6,6 12,0`} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />;
      case "grin":
        return <path d={`M${mx - 7},${my - 3} q7,10 14,0 z`} stroke={color} strokeWidth={2.2} fill="#fff" strokeLinejoin="round" />;
      case "frown":
        return <path d={`M${mx - 6},${my + 3} q6,-6 12,0`} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />;
      case "open":
        return <ellipse cx={mx} cy={my + 1} rx={4.5} ry={5.5} fill={color} />;
      case "grit":
        return (
          <g>
            <rect x={mx - 7} y={my - 2} width={14} height={7} fill="#fff" stroke={color} strokeWidth={2} />
            <line x1={mx - 7} y1={my + 1.5} x2={mx + 7} y2={my + 1.5} stroke={color} strokeWidth={1.5} />
          </g>
        );
      case "flat":
        return <line x1={mx - 5} y1={my} x2={mx + 5} y2={my} stroke={color} strokeWidth={2.5} strokeLinecap="round" />;
      default:
        return null;
    }
  };

  return (
    <g
      opacity={opacity}
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${facing * scale} ${scale * scaleY})`}
    >
      {behind?.(pose)}
      {!armsOnly && L(pose.neck, pose.hip, color, w)}
      {poly([pose.neck, pose.lElbow, pose.lHand], color, w)}
      {poly([pose.neck, pose.rElbow, pose.rHand], color, w)}
      {!armsOnly && poly([pose.hip, pose.lKnee, pose.lFoot], color, w)}
      {!armsOnly && poly([pose.hip, pose.rKnee, pose.rFoot], color, w)}
      {!armsOnly && (
        <g transform={`translate(${h.x} ${h.y}) rotate(${ang})`}>
          <circle cx={0} cy={0} r={HEAD_R} fill="#fff" stroke={color} strokeWidth={w} />
          {rear ? (
            // back of head: simple ear hints + hair arc
            <g stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round">
              <path d="M-14,-6 q-4,6 0,12" />
              <path d="M14,-6 q4,6 0,12" />
              <path d="M-10,-16 q10,-8 20,0" />
            </g>
          ) : (
            <g transform="translate(-4 0)">
              {eye(2, -2)}
              {eye(14, -2)}
              {brow()}
              {mouthEl()}
              {glasses && (
                <g transform={`rotate(${glassesTilt} 8 -2)`} stroke={color} strokeWidth={2} fill="none">
                  <circle cx={2} cy={-2} r={6} />
                  <circle cx={14} cy={-2} r={6} />
                  <line x1={8} y1={-2} x2={8} y2={-2} />
                  <line x1={-4} y1={-3} x2={-12} y2={-6} />
                </g>
              )}
            </g>
          )}
        </g>
      )}
      {extras?.(pose)}
    </g>
  );
};
