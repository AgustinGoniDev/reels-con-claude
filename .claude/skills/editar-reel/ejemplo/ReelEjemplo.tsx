// Example reel: "segundo cerebro", in the "medio" style (estilo/ejemplo-medio.json).
// Full-frame speaker, quiet camera, caption lockups and about ten illustrated
// moments, each one anchored to the words that bring it in and take it out.
// It renders with its own style, not the project's: it is the reference of what a
// finished reel looks like, and the first render that proves the setup works.
import React, { useMemo } from 'react';
import exampleStyle from '../../../estilo/ejemplo-medio.json';
import { Captions } from '../../reel/Captions';
import { Sparkles } from '../../reel/effects';
import { BrainNet, IconTile } from '../../reel/Icon';
import { Board, CommentCta, CoverTitle, GuideCover } from '../../reel/parts';
import { Cue, makeRig, reelFrames, Sfx, Shade, SpeakerTrack } from '../../reel/rig';
import { mergeStyle, ReelProps, ReelStyle } from '../../reel/style';
import { ReelShell } from '../../reel/theme';
import { at, duration, joins, VIDEO, words } from './data';
import { DocCard, FolderPile, OutputFlow, TwoLayers } from './parts';

export const REEL_FRAMES = reelFrames(duration);

/** The cover: what the reel is about, readable on frame 0. */
const COVER = { lead: 'Qué hace falta para armar', title: 'un segundo cerebro' };

const A = {
  cerebro1: at('cerebro'),
  contextoFijo: at('contexto', 10),
  doctrina: at('doctrina'),
  avatar: at('avatar'),
  oferta: at('oferta'),
  servicio: at('servicio'),
  inamovible: at('inamovible'),
  y1: at('y', at('inamovible')),
  datos: at('datos'),
  efimero: at('efímero'),
  metricas: at('métricas'),
  llamadas: at('llamadas'),
  transcripciones: at('transcripciones'),
  videos: at('videos'),
  sale: at('entra', at('videos')),
  entonces1: at('entonces'),
  dos: at('dos'),
  capas: at('capas'),
  una: at('una', at('capas')),
  output1: at('output'),
  si: at('si', at('output')),
  propuestas: at('propuestas'),
  claude: at('Claude'),
  output2: at('output', at('Claude')),
  acumular: at('acumular'),
  informacion: at('información', at('acumular')),
  es: at('es', at('acumular')),
  output3: at('output', at('acumular')),
  necesitas: at('necesitas'),
  segundo2: at('segundo', at('necesitas')),
  cerebro2: at('cerebro', at('necesitas')),
  ySi: at('y', at('quieras', at('necesitas'))),
  comentame: at('comentame'),
  cerebro3: at('cerebro', at('comentame')),
  guia: at('guía', at('comentame')),
};

const COVER_OUT = A.cerebro1 + 0.25;

const KEYWORDS = ['segundo cerebro', 'contexto', 'contexto fijo', 'doctrina', 'inamovible', 'datos', 'efímero', 'dos capas', 'output', 'propuestas comerciales', 'Claude', 'acumular', 'cerebro', 'guía completa'];
const PHRASES = ['segundo cerebro', 'sistema operativo', 'contexto fijo', 'pipeline comercial', 'propuestas comerciales', 'dos capas', 'guía completa'];

/** The speaker moves down for the cover, then for the two top panels and the two layers. */
const SHIFTS = [
  { from: 0, to: COVER_OUT },
  { from: A.contextoFijo - 0.35, to: A.una },
];
const PUNCHES = [A.contextoFijo, A.datos, A.dos, A.output1, A.claude, A.acumular, A.cerebro2];

const SFX: Cue[] = [
  { at: A.contextoFijo, src: 'whoosh_corto.wav', vol: 0.35 },
  { at: A.avatar, src: 'click_003.ogg', vol: 0.35 },
  { at: A.oferta, src: 'click_003.ogg', vol: 0.35 },
  { at: A.servicio, src: 'click_003.ogg', vol: 0.35 },
  { at: A.inamovible, src: 'switch_005.ogg', vol: 0.4 },
  { at: A.datos, src: 'whoosh_corto.wav', vol: 0.35 },
  { at: A.metricas, src: 'click_003.ogg', vol: 0.32 },
  { at: A.llamadas, src: 'click_003.ogg', vol: 0.32 },
  { at: A.transcripciones, src: 'click_003.ogg', vol: 0.32 },
  { at: A.videos, src: 'click_003.ogg', vol: 0.32 },
  { at: A.sale, src: 'whoosh_corto.wav', vol: 0.35 },
  { at: A.dos, src: 'impactSoft_medium_002.ogg', vol: 0.35 },
  { at: A.capas, src: 'impactSoft_medium_002.ogg', vol: 0.35 },
  { at: A.output1, src: 'pop.wav', vol: 0.4 },
  { at: A.propuestas, src: 'whoosh_corto.wav', vol: 0.35 },
  { at: A.propuestas + 0.5, src: 'keypress-003.wav', vol: 0.25 },
  { at: A.propuestas + 0.9, src: 'keypress-012.wav', vol: 0.25 },
  { at: A.propuestas + 1.3, src: 'keypress-003.wav', vol: 0.25 },
  { at: A.claude, src: 'pop.wav', vol: 0.4 },
  { at: A.acumular, src: 'drop_002.ogg', vol: 0.3 },
  { at: A.acumular + 0.2, src: 'drop_002.ogg', vol: 0.25 },
  { at: A.informacion, src: 'impactSoft_medium_001.ogg', vol: 0.35 },
  { at: A.output3, src: 'pop.wav', vol: 0.35 },
  { at: A.segundo2, src: 'pop.wav', vol: 0.35 },
  { at: A.comentame, src: 'whoosh_corto.wav', vol: 0.35 },
  { at: A.cerebro3, src: 'impactSoft_heavy_003.ogg', vol: 0.35 },
  { at: A.cerebro3 + 0.55, src: 'switch_005.ogg', vol: 0.35 },
  { at: A.guia, src: 'whoosh.wav', vol: 0.35 },
];

export const ReelEjemplo: React.FC<ReelProps> = ({ overrides }) => {
  const style = useMemo(() => mergeStyle(overrides, exampleStyle as ReelStyle), [overrides]);
  const rig = useMemo(() => makeRig({ joins, duration, style, shifts: SHIFTS, punches: PUNCHES }), [style]);
  const captionY = (t: number) => style.captions.y + (rig.shiftAt(t) > 0.5 ? 70 : 0);
  return (
    <ReelShell reelStyle={style}>
      <SpeakerTrack video={VIDEO} rig={rig} duration={duration} />
      <Shade rig={rig} coverOut={COVER_OUT} />

      <CoverTitle lead={COVER.lead} title={COVER.title} out={COVER_OUT} />

      {/* Fixed context vs. data */}
      <Board
        icon="lock"
        title="Contexto fijo"
        at={A.contextoFijo}
        out={A.y1}
        sub={{ text: 'o doctrina', at: A.doctrina }}
        badge={{ text: 'Inamovible', at: A.inamovible }}
        chips={[
          { icon: 'user', label: 'Avatar', at: A.avatar },
          { icon: 'target', label: 'Oferta', at: A.oferta },
          { icon: 'box', label: 'Servicio', at: A.servicio },
        ]}
      />
      <Board
        icon="zap"
        title="Datos"
        at={A.datos}
        out={A.entonces1}
        sub={{ text: 'efímeros: entran y salen', at: A.efimero }}
        chips={[
          { icon: 'bar-chart', label: 'Métricas', at: A.metricas },
          { icon: 'audio', label: 'Llamadas', at: A.llamadas },
          { icon: 'file-text', label: 'Transcripciones', at: A.transcripciones },
          { icon: 'video', label: 'Videos', at: A.videos },
        ]}
        exitAt={A.sale}
      />
      <TwoLayers at={[A.dos, A.capas]} out={A.una} />

      {/* Output */}
      <OutputFlow at={A.output1} out={A.si} />
      <DocCard at={A.propuestas} out={A.claude - 0.15} x={880} y={760} />
      {/* The original used the real Claude logo (LogoTile); the repository ships no third-party logos. */}
      <IconTile name="bot" at={A.claude} out={A.output2} x={185} y={740} size={180} rot={-6} label="Claude" />

      {/* Not accumulating */}
      <FolderPile at={A.acumular} cross={A.informacion} out={A.es + 0.3} x={235} y={900} />
      <IconTile name="target" tone="accent" at={A.output3} out={A.necesitas + 0.4} x={900} y={760} size={170} rot={5} />
      <Sparkles at={A.output3 + 0.1} x={900} y={760} n={10} radius={170} />

      {/* Second brain */}
      <BrainNet at={A.segundo2} out={A.ySi} x={190} y={760} />

      {/* Call to action */}
      <CommentCta at={A.comentame} keyAt={A.cerebro3} word="cerebro" y={1130} />
      <Sparkles at={A.cerebro3} x={540} y={1300} n={14} radius={360} />
      {/* Beside the cheek: at the end he leans in, and a higher card covered an eye. */}
      <GuideCover at={A.guia} x={165} y={1010} scale={0.82} title="Segundo" accent="cerebro" />

      <Captions words={words} keywords={KEYWORDS} phrases={PHRASES} until={A.comentame} y={captionY} />
      <Sfx cues={SFX} />
    </ReelShell>
  );
};
