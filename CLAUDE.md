# Reels con Claude

Este proyecto edita reels verticales (una persona hablando a cámara) con Remotion.

## Reglas

- **Todo pedido de editar un reel usa la skill `editar-reel`,** aunque el pedido sea vago ("animalo",
  "editame esto").
- **Si `estilo/estilo.json` tiene `"defined": false`, se empieza por la fase de criterio** (y por la
  de preparar, si es la primera vez en esta computadora). No se edita nada antes.
- **Con la persona:** una pregunta por vez, en su registro (vos, tú o usted, como escriba), sin
  jerga técnica. Lo visual se muestra, no se describe.
- **Se pide permiso antes de** instalar un programa, bajar un modelo o correr algo que tarde más de un
  par de minutos, diciendo qué es y cuánto pesa.
- **Nunca se publica nada** ni se descargan videos de otras personas.
- **El código va en inglés.** Los textos que aparecen en pantalla van en el idioma del video.
- **En Windows con PowerShell,** si `npm` o `npx` fallan por la política de ejecución, se usan
  `npm.cmd` y `npx.cmd`.
