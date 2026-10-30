# Fase 1: el criterio

El objetivo es terminar con dos archivos:
- **`estilo/estilo.json`**: los valores que lee el kit (colores, tipografías, subtítulos, cámara,
  sonido, ritmo, cierre).
- **`estilo/estilo.md`**: las reglas en palabras, cada una con de dónde salió. Es la memoria del
  estilo: el próximo reel arranca leyéndolo.

La regla de esta fase: **se pregunta solo lo que la persona sabe.** Dónde publica, si tiene marca,
qué reels le gustan, cómo quiere cerrar y qué odia lo sabe cualquiera. Cómo se llama un estilo, cuánta
"energía" quiere o qué tipografía le conviene, no: eso sale de mirar sus referencias y de la vista
previa.

## Las cinco preguntas

Se hacen de a una, en el registro de la persona, y se espera cada respuesta. Si una respuesta ya
contesta otra pregunta, esa no se hace.

**1. "¿Dónde lo vas a subir: Instagram, TikTok o YouTube Shorts?"**

Define `platform` y qué zonas de la pantalla no pueden llevar texto. Si es Instagram, el cuadro 0
tiene que funcionar como portada en la grilla del perfil.

**2. "¿Tu marca ya tiene colores, logo o tipografía? Si tiene, alcanza con una captura de tu perfil o
de tu web."**

- Si pasa una captura, se mira y se sacan de ahí el color principal y la tipografía, o la más
  parecida de las disponibles en `src/reel/fonts.ts`.
- Si no tiene marca, el color sale de las referencias.
- **La marca le gana a la referencia.** Si la referencia usa naranja y la marca es verde, va verde.

**3. "¿Qué reels te gustaría que se parezcan al tuyo? De uno a tres. Sirve el archivo o, si no está
el archivo, una grabación de la pantalla del celular mientras se reproduce."**

- Es la pregunta que más pesa.
- **Si pasa un link,** se le pide el archivo o la grabación de pantalla. No se descargan videos de
  otras personas.
- Los archivos van a `referencias/` (no se suben al repositorio).
- Se le pregunta también, en una línea, **qué le gusta de cada uno**. Si no sabe decirlo, está bien:
  para eso se mira.

**4. "¿Cómo te gustaría que termine?"**

Con ejemplos, para que no haga falta saber qué es un "llamado a la acción":
- un pedido de comentar una palabra para recibir algo ("Comentá GUÍA y te la mando");
- un pedido de seguir la cuenta;
- sin cierre.

Si elige comentar una palabra, se le pregunta cuál y qué recibe quien comenta. Define `ending.lead`
("Comentá", "Comenta") y la palabra del reel.

**5. "¿Hay algo que no te gustaría ver?"**

Se le da una lista para marcar, y puede sumar lo suyo:
- emojis;
- zooms que marean;
- efectos de sonido;
- música de fondo;
- texto encima de la cara;
- subtítulos en mayúsculas;
- colores muy fuertes.

Cada cosa marcada va a "Lo que no va" de `estilo.md`.

## Analizar las referencias

Por cada referencia:

```bash
python tools/analizar_referencia.py "referencias/<archivo>.mp4" --transcribir --language <idioma>
```

`--transcribir` necesita Whisper (fase 0). Sin él, se corre sin esa opción y se pierden solo las
palabras por minuto.

Deja en `referencias/<nombre>/`:

| Archivo | Qué es |
|---|---|
| `hoja-N.jpg` | Un cuadro por segundo, 6 x 4: la hoja 1 son los segundos 0 a 23, de izquierda a derecha y de arriba abajo |
| `gancho.jpg` | Los primeros 6 segundos, a 4 cuadros por segundo |
| `cuadro-SS.jpg` | Seis cuadros a 540 px, para leer bien los subtítulos y la tipografía |
| `analisis.json` | Cortes por minuto, largo de cada toma, colores vivos, volumen y palabras por minuto |

**Los números son un punto de partida, no el estilo.** Un zoom fuerte cuenta como corte, y entre
los colores vivos aparece cualquier cosa brillante del fondo. Se leen junto con las hojas.

### Qué se mira en las hojas

Se abren con Read las hojas, el gancho y los cuadros sueltos, y se anota:

| Qué | Qué se busca |
|---|---|
| Subtítulos | ¿De a una palabra grande con otras chicas alrededor, o frases cortas? ¿Mayúsculas? ¿Dónde están (arriba, al medio, abajo)? ¿De qué color es la palabra que resalta? |
| Tipografía | ¿Gruesa y redonda, condensada y alta, o con una serif elegante para resaltar? |
| Cámara | ¿Quieta, con zooms en algunas palabras, o con cortes notorios a cada rato? |
| Gráficos | ¿Cuántos momentos ilustrados hay por minuto? ¿Íconos, paneles con texto, logos, capturas? |
| Portada | ¿El primer cuadro tiene un título? |
| Cierre | ¿Cómo termina? |
| Lo que el kit no hace | Maquetas de teléfono, emojis 3D, imágenes de archivo, música. Se anota para decirlo |

El sonido no se puede escuchar: si importa (efectos, música), se pregunta.

### Las preguntas cerradas

Con lo que se vio, se arman **de dos a cuatro preguntas que se contestan mirando,** con el cuadro a
la vista (se le pasa la ruta del JPG). Solo sobre lo que quedó dudoso o lo que las referencias hacen
distinto entre sí. Ejemplos:

- "En este, el subtítulo va de a una palabra gigante en el centro, con las demás chiquitas. ¿Así, o
  frases enteras más chicas abajo?"
- "Este hace zoom en casi cada frase. ¿Te gusta así, o con la cámara más quieta?"
- "Acá hay un ícono o un panel cada cinco segundos más o menos. ¿Así de seguido o menos?"
- "Este usa una letra cursiva elegante para la palabra importante del título. ¿Va con tu marca?"

**Lo que el kit no puede hacer se dice en la misma pregunta,** con la alternativa más cercana: "Las
maquetas de teléfono de esta referencia no están en el kit; lo más parecido es un panel arriba con
el texto. ¿Te sirve?". Si es algo que la persona quiere sí o sí, se puede construir como pieza propia
del reel (ver `componentes.md`), y se le avisa que lleva más tiempo.

Lo que no se pueda decidir con las preguntas se deja para la vista previa: es una de las dos
diferencias entre A y B.

## Escribir el estilo

### `estilo/estilo.json`

| Lo que se vio o se respondió | Campo | Valores |
|---|---|---|
| Plataforma | `platform` | `instagram`, `tiktok`, `shorts` |
| Color que resalta (de la marca, si hay) | `colors.accent` | hex |
| Color de los títulos de paneles | `colors.title` | hex claro (crema o blanco) |
| Color base de paneles y sombras | `colors.panel` | hex oscuro |
| Color para tachar | `colors.strike` | hex rojo, salvo que choque con la marca |
| Una palabra grande con otras chicas | `captions.mode` | `lockup` |
| Frases cortas con la palabra que se dice resaltada | `captions.mode` | `phrase` |
| Subtítulos en mayúsculas | `captions.uppercase` | `true` / `false` |
| Altura de los subtítulos | `captions.y` | 1400 por defecto. Más arriba, hasta 1100. En Instagram, nunca más abajo de 1550 |
| Tamaño de la palabra grande | `captions.keySize` | 124 por defecto. De 100 a 140 |
| Zooms en algunas palabras | `camera.punches` | `true` / `false` |
| Cortes que se notan (dos encuadres que alternan) | `camera.cuts` | `true` / `false` |
| Cuánto se acerca cada toma | `camera.push` | 0.02 por defecto. 0 es quieta del todo |
| Efectos de sonido | `sound.effects`, `sound.gain` | `true` / `false`; 0.6 por defecto |
| Velocidad | `cut.speed` | 1.1 por defecto. De 1.0 a 1.15. Más rápido suena acelerado |
| Pausa más corta que se saca | `cut.minPause` | 0.3 s por defecto. Más bajo, más ritmo |
| Cómo empieza el cierre | `ending.lead` | "Comentá", "Comenta"… |
| Tipografías | `fonts.title`, `fonts.text`, `fonts.highlight`, `fonts.label` | Las de `src/reel/fonts.ts`. Otra de Google Fonts se suma ahí |

**Tipografías disponibles:** Inter, Montserrat, Poppins, DM Sans, Space Grotesk, Bebas Neue, Anton,
Instrument Serif, Playfair Display y JetBrains Mono.
- Gruesa y redonda: Montserrat o Poppins.
- Condensada y alta: Bebas Neue o Anton.
- Serif elegante para resaltar (`highlight`): Instrument Serif o Playfair Display.
- Texto de subtítulos (`text`): Inter o DM Sans.
- Etiquetas chicas (`label`): JetBrains Mono.

Al final, `"defined": true` y un `name` corto que la persona reconozca.

### `estilo/estilo.md`

Se completa la plantilla que ya está en el archivo:
- **Las referencias**, con qué le gustó de cada una.
- **Las reglas**, cada una con su origen: la respuesta, la referencia o el comentario que la produjo,
  con las palabras de la persona.
- **La cantidad de momentos ilustrados por minuto**: no está en el JSON, pero guía el guion visual.
- **Lo que no va.**
- **El historial**: cada vuelta de la vista previa y del reel, con qué se mostró, qué dijo y qué
  quedó.

El modelo de cómo queda un estilo completo es [`estilo-ejemplo.md`](estilo-ejemplo.md).

## Mostrar el estilo antes de tocar el video

Con el estilo escrito, se le muestran a la persona sus colores y tipografías en la `Muestra`, que no
necesita video:

```bash
npx remotion still src/index.ts Muestra out/muestra-10.png --frame=10
npx remotion still src/index.ts Muestra out/muestra-80.png --frame=80
npx remotion still src/index.ts Muestra out/muestra-240.png --frame=240
```

Son la portada, un panel con subtítulos y el cierre. Se le pasan las rutas completas y se le pregunta
si algo no va (un color, una tipografía). Lo que cambie se corrige en `estilo/estilo.json` antes de
cortar el video.
