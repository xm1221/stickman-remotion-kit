import React from "react";
import { Composition } from "remotion";
import { PointerAndCursor } from "./PointerAndCursor";
import { DURATION, FPS } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PointerAndCursor"
      component={PointerAndCursor}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
