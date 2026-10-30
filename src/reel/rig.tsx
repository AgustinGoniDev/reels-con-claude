// The speaker's camera, the shade over it, the frozen tail and the sound effects:
// everything a reel needs besides its own graphics.
import React from 'react';
import { AbsoluteFill, Audio, Easing, Freeze, interpolate, OffthreadVideo, Sequence, staticFile } from 'remotion';
import { prog, useTime } from '../lib/motion';
import { FPS } from './format';
import { ReelStyle } from './style';
import { useTheme } from './theme';

/** Seconds the last frame is held after the speech ends, under the call to action. */
export const TAIL = 1.5;
export const reelFrames = (duration: number, tail = TAIL) => Math.ceil((duration + tail) * FPS);

export type Span = { from: number; to: number };

const ORIGIN_Y = 840;
const ease = Easing.bezier(0.2, 0.9, 0.1, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * A quiet camera over a full-frame speaker:
 * - with `camera.cuts`, every join of the cut switches between two framings (1.0
 *   and 1.07), so a removed pause reads as a cut; each shot pushes in `camera.push`;
 * - with `camera.punches`, `punches` are small zoom hits (+3 %) on key words;
 * - `shifts` are stretches where the speaker zooms in 15 % and moves down, to free
 *   a band above the head for a panel. A shift that starts at 0 is already in place
 *   on frame 0 (the cover).
 */
export const makeRig = ({
  joins,
  duration,
  style,
  shifts = [],
  punches = [],
}: {
  joins: number[];
  duration: number;
  style: ReelStyle;
  shifts?: Span[];
  punches?: number[];
}) => {
  const hits = style.camera.punches ? punches : [];

  const shiftAt = (t: number) =>
    shifts.length === 0
      ? 0
      : Math.max(
          ...shifts.map(({ from, to }) => {
            const enter = from === 0 ? 1 : interpolate(t, [from, from + 0.5], [0, 1], { ...clamp, easing: ease });
            const leave = interpolate(t, [to - 0.1, to + 0.45], [0, 1], { ...clamp, easing: ease });
            return Math.min(enter, 1 - leave);
          }),
        );

  const camera = (t: number) => {
    const shot = joins.filter((j) => j <= t).length;
    const start = shot ? joins[shot - 1] : 0;
    const end = shot < joins.length ? joins[shot] : duration;
    const base = style.camera.cuts && shot % 2 ? 1.07 : 1.0;
    const push = interpolate(t, [start, end], [0, style.camera.push], clamp);
    const punch = hits.reduce((acc, p) => {
      const dt = t - p;
      return dt < 0 ? acc : acc + 0.03 * Math.min(1, dt / 0.08) * Math.exp(-Math.max(0, dt - 0.08) * 3);
    }, 0);
    const shift = shiftAt(t);
    const s = base + push + punch + 0.15 * shift;
    // Moving down never uncovers the top edge: the frame is s times taller.
    const ty = shift * Math.min(150, ORIGIN_Y * (s - 1));
    return { s, ty, shift };
  };

  return { shiftAt, camera };
};

export type Rig = ReturnType<typeof makeRig>;

const Speaker: React.FC<{ video: string; rig: Rig; muted?: boolean }> = ({ video, rig, muted }) => {
  const t = useTime();
  const { s, ty } = rig.camera(t);
  return (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: `540px ${ORIGIN_Y}px`, transform: `translateY(${ty}px) scale(${s})` }}>
      <OffthreadVideo src={staticFile(video)} muted={muted} style={{ width: '100%', height: '100%', filter: 'contrast(1.06) saturate(1.06)' }} />
    </div>
  );
};

/** The speaker until the speech ends, then the last frame held for the tail. */
export const SpeakerTrack: React.FC<{ video: string; rig: Rig; duration: number }> = ({ video, rig, duration }) => {
  const t = useTime();
  const lastFrame = Math.floor(duration * FPS) - 1;
  return (
    <>
      <Sequence durationInFrames={lastFrame + 1}>
        <Speaker video={video} rig={rig} />
      </Sequence>
      {/* Freeze at the top level: inside a Sequence its frame is offset. */}
      {t * FPS > lastFrame && (
        <Freeze frame={lastFrame}>
          <Speaker video={video} rig={rig} muted />
        </Freeze>
      )}
    </>
  );
};

/** Darkens the top (title, panels) and the bottom (captions). Deeper behind the cover title until `coverOut`. */
export const Shade: React.FC<{ rig: Rig; coverOut?: number }> = ({ rig, coverOut }) => {
  const t = useTime();
  const { c } = useTheme();
  const top = 0.42 + 0.25 * rig.shiftAt(t);
  // The cover title can sit over a light wall: it needs a deeper shade behind it.
  const cover = coverOut === undefined ? 0 : 1 - prog(t, coverOut, 0.4);
  return (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${c.shade(top)} 0%, ${c.shade(top * 0.5)} 18%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)`,
        }}
      />
      {cover > 0 && (
        <AbsoluteFill
          style={{
            opacity: cover,
            background: `linear-gradient(180deg, ${c.shade(0.9)} 0%, ${c.shade(0.78)} 23%, ${c.shade(0)} 34%)`,
          }}
        />
      )}
    </>
  );
};

/** A sound effect from public/sfx at a time in seconds. */
export type Cue = { at: number; src: string; vol: number };

/** The reel's sound effects; silent when the style turns effects off. */
export const Sfx: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const { style } = useTheme();
  if (!style.sound.effects) return null;
  return (
    <>
      {cues.map((cue, i) => (
        <Sequence key={i} from={Math.round(cue.at * FPS)}>
          <Audio src={staticFile(`sfx/${cue.src}`)} volume={cue.vol * style.sound.gain} />
        </Sequence>
      ))}
    </>
  );
};
