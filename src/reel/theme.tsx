// The theme every kit piece draws with: the style's colors and fonts, plus the
// colors derived from them (glows, glass, the ink that reads on the accent).
import React, { createContext, useContext, useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { fontFamily } from './fonts';
import { ReelStyle } from './style';

const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** `#RRGGBB` at an opacity, as rgba(). */
export const alpha = (hex: string, a: number): string => {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/** A color `p` of the way from `a` to `b`. */
export const mixColor = (a: string, b: string, p: number): string => {
  const ca = rgb(a);
  const cb = rgb(b);
  const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * p));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

const luminance = (hex: string): number => {
  const [r, g, b] = rgb(hex).map((v) => {
    const ch = v / 255;
    return ch <= 0.03928 ? ch / 12.92 : ((ch + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const makeTheme = (style: ReelStyle) => {
  const k = style.colors;
  return {
    style,
    c: {
      accent: k.accent,
      accentGlow: alpha(k.accent, 0.45),
      accentSoft: alpha(k.accent, 0.14),
      title: k.title,
      text: k.text,
      strike: k.strike,
      panel: k.panel,
      /** Text and icons drawn on top of the accent. */
      ink: luminance(k.accent) > 0.35 ? k.panel : '#FFFFFF',
      glass: alpha(k.panel, 0.78),
      glassLine: 'rgba(255, 255, 255, 0.12)',
      /** The panel color at an opacity: shades over the speaker. */
      shade: (a: number) => alpha(k.panel, a),
    },
    f: {
      title: fontFamily(style.fonts.title),
      text: fontFamily(style.fonts.text),
      highlight: fontFamily(style.fonts.highlight),
      label: fontFamily(style.fonts.label),
    },
  };
};

export type Theme = ReturnType<typeof makeTheme>;

const ThemeContext = createContext<Theme | null>(null);

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('Kit pieces must be inside <ReelShell>.');
  return theme;
};

/** The root of every reel: provides the theme and paints the backdrop. */
export const ReelShell: React.FC<{ reelStyle: ReelStyle; children: React.ReactNode }> = ({ reelStyle, children }) => {
  const theme = useMemo(() => makeTheme(reelStyle), [reelStyle]);
  return (
    <ThemeContext.Provider value={theme}>
      <AbsoluteFill style={{ background: theme.c.panel }}>{children}</AbsoluteFill>
    </ThemeContext.Provider>
  );
};
