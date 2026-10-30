# Las piezas del kit

El kit vive en `src/reel/` y lo usan todos los reels. Cada reel lo importa desde `../../reel/...`.

**Cambiar el kit cambia todos los reels.** Después de tocarlo, se sacan cuadros sueltos de la
`Muestra` (`src/reels/muestra/`) y de los reels del proyecto antes y después del cambio, y se
comparan en PNG. Si el cambio no tenía que alterarlos, tienen que dar idénticos.

## El estilo y el tema

| Archivo | Qué tiene |
|---|---|
| `style.ts` | El tipo `ReelStyle` (lo que guarda `estilo/estilo.json`), `mergeStyle(overrides, desde?)` y `ReelProps` |
| `theme.tsx` | `ReelShell` (la raíz de cada reel), `useTheme()` y las ayudas `alpha` y `mixColor` |
| `fonts.ts` | Las tipografías disponibles. Para sumar una de Google Fonts se agrega su línea en `LOADERS` |
| `format.ts` | `FPS` (30), `W` (1080) y `H` (1920) |

**Todo color y toda tipografía salen de `useTheme()`,** nunca de un valor suelto:

```tsx
const { c, f, style } = useTheme();
// c.accent, c.accentGlow, c.accentSoft, c.title, c.text, c.strike, c.panel,
// c.ink (lo que se lee sobre el acento), c.glass, c.glassLine, c.shade(opacidad)
// f.title, f.text, f.highlight, f.label
// style: el ReelStyle completo, para leer opciones (style.captions.mode, style.sound.effects)
```

**Cada reel recibe `overrides`** por sus props y los mezcla con su estilo. Así la vista previa
renderiza dos versiones del mismo código con `--props`:

```tsx
export const ReelPrecios: React.FC<ReelProps> = ({ overrides }) => {
  const style = useMemo(() => mergeStyle(overrides), [overrides]);
  const rig = useMemo(() => makeRig({ joins, duration, style, shifts: SHIFTS, punches: PUNCHES }), [style]);
  return <ReelShell reelStyle={style}>…</ReelShell>;
};
```

## Datos, cámara y sonido

### `loadCut(data, face, fixes)`, en `cut.ts`

Recibe el `words.json` y el `face.json` del corte y devuelve:

| Campo | Qué es |
|---|---|
| `duration` | Duración del corte, en segundos |
| `joins` | Los tiempos de cada unión del corte |
| `words` | Las palabras, con las correcciones de `fixes` aplicadas |
| `at(palabra, desde?)` | Ver abajo |
| `faceAt(t)` | `{cx, cy, w, h}` de la cara en el segundo `t`, en píxeles del video |

**`at(palabra, desde?)`** da el inicio de la primera vez que se dice la palabra a partir del segundo
`desde`:
- Ignora tildes, mayúsculas y puntuación.
- Para una aparición posterior se encadena: `at('cerebro', at('necesitas'))`.
- **Si la palabra no está, tira un error.** Así, un corte nuevo que pierde un ancla falla en vez de
  mover un gráfico a cualquier lado.

**`fixes`** corrige palabras que Whisper escribió mal, por su segundo de inicio con un decimal:
`{ '58.4': 'IA' }`. Cada corrección se confirma con la persona.

### `makeRig({ joins, duration, style, shifts, punches })`, en `rig.tsx`

La cámara. Devuelve `{ shiftAt, camera }`.

- **`shifts`:** tramos `{from, to}` en segundos en que la persona baja para liberar la franja de
  arriba (se acerca un 15 % y baja hasta 150 px). Si `from` es 0, ya está bajada en el cuadro 0. Se
  usan con la portada y mientras hay un panel arriba.
- **`punches`:** los segundos de los zooms cortos. Solo se aplican si `style.camera.punches` es
  `true`.
- Con `style.camera.cuts`, cada unión del corte alterna dos encuadres (1,0 y 1,07), así una pausa
  sacada se lee como un corte.

### Las otras piezas de `rig.tsx`

| Pieza | Props | Qué hace |
|---|---|---|
| `SpeakerTrack` | `video`, `rig`, `duration` | La persona y, al final, el último cuadro congelado 1,5 s |
| `Shade` | `rig`, `coverOut?` | Oscurece arriba y abajo. Más profundo detrás de la portada |
| `Sfx` | `cues` | Los efectos de sonido. No suena nada si `style.sound.effects` es `false` |
| `reelFrames` | `duration`, `tail = 1.5` | Los cuadros de la composición |

**`cues`** es una lista de `{at, src, vol}`. Los archivos están en `public/sfx/`:

| Momento | Efecto | `vol` |
|---|---|---|
| Entra o sale un panel | `whoosh_corto.wav` | 0,35 |
| Aparece cada chip | `click_003.ogg` | 0,35 |
| Algo queda fijo o bloqueado | `switch_005.ogg` | 0,4 |
| Una afirmación fuerte | `impactSoft_medium_001.ogg` o `_002` | 0,35 |
| Aparece una ficha o un logo | `pop.wav` | 0,4 |
| Se escribe algo | `keypress-003.wav` y `keypress-012.wav` | 0,25 |
| Caen cosas | `drop_002.ogg` | 0,3 |
| La palabra del cierre | `impactSoft_heavy_003.ogg` | 0,35 |
| Entra lo que se manda | `whoosh.wav` | 0,35 |
| Un momento grande (usar poco) | `riser.wav`, `boom.wav`, `impactBell_heavy_000.ogg`, `glitch_004.ogg` | 0,3 |

## Subtítulos: `Captions`, en `Captions.tsx`

```tsx
<Captions words={words} keywords={KEYWORDS} phrases={PHRASES} until={A.cta} y={(t) => style.captions.y + (rig.shiftAt(t) > 0.5 ? 70 : 0)} />
```

- **El modo sale del estilo:**
  - `lockup`: de 2 a 4 palabras; la clave va en el medio, grande, y las demás chicas arriba y abajo.
  - `phrase`: líneas de hasta 3 palabras; la palabra que se está diciendo se pinta con el acento.
- **`keywords`:** palabras o pares de palabras que ganan el lugar de la clave y van con el acento.
- **`phrases`:** pares que quedan juntos como una sola clave ("segundo cerebro").
- **`until`:** desde ahí no hay subtítulos, porque el cierre ocupa esa zona.
- **Las palabras de relleno** ("que", "para", "una") nunca son la clave.

## Piezas, en `parts.tsx`

| Pieza | Props | Para qué | Dónde |
|---|---|---|---|
| `CoverTitle` | `lead`, `title`, `out` | La portada del cuadro 0 | Arriba, desde y=250 |
| `Board` | `icon`, `title`, `at`, `out`, `sub?`, `badge?`, `chips`, `exitAt?` | Panel con título y chips | Arriba, en y=210, dentro de un shift |
| `CommentCta` | `at`, `keyAt`, `word`, `lead?`, `y` | El cierre de "comentá la palabra" | Al centro (y=1130), con la burbuja abajo a la derecha |
| `GuideCover` | `at`, `x`, `y`, `title`, `accent`, `eyebrow?`, `icon?`, `scale?` | La tapa de lo que se manda | Al costado, a la altura del cachete |

Sobre `Board`:
- **`chips`** es una lista de `{icon, label, at}`: cada chip aparece cuando se dice su palabra.
- **`badge`** es `{text, at}`: un sello en mayúsculas con candado. Al aparecer, marca los chips.
- **`sub`** es `{text, at}`: el subtítulo, con la tipografía de resaltar.
- **`exitAt`** saca los chips por la derecha, de a uno: para cosas que "entran y salen".

`CommentCta` usa `style.ending.lead` si no se le pasa `lead`. Para otro cierre (seguir la cuenta, un
link) se arma una pieza propia con el mismo molde.

Para armar piezas propias, `parts.tsx` exporta también `alive(t, at, out)`, `BAND_TOP` (215) y
`glassCard(c)`.

## Íconos y efectos

| Pieza | Archivo | Props | Qué es |
|---|---|---|---|
| `Icon` | `Icon.tsx` | `name`, `size`, `color?`, `draw` (0 a 1), `width` | El ícono suelto. `draw` lo traza |
| `IconTile` | `Icon.tsx` | `name`, `at`, `out`, `x`, `y`, `size = 180`, `rot`, `label?`, `tone` | Ficha que flota con un ícono que se dibuja. `tone`: `'glass'` (oscura) o `'accent'` |
| `BrainNet` | `Icon.tsx` | `at`, `out`, `x`, `y`, `size = 220` | Una red de nodos que se conecta sola |
| `Sparkles` | `effects.tsx` | `at`, `x`, `y`, `n`, `radius`, `color?` | Un estallido corto de destellos |
| `LogoTile` | `effects.tsx` | `src`, `bg`, `at`, `out`, `x`, `y`, `size`, `rot`, `label?` | El logo real de una herramienta, en una ficha |

**Íconos disponibles:** `cpu`, `sparkles`, `workflow`, `layers`, `box`, `repeat`, `arrow-right`,
`git-branch`, `split`, `database`, `file-text`, `bar-chart`, `trending-up`, `link`, `plug`, `globe`,
`terminal`, `code`, `building`, `users`, `dollar`, `credit-card`, `mail`, `message`, `bot`, `check`,
`x`, `alert`, `help`, `clock`, `lock`, `zap`, `target`, `search`, `eye`, `settings`, `user`, `audio`,
`video`, `folder`.

**Un ícono que falta** se dibuja en `EXTRA_ICONS` dentro de `Icon.tsx`, con el mismo estilo:
grilla de 24x24, solo trazo, puntas redondeadas. Se puede copiar la geometría de
[Lucide](https://lucide.dev) (licencia ISC).

**Logos:** el repositorio no trae logos de otras marcas. Si en el reel se nombra una herramienta y la
persona quiere el logo, lo pone ella en `public/logos/` (el SVG oficial) y se usa `LogoTile`.
**Nunca emojis:** van íconos de línea o el logo real.

## Piezas propias de un reel

Lo que dibuja una idea de un solo reel va en `src/reels/<slug>/parts.tsx`. Los ejemplos están en
`.claude/skills/editar-reel/ejemplo/parts.tsx`:
- `TwoLayers`: dos placas en perspectiva;
- `OutputFlow`: información, una flecha y un resultado;
- `DocCard`: un documento que se escribe solo;
- `FolderPile`: carpetas que caen y se tachan.

El molde:

```tsx
export const MiPieza: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const t = useTime();
  const { c, f } = useTheme();
  const pop = useSpringAt(at, 11, 0.7); // los hooks, antes de cualquier return
  if (!alive(t, at, out)) return null;
  const leave = prog(t, out, 0.25);
  return <div style={{ ...glassCard(c), opacity: Math.min(1, pop * 1.6) * (1 - leave) }}>…</div>;
};
```

**Las ayudas de movimiento** están en `src/lib/motion.ts`:

| Ayuda | Qué hace |
|---|---|
| `useTime()` | El segundo actual |
| `prog(t, inicio, dur)` | Va de 0 a 1 con suavizado |
| `useSpringAt(inicio, damping, mass)` | Un rebote que arranca en `inicio` |
| `mix(a, b, p)` | Mezcla `a` y `b` según `p` |

**Si una pieza propia sirve para otros reels,** se pasa al kit: se mueve a `src/reel/parts.tsx` con
sus textos como props.
