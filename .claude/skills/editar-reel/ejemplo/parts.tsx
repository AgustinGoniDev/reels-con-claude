// Graphics that draw this reel's ideas: two layers, information -> output, the
// proposal being written, and the pile of folders that gets crossed out.
import React from 'react';
import { interpolate } from 'remotion';
import { mix, prog, useSpringAt, useTime } from '../../lib/motion';
import { Icon } from '../../reel/Icon';
import { alive, BAND_TOP, glassCard } from '../../reel/parts';
import { useTheme } from '../../reel/theme';

// ------------------------------------------------------------ two layers

export const TwoLayers: React.FC<{ at: number[]; out: number }> = ({ at, out }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const a = useSpringAt(at[0], 11, 0.7);
  const b = useSpringAt(at[1], 11, 0.7);
  if (!alive(t, at[0], out)) return null;
  const leave = prog(t, out, 0.25);
  const layer = (label: string, icon: string, p: number, y: number, accent: boolean) => (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: y,
        width: 640,
        height: 104,
        marginLeft: -320,
        borderRadius: 28,
        ...(accent ? { background: c.accent, boxShadow: `0 0 50px ${c.accentGlow}` } : glassCard(c)),
        color: accent ? c.ink : c.title,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: f.title,
        fontWeight: 800,
        fontSize: 42,
        transform: `perspective(900px) rotateX(46deg) translateY(${(1 - p) * -160}px)`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      <Icon name={icon} size={44} color={accent ? c.ink : c.accent} draw={prog(t, at[accent ? 1 : 0] + 0.1, 0.4)} width={2.3} />
      {label}
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: BAND_TOP - 30, height: 300, opacity: 1 - leave }}>
      {layer('Contexto fijo', 'lock', a, 140, false)}
      {t >= at[1] && layer('Datos', 'zap', b, 50, true)}
    </div>
  );
};

// ------------------------------------------------------------ information -> output

export const OutputFlow: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const pop = useSpringAt(at, 10, 0.6);
  const out2 = useSpringAt(at + 0.3, 10, 0.6);
  if (!alive(t, at, out)) return null;
  const leave = prog(t, out, 0.2);
  const arrow = prog(t, at + 0.12, 0.3);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: BAND_TOP + 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 18,
        opacity: Math.min(1, pop * 1.6) * (1 - leave),
        transform: `scale(${(0.7 + 0.3 * pop) * 1.3 * (1 - 0.2 * leave)})`,
        fontFamily: f.text,
        fontWeight: 700,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 20, ...glassCard(c), color: c.title, fontSize: 32 }}>
        <Icon name="database" size={34} width={2.2} />
        Información
      </div>
      <svg width={90} height={30} viewBox="0 0 90 30" style={{ overflow: 'visible' }}>
        <path
          d="M2 15 H80 M66 4 L82 15 L66 26"
          fill="none"
          stroke={c.accent}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrow}
        />
      </svg>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 30px',
          borderRadius: 20,
          background: c.accent,
          color: c.ink,
          fontFamily: f.title,
          fontWeight: 800,
          fontSize: 40,
          boxShadow: `0 0 50px ${c.accentGlow}`,
          transform: `scale(${0.6 + 0.4 * out2})`,
          opacity: Math.min(1, out2 * 2),
        }}
      >
        <Icon name="sparkles" size={36} color={c.ink} width={2.4} />
        Output
      </div>
    </div>
  );
};

// ------------------------------------------------------------ proposal document

export const DocCard: React.FC<{ at: number; out: number; x: number; y: number }> = ({ at, out, x, y }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const pop = useSpringAt(at, 11, 0.7);
  if (!alive(t, at, out)) return null;
  const leave = prog(t, out, 0.25);
  const write = interpolate(t, [at + 0.3, at + 2.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lines = [0.9, 0.75, 0.84, 0.58, 0.72];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 290,
        padding: 26,
        borderRadius: 28,
        ...glassCard(c),
        transform: `translate(-50%, -50%) rotate(${mix(12, 4, pop)}deg) translateX(${(1 - pop) * 300 + leave * 300}px)`,
        opacity: 1 - leave,
      }}
    >
      <Icon name="file-text" size={52} draw={prog(t, at + 0.1, 0.5)} width={1.9} />
      <div style={{ fontFamily: f.title, fontWeight: 800, fontSize: 32, color: c.title, margin: '10px 0 14px', lineHeight: 1.05 }}>
        Propuesta
        <br />
        <span style={{ fontFamily: f.highlight, fontStyle: 'italic', fontWeight: 400, fontSize: 38, color: c.accent }}>comercial</span>
      </div>
      {lines.map((w, i) => {
        const fill = Math.max(0, Math.min(1, write * lines.length - i));
        return <div key={i} style={{ height: 11, borderRadius: 11, marginTop: 12, width: `${w * fill * 100}%`, background: i === 0 ? c.accent : 'rgba(255,255,255,0.18)' }} />;
      })}
    </div>
  );
};

// ------------------------------------------------------------ "not accumulating": folders, crossed out

export const FolderPile: React.FC<{ at: number; cross: number; out: number; x: number; y: number }> = ({ at, cross, out, x, y }) => {
  const t = useTime();
  const { c } = useTheme();
  const p0 = useSpringAt(at, 10, 0.6);
  const p1 = useSpringAt(at + 0.09, 10, 0.6);
  const p2 = useSpringAt(at + 0.18, 10, 0.6);
  const p3 = useSpringAt(at + 0.27, 10, 0.6);
  if (!alive(t, at, out)) return null;
  const pops = [p0, p1, p2, p3];
  const leave = prog(t, out, 0.25);
  const x1 = prog(t, cross, 0.18);
  const x2 = prog(t, cross + 0.12, 0.18);
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: 1 - leave }}>
      {pops.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: (i % 2) * 22 - 70,
            top: -i * 74,
            width: 140,
            height: 104,
            borderRadius: 26,
            ...glassCard(c),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translateY(${(1 - p) * -260}px) rotate(${(i % 2 ? 6 : -5) * p}deg)`,
            opacity: Math.min(1, p * 2) * (t >= cross ? 0.55 : 1),
          }}
        >
          <Icon name="folder" size={56} draw={1} width={1.9} />
        </div>
      ))}
      {t >= cross && (
        <svg width={260} height={340} viewBox="0 0 260 340" style={{ position: 'absolute', left: -130, top: -250, overflow: 'visible' }}>
          {[
            [30, 30, 230, 310, x1],
            [230, 30, 30, 310, x2],
          ].map(([ax, ay, bx, by, p], i) => (
            <line key={i} x1={ax} y1={ay} x2={mix(ax, bx, p)} y2={mix(ay, by, p)} stroke={c.strike} strokeWidth={16} strokeLinecap="round" />
          ))}
        </svg>
      )}
    </div>
  );
};
