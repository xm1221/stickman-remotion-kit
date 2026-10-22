---
name: stickman-remotion-film
description: Use when asked to make a minimal line-art stick-figure short film (explainer, course assignment, comedy skit) as code with Remotion (React + TypeScript + SVG), rendered to MP4 without external image/audio assets.
---

# Stickman Remotion Film

This skill builds a 1–5 minute stick-figure film entirely in code: React components draw SVG, Remotion animates them frame by frame and renders an MP4. The worked example is `films/zhizhen-yu-guangbiao/`, the film 《指针与光标》 (tags `zhizhen-v3` and `zhizhen-v4`).

## 0. Before writing code
1. Read the brief or script and break it into **acts** with timestamps. Every act needs one visible *cause* inside the story for its turning point. Avoid deus-ex twists like "the battery hits 2% so he suddenly types": viewers and reviewers find them cheap. A character's active decision works better, e.g. physically pulling out the Backspace key.
2. Fix the spec early: 1920×1080, 30fps, total frames = seconds × 30. Use no external images or audio unless the user asks. Draw backgrounds (window, lamp, city lights) in SVG too.
3. Write one line per character describing its look, color, and personality, and use body language to show that personality. Example: red = perfectionist (glasses, pointer stick); blue = fear of difficulty (shrinks back, hesitates, never relaxed); black = the hero.

## 1. Project structure
```
npx create-video@latest --blank my-film && cd my-film
src/
  index.ts / Root.tsx    registerRoot + <Composition id="MyFilm" fps=30 1920x1080 durationInFrames={DURATION}>
  timeline.ts            SINGLE SOURCE OF TRUTH: FPS, DURATION, ACTS {from,dur}, layout constants,
                         and pure functions of the global frame F: clockSeconds(F), energyAt(F),
                         docState(F) (typed text / word count), camAt(F) (camera shot), shakeAt(F), event frames
  utils.ts               FONT, palette C, ip() = clamped+eased interpolate, track() keyframes, windowAlpha, hop
  MyFilm.tsx             assembly: top theater + bottom desk + divider + one <Sequence> per act + epilogue
  scenes/Act1..N.tsx     one file per act (mind-theater actors, bubbles, props)
  scenes/Desk.tsx        reality layer: camera system, hands, laptop, HUD
  scenes/common.ts       per-scene scale constants (figure scale, ground y, sit/lie hip y), talk(), moving()
  components/
    poses.ts             Pose = 11 joints {head,neck,hip,l/rElbow,l/rHand,l/rKnee,l/rFoot} relative to hip;
                         named poses (STAND, SIT_TYPE, HIGH_FIVE, SHRINK, ...), lerpPose, offsetPose,
                         poseTrack(f, [[frame,pose],...]) with ease-in-out, walkCycle(f,period), idleSway(base,f)
    StickFigure.tsx      draws a Pose: color, strokeWidth, facing ±1, eyes/mouth enums, glasses, armsOnly,
                         rear (back view), extras/behind render-props for held objects
    SpeechBubble.tsx     spring pop-in bubble with tail; Pop = onomatopoeia text ("咔!", "啪!")
    Laptop.tsx           SVG laptop: document window, word-count badge, blinking/heartbeat cursor,
                         perspective keyboard with addressable keys (e.g. Backspace highlight/removal)
    Room.tsx             night room background (window, lamp cone, mug steam, calendar, trash can)
    Effects.tsx          props + FX + HUD: Scoreboard, Clock/EnergyBar, Sparks, ImpactBurst, Shockwave,
                         IronBall, Wall, Eraser, RedX, Zzz, Keycap, BrawlCloud, DizzySpiral ...
    ThoughtFrame.tsx     dashed "mind theater" frame with trail bubbles down to the hero's head
```
Put all timing in `timeline.ts` and use **global frames** there. Inside a `<Sequence>`, `useCurrentFrame()` is local, so either add `ACTS.x.from` back or pass the global frame in as `frame`. Mixing the two up is the most common bug.

## 2. Layout pattern: split screen
- **Top (y 0..~540): mind theater.** The inner characters argue, team up, and fight in a thought frame. Use a ground line and a figure scale of ~1.6.
- **Bottom (~548..1080): reality.** The hero at a desk with a laptop, plus a HUD (clock, energy bar, counters).
- Draw a 4px divider line between them. The two layers should **mirror** each other: something in the mind causes something in reality, and the reverse (red slashes a red X → the Backspace key sparks → word count drops to 0).

### The desk must be readable: use first-person
An over-the-shoulder desk keeps failing because the screen ends up small and skewed, and the user can't read it. Instead:
- Make the screen **face the viewer**, large and centered (~1000–1440 px wide). Show only a shoulder silhouette and both hands (`armsOnly`) on a perspective keyboard.
- Get variety from **camera moves**, not a tilted angle: implement `camAt(F)` returning `{scale, x, y}` per shot, cut and push in (screen close-up, key close-up, phone, desk corner, trash can, look up at calendar). For reaction shots, insert a short face close-up.
- Add small ambient motion so nothing looks frozen: lamp flicker, steam, city lights, curtains, a moth.

## 3. Animation rules
- **Clamp every interpolate**: `interpolate(f, in, out, {extrapolateLeft:'clamp', extrapolateRight:'clamp', easing})`. Wrap this once as `ip()` and only call that. Without clamping, limbs and props fly off the canvas.
- Use `spring({frame: f - start, fps, config:{damping:10–14, stiffness:150–200}})` for pop-ins, impacts, and bubbles. Use eased `poseTrack` for body motion.
- **Legs must animate.** Characters that are moving use `walkCycle` (or `walkLegs` under a carry pose). Characters standing still use `idleSway`. Nobody stands perfectly still, and nobody slides around without stepping. Add `hop()` for jumps.
- Exaggerate the acting with anticipation, overshoot, and squash (`scaleY`). Make a fearful character's pose (shrinking, hesitating, peeking out) readable even as a silhouette.
- Use deterministic randomness only (`random(seed)` from remotion). Never call `Math.random()`.
- Keep each line of dialogue short (≤ ~20 CJK chars) and on screen ≥ 2 s. Don't narrate or lecture; let actions and the HUD numbers carry the irony (e.g. "敲了 2500 次键盘，留下 0 个字").
- Use a black pointer stick (#111) so it reads clearly against white.

## 4. CJK fonts
Set `FONT = '"Noto Sans CJK SC","PingFang SC","Microsoft YaHei",sans-serif'` and use it everywhere. The rendering machine must have one of these installed (Debian/Ubuntu: `sudo apt install fonts-noto-cjk`). Otherwise Chinese renders as tofu boxes. Don't load network fonts.

## 5. Commands
```bash
npm i
npm run dev                      # = npx remotion studio  (scrub the timeline in a browser)
npx tsc --noEmit                 # must be 0 errors before rendering
npx remotion still  src/index.ts PointerAndCursor out/check.png --frame=4330
npx remotion render src/index.ts PointerAndCursor out/x.mp4          # (entry can be omitted if default)
# faster draft: --scale=0.5  ;  partial: --frames=3800-5599 ;  parallel: --concurrency=50%
```
`remotion.config.ts` used here: `setVideoImageFormat("jpeg")`, `setOverwriteOutput(true)`, `setDefaultPremountInSeconds(2)`.

## 6. Verify before delivering
1. `npx tsc --noEmit`.
2. Render **stills** at each act's key beats: `scripts/stills.sh PointerAndCursor 300 1700 3200 4340 6500`. Open them and check for overlap, clipping, unreadable text, and limbs passing through props.
3. After the full render, run `scripts/contact-sheet.sh out/x.mp4 6 6`, which makes a timestamped thumbnail grid with ffmpeg. Scan it for blank or frozen stretches and continuity errors. Send the contact sheet together with the MP4.
4. Deliver only the MP4 (over 50 MB: use a file share, not git). Commit the source and tag each delivered version.

## 7. Lessons learned
- First-person, screen-facing desk is much more readable than over-the-shoulder.
- Legs must move (walkCycle / idleSway), or the figures look like paper cut-outs.
- Turning points should come from a character's choice, not an external alarm.
- Users often remove credits and add their own. Keep the epilogue/credits as a separate `Credits.tsx` sequence that is easy to cut.
- Video has no real audio here: on-screen onomatopoeia only. Add music/SFX later in an editor (e.g. 剪映) or with `<Audio>` if the user supplies files.
- Write the code directly rather than waiting on a sub-agent that hangs. Commit after every working version.
- Don't generate AI background images unless the user asks. SVG keeps the style consistent.

## 8. Helper tools in this kit (`tools/`)
- `tools/stix/`: a Claude-style skill (`SKILL.md`) plus a library of stick-figure SVG poses, expressions, props, and CSS transitions (walk_cycle, sit_down, head_drop, sweat_drops). Use it for pose ideas and joint coordinates. MIT, upstream bassimeledath/stix.
- `tools/stickfigure-recorder/`: webcam → PoseNet → stick-figure GIF. Act out a tricky motion (tug-of-war, hesitation) and use the result as reference for keyframes. MIT, upstream kenkawakenkenke/stickfigure-recorder. The Firebase API key is redacted; put your own in `web/src/framework/setup_firebase.js`, or just use https://stickfigure-recorder.web.app/.
- `tools/stickman-svg-editor/`: Solid.js editor that exports SMIL-animated SVG stickmen (`npm i && npm run dev`). Upstream madeindjs/stickman.
- `assets/svg-poses/`: 16 standalone pose SVGs (standing, walking_a/b, running_a/b, sitting, sitting_slouched, reaching, lifting, lying_down ...).
- `scripts/`: `stills.sh` and `contact-sheet.sh` for QA.
