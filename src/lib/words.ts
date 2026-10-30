export type Word = { text: string; start: number; end: number; segment: number };
export type Chunk = { text: string; start: number; end: number };

export const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

/**
 * Returns `at(word, after)`: the start time of the first `word` at or after
 * `after` seconds. It throws when the word is missing, so a re-cut that drops
 * an anchor fails loudly instead of drifting a graphic.
 */
export const anchorer =
  (words: Word[]) =>
  (word: string, after = 0): number => {
    const hit = words.find((w) => w.start >= after - 1e-3 && norm(w.text) === norm(word));
    if (!hit) {
      throw new Error(`Anchor word "${word}" not found after ${after}s`);
    }
    return hit.start;
  };

/**
 * Groups words into caption chunks of up to `maxWords` words and `maxChars`
 * characters, breaking at punctuation. A chunk stays on screen until the next
 * one starts, unless the pause is longer than `hold`.
 */
export const toChunks = (words: Word[], maxWords = 3, maxChars = 20, hold = 0.6): Chunk[] => {
  const groups: Word[][] = [];
  let current: Word[] = [];
  for (const w of words) {
    const length = [...current, w].map((x) => x.text).join(' ').length;
    if (current.length && (current.length >= maxWords || length > maxChars)) {
      groups.push(current);
      current = [];
    }
    current.push(w);
    if (/[.,;:!?]$/.test(w.text)) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);

  return groups.map((g, i) => {
    const next = groups[i + 1];
    const end = g[g.length - 1].end;
    return {
      text: g
        .map((w) => w.text)
        .join(' ')
        .replace(/[.,;:!?¿¡]/g, '')
        .toUpperCase(),
      start: g[0].start,
      end: next && next[0].start - end < hold ? next[0].start : end + 0.25,
    };
  });
};
