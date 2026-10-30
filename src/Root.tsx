// Every reel is registered here. A new reel adds its import and its <Composition>.
import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, W } from './reel/format';
import { Muestra, MUESTRA_FRAMES } from './reels/muestra/Muestra';

export const Root: React.FC = () => (
  <>
    <Composition id="Muestra" component={Muestra} durationInFrames={MUESTRA_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
