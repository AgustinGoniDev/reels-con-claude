# Fase 2: la vista previa

Doce a quince segundos del video de la persona, editados en dos versiones, uno al lado del otro. Sirve
para decidir lo que no se pudo decidir preguntando, antes de gastar un render completo.

## Qué hace falta antes

- **El corte hecho:** los pasos 1 a 4 de [`edicion.md`](edicion.md) (transcribir, elegir el tramo,
  cortar, rastrear la cara). Se corta el video entero: el corte es rápido y el reel completo va a
  salir de ahí.
- **La carpeta del reel creada** desde la plantilla (paso 6 de `edicion.md`), con el componente
  registrado en `src/Root.tsx`.

## 1. Armar solo el principio

En la composición se completan **solo los primeros 12 a 15 segundos:**
- **la portada** (`CoverTitle`), si la plataforma es Instagram o la persona la quiere;
- **los subtítulos**, con las `keywords` de ese tramo;
- **uno o dos momentos ilustrados:** un panel arriba (`Board`) o una ficha al costado (`IconTile`),
  anclados a palabras reales;
- **los efectos de sonido** de esos momentos.

El resto de los anclajes de la plantilla se deja para la fase 3. Un `at('TODO')` que quede tira error,
así que en la vista previa se borran los que no se usan.

**El corte se elige en el final de una frase,** cerca de los 12 a 15 s: se busca en `words.json`
una palabra con punto o coma. El último cuadro es `segundo × 30 − 1`.

## 2. Decidir qué cambia entre A y B

A y B difieren **solo en lo que quedó sin decidir** en la fase 1, y en **no más de tres cosas**, todas
visibles en esos segundos. Si cambian siete cosas, la persona no sabe qué eligió.

| Situación | A | B |
|---|---|---|
| El criterio quedó claro | El estilo como quedó escrito | El mismo, con una sola diferencia en lo más dudoso |
| Dudó entre dos referencias | Lo de la primera | Lo de la segunda |
| No pasó referencias | Tranquila: subtítulos `lockup`, sin zooms (`camera.punches: false`), sin efectos de sonido | Con más movimiento: subtítulos `phrase` en mayúsculas, con zooms y efectos |

Las diferencias más útiles, porque se ven en pocos segundos:
- el modo de los subtítulos (`lockup` contra `phrase`) y las mayúsculas;
- el color que resalta, si la marca tiene dos;
- los zooms (`camera.punches`) y los cortes que se notan (`camera.cuts`);
- los efectos de sonido.

Cada versión es un archivo con lo que cambia respecto de `estilo/estilo.json`:

```json
{ "overrides": { "captions": { "mode": "phrase", "uppercase": true }, "camera": { "punches": true } } }
```

Van en `out/vistas/<slug>-a.json` y `out/vistas/<slug>-b.json`. Si A es el estilo tal cual, su
archivo es `{ "overrides": {} }`.

## 3. Mirar antes de renderizar

Se arma el paquete una vez y se sacan, de cada versión, el cuadro 0 y un cuadro en medio de cada
momento:

```bash
npx remotion bundle src/index.ts --out-dir out/bundle
npx remotion still out/bundle Reel<Slug> out/vistas/a-<N>.png --frame=<N> --props=out/vistas/<slug>-a.json
```

Se miran con Read: que la portada se lea, que nada tape los ojos, que ninguna palabra se parta en
dos renglones. Lo que esté mal se arregla antes de renderizar.

## 4. Renderizar y comparar

```bash
npx remotion render src/index.ts Reel<Slug> out/vistas/<slug>-a.mp4 --props=out/vistas/<slug>-a.json --frames=0-<último>
npx remotion render src/index.ts Reel<Slug> out/vistas/<slug>-b.mp4 --props=out/vistas/<slug>-b.json --frames=0-<último>
python tools/comparar.py out/vistas/<slug>-a.mp4 out/vistas/<slug>-b.mp4 out/vistas/<slug>-comparada.mp4
```

`comparada.mp4` tiene A a la izquierda y B a la derecha, con el sonido de A.

## 5. Mostrar y preguntar

Se le pasa a la persona la ruta completa de `<slug>-comparada.mp4` y, en dos líneas, qué cambia:

> A: subtítulos con una palabra grande y la cámara quieta. B: frases en mayúsculas con la palabra que
> se está diciendo resaltada, y un zoom en las palabras fuertes.

Y una sola pregunta: **"¿A, B, o una mezcla? ¿Qué le cambiarías?"**

Si la persona quiere ver una versión entera, se le pasan también `<slug>-a.mp4` y `<slug>-b.mp4`.

## 6. Aplicar

- **Lo elegido pasa a `estilo/estilo.json`.** Si eligió B, los `overrides` de B se escriben en el
  estilo. Si pidió una mezcla, se escribe la mezcla.
- **El comentario va al historial de `estilo/estilo.md`,** con sus palabras.
- **Si pidió cambios,** se hace otra vuelta: una sola versión con los cambios si los tiene claros, o
  otra comparación A/B si duda.
- **Tres vueltas como máximo.** Si a la tercera no cierra, se le pregunta qué es exactamente lo que no
  le gusta, mostrándole un cuadro concreto.

Con la vista previa aprobada, se sigue con la fase 3 sobre la misma composición.
