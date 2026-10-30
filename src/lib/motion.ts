import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** Fast start, soft landing: the default ease of every reveal. */
export const easeReveal = Easing.bezier(0.16, 1, 0.3, 1);

/** Current time in seconds. Graphics anchor to word times, so they think in seconds. */
export const useTime = (): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** 0 -> 1 from `start` over `dur` seconds, eased. */
export const prog = (t: number, start: number, dur = 0.45, easing = easeReveal): number =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** A spring that starts at `start` seconds. Overshoots a little, for pops. */
export const useSpringAt = (start: number, damping = 14, mass = 0.7): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(start * fps), fps, config: { damping, mass } });
};

export const mix = (a: number, b: number, p: number): number => a + (b - a) * p;
