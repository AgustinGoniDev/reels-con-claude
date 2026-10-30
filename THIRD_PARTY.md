# Material de terceros

| Qué | Dónde | Origen | Licencia |
|---|---|---|---|
| Remotion (motor de video) | `node_modules/`, se instala con npm | [remotion.dev](https://www.remotion.dev) | Propia: gratis para personas, empresas de hasta 3 empleados y organizaciones sin fines de lucro; las demás empresas necesitan una licencia de empresa. Ver [remotion.dev/license](https://www.remotion.dev/license) |
| Íconos de línea | `src/reel/icons.ts` | Geometría derivada de [Lucide](https://lucide.dev) | ISC |
| Efectos de sonido `click_003`, `drop_002`, `glitch_004`, `switch_005`, `impactBell_heavy_000`, `impactSoft_*` (.ogg) y los de teclado `keypress-*` (.wav) | `public/sfx/` | [Kenney](https://kenney.nl) | CC0 (dominio público) |
| Efectos `whoosh`, `whoosh_corto`, `pop`, `riser`, `boom` (.wav) | `public/sfx/` | Sintetizados con ffmpeg para este proyecto | MIT, con el resto del proyecto |
| Detector de caras YuNet | `tools/models/`, lo baja `tools/preparar.py` | [OpenCV Zoo](https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet) | MIT |
| Modelo de limpieza de voz `std.rnnn` | `tools/models/`, lo baja `tools/preparar.py` | El modelo original de [RNNoise](https://github.com/xiph/rnnoise), publicado en [arnndn-models](https://github.com/richardpl/arnndn-models) | RNNoise es BSD-3-Clause; el repositorio que lo publica no declara licencia |
| Whisper (transcripción) | Caché de Hugging Face, lo baja `faster-whisper` | [faster-whisper](https://github.com/SYSTRAN/faster-whisper), modelos de OpenAI Whisper | MIT |
| Tipografías | Se cargan de Google Fonts al renderizar | [Google Fonts](https://fonts.google.com) | SIL Open Font License |
