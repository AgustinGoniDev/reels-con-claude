// A 9-second sample of the kit in the project style, with no video: a cover, captions,
// a panel with chips, an icon tile and the ending. It proves the setup renders, and it
// shows a style before any recording is cut. Read it at frames 10, 80, 130 and 240.
import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { Word } from '../../lib/words';
import { Captions } from '../../reel/Captions';
import { FPS } from '../../reel/format';
import { IconTile } from '../../reel/Icon';
import { Board, CommentCta, CoverTitle } from '../../reel/parts';
import { Cue, makeRig, Sfx, Shade } from '../../reel/rig';
import { mergeStyle, ReelProps } from '../../reel/style';
import { mixColor, ReelShell, useTheme } from '../../reel/theme';

const DURATION = 9;
export const MUESTRA_FRAMES = DURATION * FPS;

const TEXT = 'Esta es una muestra de tu estilo: subtítulos, paneles con datos, íconos que se dibujan y el cierre.';

/** The sample sentence, one word every 0.3 s from 1.2 s. */
const WORDS: Word[] = TEXT.split(' ').map((text, i) => ({ text, start: 1.2 + i * 0.3, end: 1.2 + i * 0.3 + 0.26, segment: 1 }));
const at = (word: string) => WORDS.find((w) => w.text.toLowerCase().startsWith(word))?.start ?? 0;

const A = { panel: at('subtítulos'), chip1: at('paneles'), chip2: at('íconos'), chip3: at('dibujan'), tile: at('íconos'), ending: at('cierre') + 0.4 };

const SFX: Cue[] = [
  { at: A.panel, src: 'whoosh_corto.wav', vol: 0.35 },
  { at: A.chip1, src: 'click_003.ogg', vol: 0.35 },
  { at: A.chip2, src: 'click_003.ogg', vol: 0.35 },
  { at: A.chip3, src: 'click_003.ogg', vol: 0.35 },
  { at: A.tile, src: 'pop.wav', vol: 0.4 },
  { at: A.ending + 0.3, src: 'impactSoft_heavy_003.ogg', vol: 0.35 },
];

/** Stands in for the speaker: a soft light on the panel color. */
const Backdrop: React.FC = () => {
  const { c } = useTheme();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(70% 45% at 50% 42%, ${mixColor(c.panel, '#FFFFFF', 0.28)} 0%, ${mixColor(c.panel, '#FFFFFF', 0.08)} 55%, ${c.panel} 100%)`,
      }}
    />
  );
};

export const Muestra: React.FC<ReelProps> = ({ overrides }) => {
  const style = useMemo(() => mergeStyle(overrides), [overrides]);
  const rig = useMemo(() => makeRig({ joins: [], duration: DURATION, style, shifts: [{ from: 0, to: 1.2 }] }), [style]);
  return (
    <ReelShell reelStyle={style}>
      <Backdrop />
      <Shade rig={rig} coverOut={1.2} />
      <CoverTitle lead="Así se ve" title="tu estilo" out={1.2} />
      <Board
        icon="layers"
        title="Un panel con datos"
        at={A.panel}
        out={A.ending - 0.2}
        chips={[
          { icon: 'check', label: 'Primero', at: A.chip1 },
          { icon: 'target', label: 'Segundo', at: A.chip2 },
          { icon: 'zap', label: 'Tercero', at: A.chip3 },
        ]}
      />
      <IconTile name="sparkles" tone="accent" at={A.tile} out={A.ending} x={880} y={820} size={170} rot={5} />
      <CommentCta at={A.ending} keyAt={A.ending + 0.3} word="guía" y={1130} />
      <Captions words={WORDS} keywords={['estilo', 'paneles', 'íconos', 'cierre']} until={A.ending} y={() => style.captions.y} />
      <Sfx cues={SFX} />
    </ReelShell>
  );
};
