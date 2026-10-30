// Captions in two modes, chosen by the style:
// - lockup: two to four words at a time; the light words sit around one keyword
//   set big and bold, in the accent if it is a listed keyword, revealed word by word;
// - phrase: short lines of up to three words; the word being said lights up.
import React, { useMemo } from 'react';
import { interpolate } from 'remotion';
import { prog, useTime } from '../lib/motion';
import { norm, Word } from '../lib/words';
import { useTheme } from './theme';

type Token = { text: string; start: number; end: number };
export type Lockup = { before: Token[]; key: Token; after: Token[]; start: number; end: number; accent: boolean };

/** Spanish filler words: never the keyword of a lockup. */
const STOP = new Set(
  'lo que la es para un una el de y o en tu a ese esa eso como vos si se ahi no los las del al te me mi por todo pueden ser tenes una vez sea'.split(' '),
);

const MAX_WORDS = 4;

const phraseKey = (s: string) => s.split(' ').map(norm).join(' ');

const merge = (words: Word[], phrases: string[]): Token[] => {
  const pairs = phrases.map((p) => p.split(' ').map(norm));
  const out: Token[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = words[i + 1];
    const pair = next && pairs.find(([a, b]) => norm(w.text) === a && norm(next.text) === b);
    if (pair && !/[.,;:]$/.test(w.text)) {
      out.push({ text: `${w.text} ${next.text}`, start: w.start, end: next.end });
      i++;
    } else {
      out.push({ text: w.text, start: w.start, end: w.end });
    }
  }
  return out;
};

/**
 * Groups the words into lockups and picks each one's keyword.
 * - `keywords`: words or two-word phrases that win the keyword spot and take the accent.
 * - `phrases`: two-word pairs that read as one idea and stay together.
 * Without a listed keyword, the longest word that is not filler wins, in plain text color.
 */
export const toLockups = (words: Word[], { keywords = [] as string[], phrases = [] as string[], hold = 0.5 } = {}): Lockup[] => {
  const accent = new Set(keywords.map(phraseKey));
  const score = (tok: Token) => {
    const n = norm(tok.text.split(' ').join(''));
    if (accent.has(phraseKey(tok.text))) return 1000;
    if (STOP.has(n)) return 0;
    return n.length;
  };

  const groups: Token[][] = [];
  let cur: Token[] = [];
  for (const tok of merge(words, phrases)) {
    cur.push(tok);
    if (cur.length >= MAX_WORDS || /[.,;:?!]$/.test(tok.text)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);

  return groups.map((g, i) => {
    let k = 0;
    g.forEach((tok, j) => {
      if (score(tok) > score(g[k])) k = j;
    });
    const next = groups[i + 1];
    const last = g[g.length - 1].end;
    const key = g[k];
    return {
      before: g.slice(0, k),
      key,
      after: g.slice(k + 1),
      start: g[0].start,
      end: next && next[0].start - last < hold ? next[0].start : last + 0.3,
      accent: score(key) >= 1000,
    };
  });
};

const clean = (s: string) => s.replace(/[.,;:!?¿¡]/g, '');

const Small: React.FC<{ toks: Token[]; t: number; size: number; upper: boolean }> = ({ toks, t, size, upper }) => {
  const { c, f } = useTheme();
  return (
    <div style={{ fontFamily: f.text, fontWeight: 500, fontSize: size, color: c.text, opacity: 0.92, lineHeight: 1.1 }}>
      {toks.map((tok, i) => {
        const p = prog(t, tok.start, 0.14);
        const text = clean(tok.text);
        return (
          <span key={i} style={{ display: 'inline-block', margin: '0 0.14em', opacity: p, filter: `blur(${(1 - p) * 6}px)` }}>
            {upper ? text.toUpperCase() : text}
          </span>
        );
      })}
    </div>
  );
};

const Lock: React.FC<{ l: Lockup; t: number; y: number }> = ({ l, t, y }) => {
  const { c, f, style } = useTheme();
  const upper = style.captions.uppercase;
  const kp = interpolate(t, [l.key.start, l.key.start + 0.22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leave = prog(t, l.end - 0.08, 0.08);
  const text = clean(l.key.text);
  const size = Math.min(style.captions.keySize, 1000 / (text.length * (upper ? 0.66 : 0.56)));
  return (
    <div
      style={{
        position: 'absolute',
        left: 30,
        right: 30,
        top: y,
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        textShadow: '0 6px 30px rgba(0,0,0,0.55)',
        opacity: 1 - leave,
      }}
    >
      {l.before.length > 0 && <Small toks={l.before} t={t} size={50} upper={upper} />}
      <div
        style={{
          fontFamily: f.text,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          color: l.accent ? c.accent : c.text,
          textShadow: l.accent ? `0 0 34px ${c.accentGlow}, 0 6px 30px rgba(0,0,0,0.55)` : '0 6px 30px rgba(0,0,0,0.55)',
          opacity: kp,
          filter: `blur(${(1 - kp) * 14}px)`,
          transform: `scale(${1.12 - 0.12 * kp}) translateY(${(1 - kp) * 10}px)`,
        }}
      >
        {upper ? text.toUpperCase() : text}
      </div>
      {l.after.length > 0 && <Small toks={l.after} t={t} size={44} upper={upper} />}
    </div>
  );
};

// ------------------------------------------------------------ phrase mode

type Line = { words: Token[]; start: number; end: number };

const PHRASE_WORDS = 3;
const PHRASE_CHARS = 18;

const toLines = (words: Word[], hold = 0.5): Line[] => {
  const groups: Token[][] = [];
  let cur: Token[] = [];
  for (const w of words) {
    const length = [...cur, w].map((x) => clean(x.text)).join(' ').length;
    if (cur.length && (cur.length >= PHRASE_WORDS || length > PHRASE_CHARS)) {
      groups.push(cur);
      cur = [];
    }
    cur.push({ text: w.text, start: w.start, end: w.end });
    if (/[.,;:!?]$/.test(w.text)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups.map((g, i) => {
    const next = groups[i + 1];
    const last = g[g.length - 1].end;
    return { words: g, start: g[0].start, end: next && next[0].start - last < hold ? next[0].start : last + 0.3 };
  });
};

const PhraseLine: React.FC<{ line: Line; t: number; y: number; keys: Set<string> }> = ({ line, t, y, keys }) => {
  const { c, f, style } = useTheme();
  const upper = style.captions.uppercase;
  const pop = prog(t, line.start, 0.12);
  const leave = prog(t, line.end - 0.06, 0.06);
  const text = line.words.map((w) => clean(w.text)).join(' ');
  const size = Math.min(88, 1000 / (text.length * (upper ? 0.62 : 0.55)));
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: y,
        transform: `translateY(-50%) scale(${0.92 + 0.08 * pop})`,
        textAlign: 'center',
        fontFamily: f.title,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: '-0.01em',
        opacity: pop * (1 - leave),
      }}
    >
      {line.words.map((w, i) => {
        const next = line.words[i + 1];
        const speaking = t >= w.start && t < (next ? next.start : line.end);
        const lit = speaking || keys.has(norm(w.text));
        const word = clean(w.text);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              // Wide enough that the lit word, scaled up, never touches its neighbors.
              margin: '0 0.24em',
              color: lit ? c.accent : c.text,
              textShadow: '0 4px 0 rgba(0,0,0,0.35), 0 8px 26px rgba(0,0,0,0.6)',
              transform: `scale(${speaking ? 1.06 : 1})`,
            }}
          >
            {upper ? word.toUpperCase() : word}
          </span>
        );
      })}
    </div>
  );
};

/**
 * The reel's captions, in the style's mode, until `until` seconds (the ending takes
 * that space). `y` gives the vertical center at each second, so captions can move
 * down while the speaker is shifted.
 */
export const Captions: React.FC<{
  words: Word[];
  keywords?: string[];
  phrases?: string[];
  until?: number;
  y: (t: number) => number;
}> = ({ words, keywords = [], phrases = [], until = Infinity, y }) => {
  const t = useTime();
  const { style } = useTheme();
  const mode = style.captions.mode;
  const lockups = useMemo(() => toLockups(words, { keywords, phrases }).filter((l) => l.start < until), [words, keywords, phrases, until]);
  const lines = useMemo(() => toLines(words).filter((l) => l.start < until), [words, until]);
  const keys = useMemo(() => new Set(keywords.filter((k) => !k.includes(' ')).map(norm)), [keywords]);
  if (mode === 'phrase') {
    const line = lines.find((x) => t >= x.start - 0.02 && t < x.end);
    return line ? <PhraseLine line={line} t={t} y={y(t)} keys={keys} /> : null;
  }
  const l = lockups.find((x) => t >= x.start - 0.02 && t < x.end);
  return l ? <Lock l={l} t={t} y={y(t)} /> : null;
};
