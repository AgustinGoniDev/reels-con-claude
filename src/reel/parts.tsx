// Reel pieces every reel can use: the cover title, the top panel with chips, the
// call to action and the cover of what gets sent. Graphics that draw one reel's
// ideas live in that reel's folder (src/reels/<slug>/).
import React from 'react';
import { mix, prog, useSpringAt, useTime } from '../lib/motion';
import { Icon } from './Icon';
import { mixColor, Theme, useTheme } from './theme';

export const alive = (t: number, at: number, out: number, tail = 0.3) => t >= at && t <= out + tail;

/** Top of the free band above the head, below the app's top bar. */
export const BAND_TOP = 215;

/** The dark glass of panels and cards. */
export const glassCard = (c: Theme['c']): React.CSSProperties => ({
  background: c.glass,
  border: `1.5px solid ${c.glassLine}`,
  backdropFilter: 'blur(18px)',
  boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
});

// ------------------------------------------------------------ cover title

/** The cover: a lead line and a title, fully drawn on frame 0 (the thumbnail on the profile). */
export const CoverTitle: React.FC<{ lead: string; title: string; out: number }> = ({ lead, title, out }) => {
  const t = useTime();
  const { c, f } = useTheme();
  if (t > out + 0.4) return null;
  const leave = prog(t, out, 0.4);
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: 250,
        textAlign: 'center',
        opacity: 1 - leave,
        transform: `translateY(${-50 * leave}px)`,
        filter: `blur(${leave * 8}px)`,
        textShadow: '0 6px 30px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ fontFamily: f.title, fontWeight: 800, fontSize: 60, lineHeight: 1.05, color: c.text, letterSpacing: '-0.01em' }}>{lead}</div>
      <div style={{ fontFamily: f.highlight, fontStyle: 'italic', fontSize: 124, lineHeight: 1.0, color: c.accent, textShadow: `0 0 40px ${c.accentGlow}` }}>
        {title}
      </div>
    </div>
  );
};

// ------------------------------------------------------------ top panel with chips

export type ChipSpec = { icon: string; label: string; at: number };

const Chip: React.FC<{ chip: ChipSpec; exit?: number; locked: boolean }> = ({ chip, exit, locked }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const pop = useSpringAt(chip.at, 12, 0.6);
  if (t < chip.at) return null;
  const leave = exit !== undefined ? prog(t, exit, 0.35) : 0;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 24px',
        borderRadius: 20,
        background: locked ? c.accentSoft : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${locked ? c.accent : c.glassLine}`,
        fontFamily: f.text,
        fontWeight: 600,
        fontSize: 36,
        color: c.title,
        whiteSpace: 'nowrap',
        transform: `translate(${700 * leave}px, ${(1 - pop) * 20}px) scale(${0.7 + 0.3 * pop})`,
        opacity: Math.min(1, pop * 1.8) * (1 - leave),
      }}
    >
      <Icon name={chip.icon} size={36} draw={prog(t, chip.at + 0.05, 0.4)} width={2.2} />
      {chip.label}
    </div>
  );
};

/**
 * A glass panel in the band above the head: icon, title, optional subtitle and
 * badge, and chips that pop in one per spoken word. Use it inside a camera shift.
 * `exitAt` sends the chips out to the right (things that "come and go").
 */
export const Board: React.FC<{
  icon: string;
  title: string;
  at: number;
  out: number;
  sub?: { text: string; at: number };
  badge?: { text: string; at: number };
  chips: ChipSpec[];
  exitAt?: number;
}> = ({ icon, title, at, out, sub, badge, chips, exitAt }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const pop = useSpringAt(at, 13, 0.7);
  const badgePop = useSpringAt(badge?.at ?? 1e9, 9, 0.5);
  if (!alive(t, at, out, 0.3)) return null;
  const leave = prog(t, out, 0.3);
  const locked = badge !== undefined && t >= badge.at;
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: BAND_TOP - 5,
        padding: '22px 28px 24px',
        borderRadius: 34,
        ...glassCard(c),
        transform: `translateY(${(1 - pop) * -40 - 30 * leave}px) scale(${0.96 + 0.04 * pop})`,
        opacity: Math.min(1, pop * 1.6) * (1 - leave),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 76, height: 76, borderRadius: 22, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={44} color={c.ink} draw={prog(t, at + 0.1, 0.45)} width={2.3} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: f.title, fontWeight: 800, fontSize: 54, lineHeight: 1, color: c.title }}>{title}</div>
          {sub && (
            <div style={{ fontFamily: f.highlight, fontStyle: 'italic', fontSize: 40, lineHeight: 1.1, color: c.accent, marginTop: 2, opacity: prog(t, sub.at, 0.3) }}>
              {sub.text}
            </div>
          )}
        </div>
        {badge && t >= badge.at && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 18px',
              borderRadius: 999,
              background: c.accent,
              color: c.ink,
              fontFamily: f.label,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: '0.08em',
              transform: `scale(${mix(1.4, 1, badgePop)})`,
              opacity: Math.min(1, badgePop * 2),
            }}
          >
            <Icon name="lock" size={24} color={c.ink} width={2.6} />
            {badge.text.toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18, minHeight: 66 }}>
        {chips.map((chip, i) => (
          <Chip key={chip.label} chip={chip} locked={locked} exit={exitAt !== undefined ? exitAt + i * 0.08 : undefined} />
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------ call to action

/**
 * The ending: a lead ("Comenta" by default, from the style) and the word in a pill
 * of the accent, with an arrow that curves down to a comment bubble at the bottom
 * right, where the comment button sits in Instagram and TikTok.
 */
export const CommentCta: React.FC<{ at: number; keyAt: number; word: string; lead?: string; y: number }> = ({ at, keyAt, word, lead, y }) => {
  const t = useTime();
  const { c, f, style } = useTheme();
  const leadPop = useSpringAt(at, 12, 0.6);
  const key = useSpringAt(keyAt, 9, 0.55);
  if (t < at) return null;
  const arrow = prog(t, keyAt + 0.15, 0.55);
  const ring = ((t - keyAt) * 1.2) % 1;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            fontFamily: f.title,
            fontWeight: 800,
            fontSize: 62,
            color: c.text,
            textShadow: '0 6px 30px rgba(0,0,0,0.6)',
            opacity: Math.min(1, leadPop * 2),
            transform: `translateY(${(1 - leadPop) * 30}px)`,
          }}
        >
          {lead ?? style.ending.lead}
        </div>
        {t >= keyAt && (
          <div
            style={{
              marginTop: 12,
              padding: '14px 40px 18px',
              borderRadius: 30,
              background: c.accent,
              color: c.ink,
              fontFamily: f.title,
              fontWeight: 900,
              fontSize: 112,
              lineHeight: 1,
              letterSpacing: '0.02em',
              boxShadow: `0 0 70px ${c.accentGlow}, 0 24px 60px rgba(0,0,0,0.4)`,
              transform: `scale(${mix(1.5, 1, key)}) rotate(${mix(-6, -2, key)}deg)`,
              opacity: Math.min(1, key * 2),
            }}
          >
            {word.toUpperCase()}
          </div>
        )}
      </div>
      {t >= keyAt && (
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <path
            d={`M 760 ${y + 250} C 900 ${y + 260}, 960 ${y + 300}, 975 ${y + 395}`}
            fill="none"
            stroke={c.accent}
            strokeWidth={9}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - arrow}
            style={{ filter: `drop-shadow(0 0 12px ${c.accentGlow})` }}
          />
          <path
            d={`M 950 ${y + 375} L 975 ${y + 405} L 1000 ${y + 372}`}
            fill="none"
            stroke={c.accent}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={arrow > 0.95 ? 1 : 0}
          />
          <circle cx={975} cy={y + 470} r={44 + 40 * ring} fill="none" stroke={c.accent} strokeWidth={4} opacity={(1 - ring) * prog(t, keyAt + 0.6, 0.2)} />
        </svg>
      )}
      {t >= keyAt + 0.55 && (
        <div
          style={{
            position: 'absolute',
            left: 975 - 44,
            top: y + 470 - 44,
            width: 88,
            height: 88,
            borderRadius: 88,
            background: c.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 40px ${c.accentGlow}`,
            transform: `scale(${prog(t, keyAt + 0.55, 0.2)})`,
          }}
        >
          <Icon name="message" size={46} color={c.ink} width={2.4} />
        </div>
      )}
    </div>
  );
};

/** The cover of what gets sent to whoever comments (a guide, a template). */
export const GuideCover: React.FC<{
  at: number;
  x: number;
  y: number;
  title: string;
  accent: string;
  eyebrow?: string;
  icon?: string;
  scale?: number;
}> = ({ at, x, y, title, accent, eyebrow = 'GUÍA COMPLETA', icon = 'layers', scale = 1 }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const pop = useSpringAt(at, 10, 0.6);
  if (t < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 290,
        height: 370,
        padding: '28px 26px',
        boxSizing: 'border-box',
        borderRadius: 26,
        background: `linear-gradient(160deg, ${mixColor(c.panel, c.accent, 0.18)} 0%, ${c.panel} 70%)`,
        border: `2px solid ${c.accent}`,
        boxShadow: `0 30px 70px rgba(0,0,0,0.5), 0 0 50px ${c.accentGlow}`,
        transform: `translate(-50%, -50%) translateY(${(1 - pop) * 400}px) rotate(${mix(18, 6, pop)}deg) scale(${scale})`,
        opacity: Math.min(1, pop * 2),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontFamily: f.label, fontWeight: 800, fontSize: 22, letterSpacing: '0.2em', color: c.accent }}>{eyebrow}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Icon name={icon} size={110} draw={prog(t, at + 0.15, 0.6)} width={1.6} />
      </div>
      <div style={{ fontFamily: f.title, fontWeight: 800, fontSize: 40, lineHeight: 1, color: c.title }}>{title}</div>
      <div style={{ fontFamily: f.highlight, fontStyle: 'italic', fontSize: 52, lineHeight: 1, color: c.accent }}>{accent}</div>
    </div>
  );
};
