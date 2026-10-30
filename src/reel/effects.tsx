// Small effects: a burst of sparkles and a tile with a real logo.
import React from 'react';
import { Img, random, staticFile } from 'remotion';
import { prog, useSpringAt, useTime } from '../lib/motion';
import { alive } from './parts';
import { useTheme } from './theme';

/** A short burst of four-point sparkles around (x, y), in the accent and white. */
export const Sparkles: React.FC<{ at: number; x: number; y: number; n?: number; radius?: number; color?: string }> = ({ at, x, y, n = 12, radius = 260, color }) => {
  const t = useTime();
  const { c } = useTheme();
  const dt = t - at;
  if (dt < 0 || dt > 0.8) return null;
  const p = dt / 0.8;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`a${at}${i}`) * 0.5;
        const r = radius * (0.5 + 0.5 * random(`r${at}${i}`)) * (1 - Math.pow(1 - p, 3));
        const size = (14 + 18 * random(`s${at}${i}`)) * (1 - p);
        const cx = x + Math.cos(a) * r;
        const cy = y + Math.sin(a) * r;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy - size} Q ${cx} ${cy} ${cx + size} ${cy} Q ${cx} ${cy} ${cx} ${cy + size} Q ${cx} ${cy} ${cx - size} ${cy} Q ${cx} ${cy} ${cx} ${cy - size} Z`}
            fill={i % 3 === 0 ? 'white' : color ?? c.accent}
            opacity={1 - p * 0.6}
          />
        );
      })}
    </svg>
  );
};

/**
 * The real logo of a tool that is named, in a floating tile. `src` is a file in
 * public/logos/ (the official SVG or PNG, in color); `bg` is the tile color.
 */
export const LogoTile: React.FC<{
  src: string;
  bg: string;
  at: number;
  out: number;
  x: number;
  y: number;
  size?: number;
  rot?: number;
  label?: string;
}> = ({ src, bg, at, out, x, y, size = 200, rot = 0, label }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const pop = useSpringAt(at, 9, 0.6);
  if (!alive(t, at, out)) return null;
  const life = t - at;
  const leave = prog(t, out, 0.22);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + Math.sin(life * 2.6) * 8,
        transform: `translate(-50%, -50%) rotate(${rot + Math.sin(life * 1.9) * 2}deg) scale(${(0.5 + 0.5 * pop) * (1 - 0.25 * leave)})`,
        opacity: Math.min(1, pop * 1.8) * (1 - leave),
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.26,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.14)',
        }}
      >
        <Img src={staticFile(`logos/${src}`)} style={{ width: size * 0.6, height: size * 0.6, objectFit: 'contain' }} />
      </div>
      {label && (
        <div style={{ marginTop: 14, fontFamily: f.text, fontWeight: 700, fontSize: 34, color: c.text, textShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>
          {label}
        </div>
      )}
    </div>
  );
};
