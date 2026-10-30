// The reel style: what estilo/estilo.json holds. The kit reads it through the theme
// (theme.tsx); a reel can override any part of it with input props, which is how
// the preview renders two variants of the same seconds without touching code.
import base from '../../estilo/estilo.json';

export type Platform = 'instagram' | 'tiktok' | 'shorts';

export type ReelStyle = {
  /** false until the criteria phase of the skill writes this style. */
  defined: boolean;
  name: string;
  platform: Platform;
  colors: {
    /** The one accent: keywords, icons, the call to action. */
    accent: string;
    /** Panel titles. */
    title: string;
    /** Captions and plain text. */
    text: string;
    /** Only for crossing things out. */
    strike: string;
    /** Dark base of panels, shades and the backdrop. */
    panel: string;
  };
  /** Google Fonts family names; the list available is in fonts.ts. */
  fonts: { title: string; text: string; highlight: string; label: string };
  captions: {
    /** lockup: two to four words around one big keyword. phrase: short lines with the spoken word lit. */
    mode: 'lockup' | 'phrase';
    /** Vertical center of the captions, in pixels. */
    y: number;
    /** Largest keyword size in lockup mode, in pixels. */
    keySize: number;
    uppercase: boolean;
  };
  camera: {
    /** Every join of the cut switches between two framings (1.0 and 1.07). */
    cuts: boolean;
    /** Small zoom hits on the reel's punch words. */
    punches: boolean;
    /** How much each shot pushes in while it lasts (0.02 = 2 %). */
    push: number;
  };
  sound: { effects: boolean; gain: number };
  cut: { speed: number; minPause: number };
  ending: { lead: string };
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
export type StyleOverrides = DeepPartial<ReelStyle>;

/** Input props of every reel composition: `--props='{"overrides": {...}}'`. */
export type ReelProps = { overrides?: StyleOverrides };

export const BASE_STYLE = base as ReelStyle;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const deepMerge = <T,>(target: T, over: unknown): T => {
  if (over === undefined) return target;
  if (!isObject(target) || !isObject(over)) return over as T;
  const out: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(over)) {
    out[key] = deepMerge((target as Record<string, unknown>)[key], value);
  }
  return out as T;
};

/** The style a reel renders with: `from` (the project style by default) plus `overrides`. */
export const mergeStyle = (overrides?: StyleOverrides, from: ReelStyle = BASE_STYLE): ReelStyle => deepMerge(from, overrides);
