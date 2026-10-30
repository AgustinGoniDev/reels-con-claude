---
name: editar-reel
description: "Edita un reel vertical de una persona hablando a cámara y entrega un video 1080x1920 listo para subir: le saca los silencios, lo acelera un poco y le monta encima, con Remotion, subtítulos, una portada, momentos ilustrados con íconos que se dibujan y un cierre. Antes de editar define el criterio con la persona: cinco preguntas, sus reels de referencia y una vista previa corta en dos versiones para elegir. Usar cuando digan: quiero editar mi reel, editá o edita este video, armame el reel, ponele animaciones, motion graphics para mi reel, /editar-reel. No sirve para videos horizontales (16:9) ni para sacar clips de un video largo."
metadata:
  version: "1.0"
---

# Editar un reel

Convierte una grabación vertical de alguien hablando a cámara en un reel editado. El trabajo tiene
cuatro fases y **la primera vez no se saltea ninguna**:

| Fase | Para qué | Cuándo |
|---|---|---|
| 0. Preparar | Que la máquina pueda editar | La primera vez, o si algo falla |
| 1. Criterio | Bajar qué estilo quiere la persona, a un archivo | Si `estilo/estilo.json` dice `"defined": false`, o si la persona quiere otro estilo |
| 2. Vista previa | Mostrar 12 a 15 segundos en dos versiones y elegir | Siempre en el primer reel; después, solo si cambió el estilo |
| 3. Reel completo | Editar todo el video con el estilo elegido | Cuando la vista previa está aprobada |

El motivo de este orden: un pedido como "animalo como te parezca" obliga a adivinar el criterio, y
cada vuelta de "no me gusta" cuesta un render entero. Nadie sabe describir un estilo, pero todos lo
reconocen cuando lo ven. Por eso se pregunta solo lo que la persona sabe, y lo demás lo elige
mirando.

## Cómo se le habla a la persona

- **Una pregunta por vez**, en su registro: si escribe con vos, con vos; si escribe con tú, con tú.
- **Sin jerga.** Nada de "nivel de energía", "lockup", "CTA", "safe zone", "keyframe". Se dice
  "subtítulos", "zoom", "cómo termina el video", "la parte de abajo que tapa Instagram".
- **Se muestra en vez de describir.** Si hay que elegir algo visual, se le muestra un cuadro, una hoja
  de cuadros o la vista previa. Las imágenes que genera Claude se le pasan con la ruta completa para
  que las abra.
- **Lo que rechaza o pide queda escrito** en `estilo/estilo.md`, con sus palabras. Es lo que hace que
  el segundo reel salga mejor que el primero.

## Antes de empezar

Se leen, según la fase:
- [`references/criterio.md`](references/criterio.md): las preguntas, cómo se analizan las
  referencias y cómo se escribe el estilo.
- [`references/vista-previa.md`](references/vista-previa.md): cómo se arman y se comparan las dos
  versiones.
- [`references/edicion.md`](references/edicion.md): los pasos del corte y del reel completo, con
  los comandos.
- [`references/componentes.md`](references/componentes.md): las piezas del kit y cómo se usan.
- [`references/estilo-ejemplo.md`](references/estilo-ejemplo.md): un estilo real, de punta a punta,
  con de qué comentario salió cada regla. Sirve para ver qué nivel de detalle se busca.

El código de un reel terminado está en [`ejemplo/`](ejemplo/): es el modelo de cómo queda una
composición completa. Su video no está en el repositorio, así que se lee, no se renderiza.

## Fase 0: preparar

1. Se corre `python tools/preparar.py` (en macOS, `python3`). Solo revisa: no cambia nada.
2. **Si falta Node, Python o ffmpeg,** se le muestra a la persona el comando que lo instala en su
   sistema y se le pide permiso antes de correrlo. Son programas del sistema.
3. **Si faltan los paquetes del proyecto o los dos modelos chicos** (cara y limpieza de voz, menos
   de 1 MB entre los dos), se le dice qué se va a instalar y se corre
   `python tools/preparar.py --instalar` con su OK.
4. **Whisper** (la transcripción) baja su modelo la primera vez: unos 0,5 GB en una máquina sin placa
   NVIDIA y 1,6 GB con placa. Se avisa el tamaño y se baja con `python tools/preparar.py --whisper`,
   con su OK.
5. **Prueba de que Remotion anda:** se saca un cuadro de la `Muestra`, una pieza de 9 segundos sin
   video. Antes tiene que estar el navegador con el que Remotion dibuja (unos 100 MB): lo baja
   `--instalar`, o `npx remotion browser ensure` si `preparar.py` lo marca como faltante.

   ```bash
   npx remotion still src/index.ts Muestra out/muestra.png --frame=80
   ```

   Se mira el PNG. Si se ven subtítulos y un panel con chips arriba, la máquina está lista.

La `Muestra` usa el estilo del proyecto: después de la fase 1 sirve para mostrarle a la persona su
estilo antes de tocar el video (cuadros 10, 80, 130 y 240).

En Windows con PowerShell, si `npm` o `npx` fallan por la política de ejecución, se usan `npm.cmd` y
`npx.cmd`.

## Fase 1: criterio

Todo el detalle está en [`references/criterio.md`](references/criterio.md). En resumen:

1. **Cinco preguntas, de a una:** dónde lo va a subir, si su marca ya tiene colores o logo, qué reels
   le gustaría que se parezcan al suyo, cómo quiere que termine y qué no quiere ver.
2. **Las referencias se miden** con `tools/analizar_referencia.py` y se miran las hojas de cuadros.
3. **Preguntas cerradas sobre lo que se vio,** con el cuadro a la vista: de dos a cuatro.
4. **Se escriben `estilo/estilo.json` y `estilo/estilo.md`.** El JSON queda con `"defined": true`.
5. **Se le muestra el estilo en la `Muestra`** (tres cuadros, sin video) y se corrigen colores o
   tipografías antes de cortar.

Si la persona no tiene referencias, no se insiste: la vista previa compara dos versiones bien
distintas y de ahí sale el criterio.

## Fase 2: vista previa

Todo el detalle está en [`references/vista-previa.md`](references/vista-previa.md). En resumen:

1. Se transcribe y se corta el video de la persona (pasos 1 a 4 de
   [`references/edicion.md`](references/edicion.md)).
2. Se arman **solo los primeros 12 a 15 segundos** del reel: la portada, los subtítulos y uno o dos
   momentos ilustrados.
3. Se renderizan **dos versiones, A y B,** que difieren solo en lo que quedó sin decidir, y se ponen
   lado a lado con `tools/comparar.py`.
4. La persona elige y comenta. Hasta tres vueltas. Lo elegido pasa a `estilo/estilo.json` y el
   comentario, a `estilo/estilo.md`.

## Fase 3: reel completo

Los pasos 5 a 9 de [`references/edicion.md`](references/edicion.md):

5. El guion visual, antes del código.
6. La composición.
7. Mirar cuadros sueltos antes de renderizar.
8. Renderizar y medir el sonido.
9. Entregar.

## Fase 4: cerrar

- Se le pregunta a la persona qué le cambiaría al reel. Lo que diga, aunque no se aplique ahora, va a
  `estilo/estilo.md`.
- El próximo reel arranca en la fase 3, salvo que la persona quiera cambiar el estilo.

## Iterar

El comentario se aplica en el archivo que corresponde, y se rehace solo desde ahí:

| Si cambia | Se toca | Se corre de nuevo |
|---|---|---|
| Un texto, un gráfico, su lugar, un sonido | `src/reels/<slug>/` | Cuadros sueltos, después el render `vN+1` |
| El tramo, la velocidad o las pausas | `reels/<slug>/plan.json` | El corte, la cara, el typecheck y el render |
| Algo del estilo que vale para todos los reels | `estilo/estilo.json` (y la regla en `estilo.md`) | Cuadros sueltos, después el render |
| Algo que el estilo no puede expresar | `src/reel/` (el kit) | Cuadros sueltos de la `Muestra` y de los reels del proyecto, antes y después: el kit es de todos los reels |

## Nunca

- **Saltear el criterio o la vista previa en el primer reel.** Es el error que este proceso existe
  para evitar.
- **Un texto en pantalla que no esté en el audio.** Se puede resumir, pero no se agrega ningún dato.
- **Animar sobre una palabra dudosa sin confirmarla.** Whisper marca con `[?]` las que no entendió
  bien; se le muestran a la persona con su frase antes de animar.
- **Tapar los ojos** con un gráfico, o poner texto en la zona que tapa la app.
- **Renderizar el reel completo sin mirar antes la portada y los momentos** en cuadros sueltos.
- **Bajar un modelo o instalar un programa sin avisar el tamaño y pedir permiso.**
- **Descargar videos de otras personas** de Instagram, TikTok o YouTube. Si la persona pasa un link,
  se le pide el archivo o una grabación de pantalla.
- **Publicar.** Subir el reel es de la persona.

## Problemas conocidos

- **"Failed to launch the browser process" con `chrome-headless-shell.exe ENOENT`, en Windows:** la
  carpeta del proyecto está en una ruta demasiado larga (más de unos 100 caracteres, típico dentro de
  OneDrive) y el navegador de Remotion se descomprimió a medias. Se mueve el proyecto a una ruta corta
  (`C:\reels-con-claude`), se borra `node_modules/.remotion` y se corre `npx remotion browser ensure`.
  `preparar.py` avisa las dos cosas. Lo mismo pasa si la primera descarga se cortó.
- **npm 11 avisa que `esbuild` tiene un script de instalación sin aprobar.** No hace falta aprobarlo:
  el render anda igual.
- **Los tiempos de Whisper sobre la fuente** pueden estar corridos 0,25 s. Por eso los tiempos del
  reel salen de transcribir otra vez el corte, nunca de la fuente.
- **Si falta `cublas64_12.dll`** en Windows con placa NVIDIA, `tools/common.py` agrega las carpetas
  de CUDA al PATH. Si igual falla, transcribe en el procesador.
- **En Remotion, `Freeze` dentro de un `Sequence` corre el cuadro.** `SpeakerTrack` ya lo resuelve.
- **Los hooks** (`useSpringAt`, `useTheme`) van antes de cualquier `return` temprano del componente.
- **Dos renders del mismo código no salen idénticos bit a bit** (dan unos 53 dB de PSNR, una
  diferencia que no se ve). Para comprobar que un cambio no alteró nada, se comparan cuadros PNG
  sueltos: esos sí salen idénticos.

## Lo que no está verificado

- **Se probó en Windows 11 con placa NVIDIA.** En macOS y en máquinas sin placa no se corrió.
- **La instalación desde cero se probó a medias:** un clon limpio del repositorio instaló los
  paquetes, bajó el navegador de Remotion y renderizó la `Muestra`. Pero Python, ffmpeg y Whisper ya
  estaban en la máquina, y los dos modelos chicos se copiaron: la descarga de `--instalar` y
  `--whisper` no se ejecutó. Los links de los modelos sí responden.
- **La fase de criterio no se hizo todavía con una persona.** Las herramientas que usa (el análisis de
  referencias, la vista previa A/B y la comparación) sí se probaron.
- **El reel de `ejemplo/` es el único reel completo** hecho con este kit. La plantilla y la vista
  previa A/B se probaron con el corte de ese mismo video, no con una grabación nueva.
- **Las zonas que tapan TikTok y YouTube Shorts** no están medidas: las del kit son las de Instagram.
  Para otra plataforma se le pide a la persona una captura de un reel suyo en esa app.
- **Las grabaciones de OBS con la cámara en una franja** (no a pantalla completa) necesitan recortar
  y agrandar la imagen. El kit da por hecho que la persona ocupa todo el cuadro.
