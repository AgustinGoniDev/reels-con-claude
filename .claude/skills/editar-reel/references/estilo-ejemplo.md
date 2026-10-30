# Un estilo real: "medio", de Agustín Goñi

Es el estilo del reel de ejemplo (el código en `../ejemplo/`, los valores en
`estilo/ejemplo-medio.json`). Se cuenta
completo porque muestra cómo sale un estilo: **no de describirlo, sino de reaccionar a versiones.** Las
primeras tres vueltas no se parecían al resultado final, y cada una dejó una regla.

La persona habla a cámara a cuadro completo, la cámara se mueve poco, los subtítulos salen en bloque
y unos pocos momentos ilustrados dibujan la idea que se está diciendo.

## Cómo se llegó

| Vuelta | Qué tenía | Qué dijo | Qué quedó |
|---|---|---|---|
| Primera | Pantalla partida, con un panel gráfico arriba y la persona abajo, en los colores de la marca | "No me convence" | Nada: la persona va a cuadro completo |
| Segunda (cuatro versiones) | Tipografía gigante apilada, sacudidas, latigazos, destellos y líneas de velocidad | "Se fue al otro extremo, demasiado" | Ese nivel de movimiento no va para un reel hablado |
| Tercera | Copia de una referencia: palabra clave en naranja, emojis | Le gustaron los bloques de subtítulos y cómo alternan las palabras. Pidió el color de su marca, nada de emojis ("muy de WhatsApp, hay que ser más original"), paneles menos apretados arriba, un título de portada y otro cierre | Los subtítulos en bloque |
| Cuarta y quinta | Color de marca, íconos de línea, la cámara que baja cuando hay un panel, portada y cierre nuevos; después, ajustes de lectura y de posición | "Está lista" | Este estilo |

**Lo que enseña:** con la vista previa en dos versiones desde el principio, las dos primeras vueltas se
hubieran resuelto mirando 15 segundos, sin renderizar tráileres enteros.

## Reglas

### La persona

- **A cuadro completo todo el reel.** No hay pantalla partida ni recuadro chico.
- **Cámara quieta:**
  - Cada unión del corte alterna dos encuadres (1,0 y 1,07), así una pausa sacada se lee como un
    corte.
  - Cada toma se acerca un 2 % mientras dura.
  - Hay zooms cortos de +3 % en las palabras clave: unos 7 en un minuto.
  - No hay sacudidas, latigazos ni destellos.
- **Bajar a la persona cuando hay texto arriba:** se acerca un 15 % y baja hasta 150 px, así el panel
  no queda apretado contra la cabeza. Se usa en la portada y mientras hay un panel arriba.
- **Nada tapa los ojos.** Los gráficos que flotan van al costado, a la altura del cachete. Si al
  final la persona se acerca a cámara, el gráfico baja: en una versión, la tapa de la guía le tapaba
  un ojo.

### Subtítulos

- **Bloques de 2 a 4 palabras.** El bloque se corta en cada signo de puntuación.
- **Las palabras chicas:** arriba y abajo de la clave, en Inter 500 de 50 y 44 px, blanco al 92 %.
  Aparecen palabra por palabra, saliendo de un desenfoque.
- **La palabra clave:** en el medio, en Inter 800, hasta 124 px y más chica si es larga. Va con el
  acento si está en la lista `keywords`, y en blanco si no.
- **Las `keywords` son unas 10 a 15 en un minuto,** las que cargan la idea.
- **A 1400 px de alto,** y a 1470 mientras la persona está bajada. Se apagan en el cierre.

### Color y forma

- **Un solo acento: el verde de la marca, `#00C4A0`.** El crema `#FAF4D3` es para los títulos de los
  paneles. El rojo `#FF6B6B` es solo para tachar. Nada de naranja.
- **Paneles de vidrio oscuro,** con borde blanco tenue, desenfoque de fondo y sombra.
- **Íconos de línea que se dibujan solos. Nunca emojis.** Si se nombra una herramienta, va su logo
  real.
- **Tipografías:** Montserrat 800 para títulos; Instrument Serif itálica, con el acento, para la
  palabra que se resalta dentro de un título; Inter para subtítulos y chips; JetBrains Mono para
  etiquetas en mayúscula.

### Los momentos ilustrados

- **Dibujan la idea, no repiten la frase:**
  - "Contexto fijo: avatar, oferta, servicio" es un panel con tres chips.
  - "No se trata de acumular información" es una pila de carpetas que se tacha.
  - "Dos capas" son dos placas en perspectiva.
- **Cada momento entra con la palabra que lo trae y sale con otra palabra,** nunca en un segundo fijo.
- **Unos 10 momentos en 64 segundos.** Nunca dos en la misma zona a la vez.
- **Zonas:** arriba (desde y=215, con la persona bajada) van los paneles con texto. A los costados, a
  la altura del cachete, van las fichas con un ícono o un logo. Abajo, cerca de y=1400, los
  subtítulos.

### Portada

- **El cuadro 0 es la miniatura en el perfil.** Lleva una línea de entrada (Montserrat 800, 60 px,
  blanco) y un título (Instrument Serif itálica, 124 px, con el acento), desde y=250.
- **Tiene que leerse dentro del recorte de la grilla,** de y=240 a y=1680.
- **Se va 0,25 s después de la primera palabra clave.**

### Cierre

- **"Comentá"** en blanco y, cuando se dice la palabra, la palabra en mayúsculas dentro de una pastilla
  del acento que cae con un golpe.
- **Una flecha se dibuja** desde la pastilla hasta una burbuja de comentario abajo a la derecha, donde
  está el botón de comentar, con un anillo que late.
- **La tapa de lo que se manda** (una guía) entra al costado cuando se nombra.
- **El último cuadro se congela 1,5 s** para que el cierre se pueda leer.

### Sonido y ritmo

- **Efectos suaves:** cada uno con un volumen de 0,25 a 0,4, por una ganancia de 0,6.
- **Mezcla final:** -14 LUFS, con el pico en -1 dBFS o menos. El reel dio -14,9 LUFS y -3,4 dBFS.
- **Velocidad 1,1x.** Se sacan las pausas de 0,30 s o más, dejando 0,08 s de aire.
- **Afuera:** los arranques falsos, las ideas dichas dos veces y el último segundo si es audio cortado.

## Lo que no va

- Emojis.
- Otro color de acento que no sea el de la marca.
- Sacudidas, latigazos, destellos, líneas de velocidad.
- Paneles pegados a la cabeza.
- Gráficos que tapen los ojos.
