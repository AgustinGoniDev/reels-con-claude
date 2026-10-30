// A cut made by tools/cut.py (words.json) and its face track (tools/track_face.py),
// ready to anchor graphics to words.
import { anchorer, Word } from '../lib/words';

type CutJson = { duration: number; joins: { time: number }[]; words: unknown[] };
type FaceJson = { fps: number; frames: unknown[] };
type FaceFrame = [number, number, number, number, number];

/**
 * `fixes` maps a word's start time (one decimal, as in words.json) to the right
 * text, for words Whisper got wrong. Each fix is confirmed with the speaker.
 */
export const loadCut = (data: CutJson, face: FaceJson, fixes: Record<string, string> = {}) => {
  const words = (data.words as Word[]).map((w) => ({ ...w, text: fixes[w.start.toFixed(1)] ?? w.text }));
  const frames = face.frames as FaceFrame[];
  return {
    duration: data.duration,
    joins: data.joins.map((j) => j.time),
    words,
    at: anchorer(words),
    /** The tracked face at `t` seconds, in the video's pixels. */
    faceAt: (t: number) => {
      const [cx, cy, w, h] = frames[Math.min(frames.length - 1, Math.max(0, Math.round(t * face.fps)))];
      return { cx, cy, w, h };
    },
  };
};
