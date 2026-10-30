// Reel "TEMA", in the project style (estilo/estilo.json).
//
// Visual script: each moment, the word that brings it in and the word that takes it out.
//   cover   "LEAD" / "TITLE"                      frame 0 -> first key word + 0.25 s
//   panel   Board "TITLE" with chips              at('WORD') -> at('WORD')   (inside a shift)
//   tile    IconTile "ICON" beside the cheek      at('WORD') -> at('WORD')
//   ending  lead + WORD + cover of what is sent   at('WORD') -> end
//
// Copy to src/reels/<slug>/ with data.ts, rename ReelNuevo to Reel<Slug>, replace every TODO.
// at(word, after) throws when the word is not in the cut: a TODO left behind fails loudly.
import React, { useMemo } from 'react';
import { Captions } from '../../reel/Captions';
import { IconTile } from '../../reel/Icon';
import { Board, CommentCta, CoverTitle, GuideCover } from '../../reel/parts';
import { Cue, makeRig, reelFrames, Sfx, Shade, SpeakerTrack } from '../../reel/rig';
import { mergeStyle, ReelProps } from '../../reel/style';
import { ReelShell } from '../../reel/theme';
import { at, duration, joins, VIDEO, words } from './data';

export const REEL_FRAMES = reelFrames(duration);

/** The cover: what the reel is about, readable on frame 0 (it is the thumbnail on the profile). */
const COVER = { lead: 'TODO lead', title: 'TODO title' };

const A = {
  first: at('TODO'),
  panel: at('TODO'),
  chip1: at('TODO'),
  chip2: at('TODO'),
  panelOut: at('TODO'),
  tile: at('TODO'),
  tileOut: at('TODO'),
  ending: at('TODO'),
  endingWord: at('TODO', at('TODO')),
  guide: at('TODO', at('TODO')),
};

const COVER_OUT = A.first + 0.25;

/** The words that carry the idea: they win the keyword spot and take the accent. */
const KEYWORDS: string[] = ['TODO'];
/** Two-word ideas that stay together as one keyword. */
const PHRASES: string[] = [];

/** The speaker moves down while there is text above the head. */
const SHIFTS = [
  { from: 0, to: COVER_OUT },
  { from: A.panel - 0.35, to: A.panelOut },
];
/** Short zoom hits on strong words (only if the style has camera.punches). */
const PUNCHES = [A.panel, A.tile];

const SFX: Cue[] = [
  { at: A.panel, src: 'whoosh_corto.wav', vol: 0.35 },
  { at: A.chip1, src: 'click_003.ogg', vol: 0.35 },
  { at: A.chip2, src: 'click_003.ogg', vol: 0.35 },
  { at: A.tile, src: 'pop.wav', vol: 0.4 },
  { at: A.ending, src: 'whoosh_corto.wav', vol: 0.35 },
  { at: A.endingWord, src: 'impactSoft_heavy_003.ogg', vol: 0.35 },
  { at: A.endingWord + 0.55, src: 'switch_005.ogg', vol: 0.35 },
  { at: A.guide, src: 'whoosh.wav', vol: 0.35 },
];

export const ReelNuevo: React.FC<ReelProps> = ({ overrides }) => {
  const style = useMemo(() => mergeStyle(overrides), [overrides]);
  const rig = useMemo(() => makeRig({ joins, duration, style, shifts: SHIFTS, punches: PUNCHES }), [style]);
  const captionY = (t: number) => style.captions.y + (rig.shiftAt(t) > 0.5 ? 70 : 0);
  return (
    <ReelShell reelStyle={style}>
      <SpeakerTrack video={VIDEO} rig={rig} duration={duration} />
      <Shade rig={rig} coverOut={COVER_OUT} />

      <CoverTitle lead={COVER.lead} title={COVER.title} out={COVER_OUT} />

      <Board
        icon="layers"
        title="TODO"
        at={A.panel}
        out={A.panelOut}
        chips={[
          { icon: 'check', label: 'TODO', at: A.chip1 },
          { icon: 'check', label: 'TODO', at: A.chip2 },
        ]}
      />

      <IconTile name="target" tone="accent" at={A.tile} out={A.tileOut} x={900} y={760} size={170} rot={5} />

      <CommentCta at={A.ending} keyAt={A.endingWord} word="TODO" y={1130} />
      <GuideCover at={A.guide} x={165} y={1010} scale={0.82} title="TODO" accent="TODO" />

      <Captions words={words} keywords={KEYWORDS} phrases={PHRASES} until={A.ending} y={captionY} />
      <Sfx cues={SFX} />
    </ReelShell>
  );
};
