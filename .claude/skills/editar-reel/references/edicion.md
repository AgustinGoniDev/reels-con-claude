# Los pasos del corte y del reel completo

`<slug>` es el tema del reel en minúsculas, sin espacios ni tildes (`cerebro`, `precios`). Es el
mismo en todas las carpetas:

| Qué | Dónde |
|---|---|
| La grabación original | `videos/` (no se sube al repositorio) |
| El plan del corte y la transcripción de la fuente | `reels/<slug>/` |
| El corte, sus palabras y la cara | `public/reels/<slug>/` |
| La composición y sus piezas propias | `src/reels/<slug>/` |
| Las vistas previas | `out/vistas/` |
| Los renders | `out/reels/<slug>-vN.mp4` (la versión anterior no se pisa) |

En Windows con PowerShell, si `npx` falla por la política de ejecución, se usa `npx.cmd`. En macOS,
`python3` en lugar de `python`.

## 1. Transcribir la fuente

```bash
python tools/transcribe.py "videos/<archivo>" reels/<slug>/source_words.json --vocabulary "Nombre, Marca, Producto"
```

- Imprime el texto con los tiempos, y se lee entero.
- `--vocabulary` lleva los nombres propios que Whisper tiene que escribir bien: se le preguntan a la
  persona si el texto los tiene mal.
- `--language` si el video no es en español (`en`, `pt`).
- Las palabras marcadas con `[?]` son las que Whisper no entendió bien.

## 2. Elegir el tramo y confirmar las palabras dudosas

- **Un reel es, en general, un solo tramo:** desde el primer arranque limpio hasta el final del
  cierre.
- **Afuera quedan:**
  - los arranques falsos ("Bueno, este…" al principio);
  - las ideas dichas dos veces, de las que se deja la mejor;
  - el último segundo, si es audio cortado.
- **Con varios tramos,** el orden de la lista es el orden del reel.
- **Las palabras con `[?]`** se le muestran a la persona con su frase y se confirman antes de animar.
  Ejemplo real: Whisper escribió "sistema de vida" donde la persona dijo "sistema de IA".
- Si hay cortes que sacan palabras dichas (no solo silencios), se le dice a la persona qué sale.

## 3. Escribir el plan y cortar

Se copia `.claude/skills/editar-reel/plantilla/plan.json` a `reels/<slug>/plan.json` y se completa:

| Campo | Qué lleva |
|---|---|
| `source` | La ruta del video, relativa a la carpeta del proyecto (`videos/mi-video.mov`) o absoluta |
| `out` | `../../public/reels/<slug>` |
| `camera` | `{"x": 0, "y": 0, "w": 1080, "h": 1920}` para un video del celular. Si el video es de otro tamaño, se mide con `ffprobe` y la caja es el video entero |
| `speed` | `cut.speed` del estilo |
| `min_pause` | `cut.minPause` del estilo |
| `fps` | 30 |
| `vocabulary` | Los mismos nombres del paso 1 |
| `segments` | `{start, end, text}` en segundos de la fuente |
| `patches` | Opcional: desenfoques de privacidad, en segundos y píxeles de la fuente |

```bash
python tools/cut.py reels/<slug>/plan.json --check
python tools/cut.py reels/<slug>/plan.json
```

- **`--check` solo informa.** Un borde marcado con "loud: may cut a word" se corre al hueco entre dos
  palabras.
- **El corte hace cinco cosas:**
  - saca las pausas, dejando 0,08 s de aire;
  - acelera;
  - limpia la voz;
  - la nivela a -14 LUFS, el volumen al que normalizan Instagram, TikTok y YouTube;
  - vuelve a transcribir el corte, y de ahí salen los tiempos exactos de `words.json`.
- **Un video que no es 1080x1920** (por ejemplo 720x1280) se corta igual: Remotion lo escala al cuadro
  del reel.

## 4. Rastrear la cara

```bash
python tools/track_face.py public/reels/<slug>/cut.mp4 public/reels/<slug>/face.json
```

Imprime entre qué valores se mueve el centro de la cara y la altura de los ojos. Los gráficos de los
costados van debajo de los ojos y fuera del ancho de la cara.

## 5. El guion visual, antes del código

Va en el encabezado de la composición, como en la plantilla:

- **La portada:** una línea de entrada y un título. En Instagram se piensa como miniatura del perfil.
- **Los momentos ilustrados,** con la cantidad por minuto de `estilo/estilo.md`. Cada uno lleva:
  - la palabra que lo trae y la que lo saca;
  - qué dibuja: **la idea, no la frase.** "Tres cosas fijas" es un panel con tres chips; "no acumules"
    es una pila de carpetas que se tacha.
- **Las `keywords`:** de 10 a 15 por minuto, las palabras que cargan la idea. Si todo resalta, nada
  resalta.
- **Las `phrases`:** pares de palabras que son una sola idea ("segundo cerebro").
- **El cierre:** la palabra que se comenta y qué recibe quien comenta.

**En el primer reel, la lista de momentos se le muestra a la persona** en palabras simples ("cuando
se dice 'tres pasos' aparece un panel con los tres") y se le pregunta si hay alguno que no va.

## 6. Armar la composición

- Se copian `plantilla/data.ts` y `plantilla/Reel.tsx` a `src/reels/<slug>/`.
- En `data.ts`, `SLUG` se cambia por el slug.
- `ReelNuevo` pasa a llamarse `Reel<Slug>` (`ReelPrecios`), en el nombre del archivo y en el
  componente.
- Se completa cada `TODO`. Un `at('TODO')` que quede tira error al renderizar.
- Se registra en `src/Root.tsx`:

  ```tsx
  import * as precios from './reels/precios/ReelPrecios';
  <Composition id="ReelPrecios" component={precios.ReelPrecios} durationInFrames={precios.REEL_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
  ```

- Los gráficos propios del reel van en `src/reels/<slug>/parts.tsx` (ver `componentes.md`).
- Se corre `npx tsc --noEmit`. Tiene que dar sin errores.

## 7. Mirar antes de renderizar

Se arma el paquete una vez y se sacan cuadros sueltos: el cuadro 0 y uno por momento, ya entrado. El
cuadro N es el segundo × 30.

```bash
npx remotion bundle src/index.ts --out-dir out/bundle
npx remotion still out/bundle Reel<Slug> out/cuadros/f<N>.png --frame=<N>
```

Se miran con Read y se revisa:
- **que la portada se lea entera** dentro del recorte de la grilla de Instagram (de y=240 a y=1680);
- **que nada tape los ojos** (la altura de los ojos está en `face.json`);
- **que los paneles queden debajo de y=215;**
- **que ninguna palabra se parta en dos renglones;**
- **que no haya dos gráficos a la vez en la misma zona.**

Para mirar en movimiento: `npx remotion studio src/index.ts`.

## 8. Renderizar

Conviene correrlo en segundo plano:

```bash
npx remotion render src/index.ts Reel<Slug> out/reels/<slug>-v1.mp4
```

Un reel de 64 s tardó unos 4 minutos en la máquina donde se armó este kit. Después se mide el sonido:

```bash
ffmpeg -hide_banner -i out/reels/<slug>-v1.mp4 -af ebur128=peak=true -f null -
```

- **Tiene que dar** -14 LUFS (más o menos 1) y el pico real en -1 dBFS o menos.
- **Si el pico se pasa,** se baja el `vol` del efecto que cae ahí o `sound.gain` del estilo.

Se arma una hoja de cuadros y se mira con Read:

```bash
ffmpeg -v error -y -i out/reels/<slug>-v1.mp4 -vf "fps=1/4,scale=270:-1,tile=6x3" -frames:v 1 out/reels/<slug>-v1-hoja.jpg
```

## 9. Entregar

Se le informa a la persona:
- la ruta completa del video;
- la duración;
- el volumen (LUFS) y el pico;
- la lista de momentos;
- las palabras corregidas;
- lo que quedó pendiente.

Nada se publica: subirlo es de la persona.

## Zonas de Instagram (1080x1920)

| Zona | Píxeles | Qué no va ahí |
|---|---|---|
| Barra de arriba | y 0 a 200 | Texto |
| Botones de la derecha | x mayor a 960, y 1100 a 1700 | Texto (la burbuja del cierre apunta ahí a propósito) |
| Pie con nombre y descripción | y mayor a 1650 | Texto |
| Recorte de la grilla del perfil (3:4) | y 240 a 1680 | La portada tiene que entrar entera |

TikTok y YouTube Shorts tapan zonas parecidas, pero no están medidas: se le pide a la persona una
captura de un video suyo en esa app y se marcan las zonas sobre esa captura.
