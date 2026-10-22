export type Pt = { x: number; y: number };
export type Pose = {
  head: Pt;
  neck: Pt;
  hip: Pt;
  lElbow: Pt;
  lHand: Pt;
  rElbow: Pt;
  rHand: Pt;
  lKnee: Pt;
  lFoot: Pt;
  rKnee: Pt;
  rFoot: Pt;
};

const p = (x: number, y: number): Pt => ({ x, y });

const mk = (o: Partial<Pose>, base: Pose): Pose => ({ ...base, ...o });

export const JOINTS: (keyof Pose)[] = [
  "head",
  "neck",
  "hip",
  "lElbow",
  "lHand",
  "rElbow",
  "rHand",
  "lKnee",
  "lFoot",
  "rKnee",
  "rFoot",
];

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = {} as Pose;
  for (const j of JOINTS) {
    out[j] = { x: a[j].x + (b[j].x - a[j].x) * t, y: a[j].y + (b[j].y - a[j].y) * t };
  }
  return out;
};

/** add offsets to selected joints */
export const offsetPose = (a: Pose, o: Partial<Record<keyof Pose, Pt>>): Pose => {
  const out = { ...a };
  for (const k of Object.keys(o) as (keyof Pose)[]) {
    const d = o[k]!;
    out[k] = { x: a[k].x + d.x, y: a[k].y + d.y };
  }
  return out;
};

const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** keyframed pose track */
export const poseTrack = (f: number, keys: [number, Pose][]): Pose => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, a] = keys[i];
    const [f1, b] = keys[i + 1];
    if (f <= f1) {
      if (f1 === f0) return b;
      return lerpPose(a, b, easeIO((f - f0) / (f1 - f0)));
    }
  }
  return keys[keys.length - 1][1];
};

// ---------- standing poses (facing +x, hip at origin) ----------
export const STAND: Pose = {
  head: p(2, -86),
  neck: p(0, -62),
  hip: p(0, 0),
  lElbow: p(-12, -34),
  lHand: p(-16, -6),
  rElbow: p(12, -34),
  rHand: p(16, -6),
  lKnee: p(-8, 32),
  lFoot: p(-12, 64),
  rKnee: p(8, 32),
  rFoot: p(12, 64),
};

export const HANDS_HIP = mk(
  { lElbow: p(-24, -40), lHand: p(-8, -22), rElbow: p(24, -40), rHand: p(8, -22) },
  STAND,
);

export const POINT = mk(
  {
    head: p(8, -86),
    neck: p(4, -62),
    lElbow: p(-22, -42),
    lHand: p(-6, -24),
    rElbow: p(28, -58),
    rHand: p(54, -76),
  },
  STAND,
);

export const YELL = mk(
  {
    head: p(16, -84),
    neck: p(8, -61),
    lElbow: p(-22, -42),
    lHand: p(-6, -24),
    rElbow: p(30, -70),
    rHand: p(46, -104),
    rKnee: p(16, 30),
    rFoot: p(30, 62),
  },
  STAND,
);

export const ARMS_CROSS = mk(
  { lElbow: p(-14, -36), lHand: p(14, -44), rElbow: p(16, -32), rHand: p(-10, -42) },
  STAND,
);

export const PHONE_HOLD = mk(
  { head: p(6, -84), lElbow: p(-6, -30), lHand: p(18, -46), rElbow: p(12, -30), rHand: p(26, -50) },
  STAND,
);

export const WALK_A = mk(
  {
    head: p(6, -86),
    neck: p(3, -62),
    lElbow: p(14, -36),
    lHand: p(22, -10),
    rElbow: p(-12, -36),
    rHand: p(-22, -12),
    lKnee: p(-14, 30),
    lFoot: p(-30, 60),
    rKnee: p(16, 28),
    rFoot: p(22, 62),
  },
  STAND,
);
export const WALK_B = mk(
  {
    head: p(6, -86),
    neck: p(3, -62),
    lElbow: p(-12, -36),
    lHand: p(-22, -12),
    rElbow: p(14, -36),
    rHand: p(22, -10),
    lKnee: p(16, 28),
    lFoot: p(22, 62),
    rKnee: p(-14, 30),
    rFoot: p(-30, 60),
  },
  STAND,
);

/** Smooth stride between WALK_A and WALK_B (no snap). period = frames per full cycle. */
export const walkCycle = (f: number, period = 12): Pose => {
  const phase = ((f % period) + period) % period / period;
  const k = (Math.sin(phase * Math.PI * 2) + 1) / 2;
  return lerpPose(WALK_A, WALK_B, k);
};

/** Slight idle weight-shift on standing legs */
export const idleSway = (base: Pose, f: number, amp = 3): Pose => {
  const s = Math.sin(f / 18);
  return offsetPose(base, {
    lKnee: { x: -s * amp * 0.4, y: 0 },
    lFoot: { x: -s * amp, y: Math.abs(s) * 0.5 },
    rKnee: { x: s * amp * 0.4, y: 0 },
    rFoot: { x: s * amp, y: Math.abs(s) * 0.5 },
    hip: { x: s * amp * 0.3, y: 0 },
  });
};

/** Legs-only from walkCycle (for CARRY/SHOVEL overlays) */
export const walkLegs = (f: number, period = 12) => {
  const w = walkCycle(f, period);
  return { lKnee: w.lKnee, lFoot: w.lFoot, rKnee: w.rKnee, rFoot: w.rFoot };
};

export const KICK = mk(
  {
    head: p(-12, -82),
    neck: p(-8, -60),
    lElbow: p(-30, -54),
    lHand: p(-48, -66),
    rElbow: p(10, -48),
    rHand: p(30, -62),
    lKnee: p(-4, 32),
    lFoot: p(-12, 64),
    rKnee: p(32, -10),
    rFoot: p(68, -22),
  },
  STAND,
);

export const SWING_UP = mk(
  {
    head: p(-4, -86),
    neck: p(-4, -62),
    lElbow: p(-2, -92),
    lHand: p(-18, -116),
    rElbow: p(4, -92),
    rHand: p(-12, -118),
  },
  STAND,
);
export const SWING_DOWN = mk(
  {
    head: p(18, -80),
    neck: p(10, -58),
    lElbow: p(34, -60),
    lHand: p(62, -42),
    rElbow: p(36, -58),
    rHand: p(66, -40),
    rKnee: p(18, 30),
    rFoot: p(32, 62),
  },
  STAND,
);

export const FLAIL = mk(
  {
    lElbow: p(-30, -70),
    lHand: p(-40, -100),
    rElbow: p(30, -74),
    rHand: p(44, -100),
    lKnee: p(-18, 30),
    lFoot: p(-28, 60),
    rKnee: p(18, 30),
    rFoot: p(28, 60),
  },
  STAND,
);

export const OVERHEAD = mk(
  {
    lElbow: p(-14, -94),
    lHand: p(-10, -124),
    rElbow: p(14, -94),
    rHand: p(10, -124),
    lKnee: p(-14, 30),
    lFoot: p(-22, 64),
    rKnee: p(14, 30),
    rFoot: p(22, 64),
  },
  STAND,
);

export const DRAG = mk(
  {
    head: p(18, -80),
    neck: p(12, -58),
    lElbow: p(-16, -40),
    lHand: p(-40, -36),
    rElbow: p(-12, -44),
    rHand: p(-38, -40),
    lKnee: p(-12, 30),
    lFoot: p(-26, 62),
    rKnee: p(20, 28),
    rFoot: p(26, 62),
  },
  STAND,
);

export const ADJUST_GLASSES = mk(
  { rElbow: p(22, -58), rHand: p(14, -86), lElbow: p(-12, -34), lHand: p(-14, -6) },
  STAND,
);

export const INSPECT = mk(
  {
    head: p(30, -72),
    neck: p(18, -54),
    lElbow: p(-4, -38),
    lHand: p(4, -26),
    rElbow: p(32, -40),
    rHand: p(36, -62),
    rKnee: p(12, 32),
    rFoot: p(16, 64),
  },
  STAND,
);

export const WRITE = mk(
  {
    head: p(26, -76),
    neck: p(14, -56),
    lElbow: p(4, -30),
    lHand: p(20, -20),
    rElbow: p(36, -36),
    rHand: p(54, -18),
  },
  STAND,
);

export const SHOVEL = mk(
  {
    head: p(14, -82),
    neck: p(8, -60),
    lElbow: p(14, -36),
    lHand: p(30, -30),
    rElbow: p(24, -30),
    rHand: p(44, -14),
  },
  STAND,
);

export const CARRY = mk(
  {
    head: p(4, -88),
    lElbow: p(10, -40),
    lHand: p(28, -56),
    rElbow: p(16, -40),
    rHand: p(34, -56),
  },
  STAND,
);

export const CHEER = mk(
  { lElbow: p(-22, -86), lHand: p(-30, -114), rElbow: p(22, -86), rHand: p(30, -114) },
  STAND,
);

// ---------- ground poses (hip at origin, ground is y=+6) ----------
export const LIE_PHONE: Pose = {
  head: p(-84, -10),
  neck: p(-60, -4),
  hip: p(0, 0),
  lElbow: p(-60, -32),
  lHand: p(-76, -46),
  rElbow: p(-52, -30),
  rHand: p(-70, -50),
  lKnee: p(28, -26),
  lFoot: p(52, 0),
  rKnee: p(32, -2),
  rFoot: p(66, 0),
};

export const LIE_DAZED: Pose = {
  head: p(-86, -14),
  neck: p(-62, -4),
  hip: p(0, 0),
  lElbow: p(-52, -30),
  lHand: p(-34, -50),
  rElbow: p(-40, 14),
  rHand: p(-20, 22),
  lKnee: p(30, -6),
  lFoot: p(62, -14),
  rKnee: p(30, 4),
  rFoot: p(64, 6),
};

export const SIT_GROUND: Pose = {
  head: p(6, -82),
  neck: p(4, -58),
  hip: p(0, 0),
  lElbow: p(-14, -28),
  lHand: p(-26, -2),
  rElbow: p(-10, -28),
  rHand: p(-22, 0),
  lKnee: p(30, -4),
  lFoot: p(62, 0),
  rKnee: p(32, 0),
  rFoot: p(64, 2),
};

export const HUG_KNEES: Pose = {
  head: p(10, -76),
  neck: p(6, -54),
  hip: p(0, 0),
  lElbow: p(20, -28),
  lHand: p(34, -30),
  rElbow: p(22, -26),
  rHand: p(36, -28),
  lKnee: p(30, -34),
  lFoot: p(36, 0),
  rKnee: p(32, -32),
  rFoot: p(40, 0),
};

// ---------- desk-sitting poses for the hero (hip on chair, facing +x) ----------
export const SIT: Pose = {
  head: p(6, -86),
  neck: p(4, -62),
  hip: p(0, 0),
  lElbow: p(16, -32),
  lHand: p(36, -24),
  rElbow: p(20, -30),
  rHand: p(40, -22),
  lKnee: p(36, -2),
  lFoot: p(36, 36),
  rKnee: p(40, 0),
  rFoot: p(42, 38),
};

export const SIT_HOVER = mk(
  {
    head: p(12, -84),
    neck: p(8, -61),
    lElbow: p(28, -34),
    lHand: p(56, -40),
    rElbow: p(32, -32),
    rHand: p(62, -38),
  },
  SIT,
);

export const SIT_TYPE = mk(
  {
    head: p(14, -83),
    neck: p(9, -60),
    lElbow: p(30, -30),
    lHand: p(60, -30),
    rElbow: p(34, -28),
    rHand: p(66, -28),
  },
  SIT,
);

export const SIT_TYPE_LEAN = mk(
  {
    head: p(30, -78),
    neck: p(20, -56),
    lElbow: p(36, -26),
    lHand: p(62, -30),
    rElbow: p(40, -24),
    rHand: p(68, -28),
  },
  SIT,
);

export const SIT_GRAB_HEAD = mk(
  {
    head: p(8, -84),
    neck: p(6, -60),
    lElbow: p(-16, -80),
    lHand: p(-2, -100),
    rElbow: p(30, -78),
    rHand: p(16, -104),
  },
  SIT,
);

export const SIT_DROOP = mk(
  {
    head: p(18, -74),
    neck: p(10, -54),
    lElbow: p(22, -22),
    lHand: p(46, -20),
    rElbow: p(26, -20),
    rHand: p(50, -18),
  },
  SIT,
);

export const SIT_SLUMP = mk(
  {
    head: p(52, -50),
    neck: p(30, -46),
    lElbow: p(52, -26),
    lHand: p(76, -24),
    rElbow: p(56, -22),
    rHand: p(82, -22),
  },
  SIT,
);

export const SIT_JOLT = mk(
  {
    head: p(-2, -96),
    neck: p(-2, -70),
    lElbow: p(-22, -86),
    lHand: p(-34, -110),
    rElbow: p(22, -88),
    rHand: p(34, -112),
    lKnee: p(36, -10),
    lFoot: p(50, 24),
    rKnee: p(40, -8),
    rFoot: p(56, 26),
  },
  SIT,
);

export const SIT_ENTER_UP = mk(
  {
    head: p(16, -84),
    neck: p(10, -60),
    rElbow: p(38, -70),
    rHand: p(62, -96),
    lElbow: p(30, -30),
    lHand: p(60, -30),
  },
  SIT,
);

export const SIT_LEAN_BACK = mk(
  {
    head: p(-30, -78),
    neck: p(-18, -56),
    lElbow: p(-22, -28),
    lHand: p(-26, 2),
    rElbow: p(-16, -26),
    rHand: p(-18, 4),
    lKnee: p(42, 2),
    lFoot: p(76, 26),
    rKnee: p(44, 4),
    rFoot: p(80, 30),
  },
  SIT,
);
