// Line icons that draw themselves, in glass tiles. The set is in icons.ts; the few
// it lacks are drawn here in the same style.
import React from 'react';
import { mix, prog, useSpringAt, useTime } from '../lib/motion';
import { ICONS } from './icons';
import { useTheme } from './theme';

/** Same grid and stroke as icons.ts: 24x24, stroke-only, round joins. */
const EXTRA_ICONS: Record<string, { viewBox: string; body: string }> = {
  user: { viewBox: '0 0 24 24', body: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>' },
  audio: { viewBox: '0 0 24 24', body: '<path d="M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4"/>' },
  video: { viewBox: '0 0 24 24', body: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/>' },
  folder: { viewBox: '0 0 24 24', body: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' },
};

export const ICON_NAMES = [...Object.keys(ICONS), ...Object.keys(EXTRA_ICONS)];

const withPathLength = (body: string) => body.replace(/<(path|rect|circle|line|polyline|polygon|ellipse)\b/g, '<$1 pathLength="1"');

/** A line icon; `draw` (0 -> 1) traces its strokes. Its color defaults to the accent. */
export const Icon: React.FC<{ name: string; size: number; color?: string; draw?: number; width?: number }> = ({ name, size, color, draw = 1, width = 2 }) => {
  const { c } = useTheme();
  const icon = ICONS[name] ?? EXTRA_ICONS[name];
  if (!icon) throw new Error(`Unknown icon "${name}". Available: ${ICON_NAMES.join(', ')}`);
  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="none"
      stroke={color ?? c.accent}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw, overflow: 'visible' }}
      dangerouslySetInnerHTML={{ __html: withPathLength(icon.body) }}
    />
  );
};

/** A tile with an icon that draws itself in, floating gently. `tone`: dark glass or the accent. */
export const IconTile: React.FC<{
  name: string;
  at: number;
  out: number;
  x: number;
  y: number;
  size?: number;
  rot?: number;
  label?: string;
  tone?: 'glass' | 'accent';
}> = ({ name, at, out, x, y, size = 180, rot = 0, label, tone = 'glass' }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const pop = useSpringAt(at, 11, 0.6);
  if (t < at || t > out + 0.3) return null;
  const draw = prog(t, at + 0.08, 0.55);
  const leave = prog(t, out, 0.25);
  const life = t - at;
  const accent = tone === 'accent';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + Math.sin(life * 2.6) * 8,
        transform: `translate(-50%, -50%) rotate(${rot + Math.sin(life * 1.9) * 2}deg) scale(${(0.55 + 0.45 * pop) * (1 - 0.25 * leave)})`,
        opacity: Math.min(1, pop * 1.8) * (1 - leave),
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: accent ? c.accent : c.glass,
          border: `1.5px solid ${accent ? 'rgba(255,255,255,0.35)' : c.glassLine}`,
          backdropFilter: 'blur(16px)',
          boxShadow: `0 24px 60px rgba(0,0,0,0.45), 0 0 ${40 * draw}px ${accent ? c.accentGlow : c.accentSoft}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={name} size={size * 0.5} color={accent ? c.ink : c.accent} draw={draw} width={1.9} />
      </div>
      {label && (
        <div style={{ marginTop: 14, fontFamily: f.text, fontWeight: 700, fontSize: 34, color: c.text, textShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>
          {label}
        </div>
      )}
    </div>
  );
};

/** A cluster of nodes that wire themselves together: a network, a "second brain". */
const NODES: [number, number][] = [
  [60, 22], [100, 30], [128, 58], [120, 98], [86, 118], [46, 112], [20, 84], [24, 46], [72, 66], [98, 74], [52, 80],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 8], [8, 9], [9, 3], [8, 10], [10, 5], [1, 8], [9, 2], [10, 6], [7, 8], [4, 9],
];

export const BrainNet: React.FC<{ at: number; out: number; x: number; y: number; size?: number }> = ({ at, out, x, y, size = 220 }) => {
  const t = useTime();
  const { c } = useTheme();
  const pop = useSpringAt(at, 11, 0.6);
  if (t < at || t > out + 0.3) return null;
  const leave = prog(t, out, 0.25);
  const life = t - at;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + Math.sin(life * 2.4) * 8,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * pop) * (1 - 0.25 * leave)})`,
        opacity: Math.min(1, pop * 1.8) * (1 - leave),
        borderRadius: size * 0.28,
        background: c.glass,
        border: `1.5px solid ${c.glassLine}`,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 24px 60px rgba(0,0,0,0.45), 0 0 50px ${c.accentSoft}`,
      }}
    >
      <svg width={size} height={size} viewBox="-6 -6 160 150">
        {EDGES.map(([a, b], i) => {
          const p = prog(t, at + 0.1 + i * 0.035, 0.25);
          const [x1, y1] = NODES[a];
          const [x2, y2] = NODES[b];
          return <line key={i} x1={x1} y1={y1} x2={mix(x1, x2, p)} y2={mix(y1, y2, p)} stroke={c.accent} strokeOpacity={0.75} strokeWidth={2.4} strokeLinecap="round" />;
        })}
        {NODES.map(([nx, ny], i) => {
          const p = prog(t, at + i * 0.04, 0.2);
          const pulse = 1 + 0.25 * Math.max(0, Math.sin((life - i * 0.15) * 4));
          return <circle key={i} cx={nx} cy={ny} r={(i > 7 ? 7 : 5.5) * p * pulse} fill={i > 7 ? c.title : c.accent} />;
        })}
      </svg>
    </div>
  );
};
