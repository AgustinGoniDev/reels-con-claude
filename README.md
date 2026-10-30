# Reels con Claude

Un proyecto para editar reels verticales con [Claude Code](https://docs.claude.com/en/docs/claude-code/overview).
Le das a Claude una grabación tuya hablando a cámara y te devuelve un reel 1080x1920 listo para subir:

- **sin silencios** y un poco más rápido;
- con **subtítulos animados**, con las palabras importantes resaltadas;
- con una **portada** que funciona como miniatura en el perfil;
- con **momentos ilustrados**: paneles, íconos y gráficos que aparecen justo cuando se dice la palabra;
- con un **cierre** del tipo "Comenta GUÍA y te la mando";
- con la **voz limpia** y el volumen nivelado.

Las animaciones se arman con [Remotion](https://www.remotion.dev): son código, así que se corrigen con
precisión ("el panel, medio segundo antes") en lugar de rehacer todo.

## En qué se diferencia de pedir "anima este video"

Con un pedido así, Claude tiene que adivinar el estilo, y cada "así no" cuesta un render entero. Este
proyecto trae una skill que primero baja el criterio:

1. **Cinco preguntas,** de a una y sin jerga: dónde se va a publicar, si la marca ya tiene colores,
   qué reels te gustaría que se parezcan al tuyo, cómo debería terminar y qué no te gustaría ver.
2. **El análisis de tus reels de referencia:** Claude los mide (cortes, colores, ritmo), arma hojas
   de cuadros y hace preguntas concretas sobre lo que vio, con la imagen a la vista.
3. **Una vista previa de 15 segundos de tu video en dos versiones, lado a lado,** para elegir
   mirando.
4. **Recién ahí, el reel completo.** El estilo queda guardado en `estilo/`, y el próximo reel ya no
   pregunta.

## Qué se necesita

- **Claude Code**, en la terminal o en la app de escritorio.
- **Una computadora con Windows o macOS.** Está probado en Windows 11; en macOS todavía no.
- **Node 18 o más nuevo, Python 3.9 o más nuevo y ffmpeg.** Si falta alguno, Claude muestra el
  comando que lo instala y pide permiso antes de correrlo.
- **Unos 3 GB libres:** unos 800 MB de paquetes del proyecto y entre 0,5 y 1,6 GB del modelo que
  transcribe la voz (Whisper), según si la computadora tiene placa de video NVIDIA.
- **La grabación:** vertical, una persona hablando a cámara y ocupando todo el cuadro. La del celular
  sirve.

## Cómo empezar

1. **Bajar el proyecto:** en GitHub, el botón verde **Code → Download ZIP**, y descomprimirlo. O con
   git:

   ```bash
   git clone https://github.com/AgustinGoniDev/reels-con-claude.git
   ```

   **En Windows, conviene una ruta corta,** como `C:\reels-con-claude`. Dentro de carpetas muy
   profundas (por ejemplo, adentro de OneDrive) Windows corta las rutas largas y Remotion no puede
   renderizar.

2. **Crear la carpeta `videos/`** dentro del proyecto y poner ahí la grabación. Los reels de
   referencia, si los hay, van en otra carpeta nueva, `referencias/`. Ninguna de las dos se sube a
   GitHub.
3. **Abrir la carpeta en Claude Code.** En la terminal:

   ```bash
   cd reels-con-claude
   claude
   ```

4. **Escribir el pedido:**

   ```text
   Quiero editar mi primer reel. El video está en videos/<nombre del archivo>.
   ```

No hace falta un pedido más preciso: de las preguntas se encarga la skill.

## Qué va a pasar

| Fase | Qué hace Claude | Tu parte |
|---|---|---|
| 0. Preparar | Revisa que la computadora tenga todo e instala lo que falta del proyecto | Dar permiso para instalar |
| 1. Criterio | Hace las cinco preguntas y analiza las referencias | Contestar y elegir mirando cuadros |
| 2. Vista previa | Corta el video y edita los primeros 15 segundos en dos versiones | Mirar las dos y elegir, o pedir cambios |
| 3. Reel completo | Edita el video entero con el estilo elegido | Mirar el reel y pedir los ajustes |

El reel queda en `out/reels/`. Claude nunca publica nada: subirlo queda de tu lado.

## Qué hay adentro

| Carpeta | Qué tiene |
|---|---|
| `.claude/skills/editar-reel/` | La skill: las fases, las preguntas, los pasos y las plantillas |
| `estilo/` | El estilo propio (`estilo.json` y `estilo.md`) y el estilo del ejemplo |
| `src/reel/` | El kit: subtítulos, cámara, portada, paneles, íconos, cierre |
| `src/reels/muestra/` | Una muestra de 9 segundos sin video: comprueba que todo anda y deja ver el estilo antes de tocar la grabación |
| `.claude/skills/editar-reel/ejemplo/` | El código de un reel terminado, como referencia (el video no está en el repositorio) |
| `tools/` | Los scripts de Python: preparar, transcribir, cortar, rastrear la cara, analizar referencias, comparar versiones |
| `public/sfx/` | Los efectos de sonido |

Las grabaciones, las referencias y los renders (`videos/`, `referencias/`, `out/`) quedan en la
computadora: el `.gitignore` los deja afuera del repositorio.

## Límites

- **Claude no ve el video en movimiento.** Ve cuadros sueltos y lee la transcripción. Por eso la
  vista previa no es opcional: el ritmo y el movimiento se validan mirándolos.
- **Las zonas que tapan TikTok y YouTube Shorts** no están medidas. Para esas apps, Claude pide una
  captura de un video propio en esa app.
- **No agrega música** ni imágenes de archivo, y no trae logos de otras marcas. El logo de una
  herramienta se agrega a mano en `public/logos/`.
- **El kit da por hecho que la persona ocupa todo el cuadro.** Una grabación con la cámara en un
  recuadro necesita recortarse antes.

## Licencias

- **El código de este proyecto** tiene licencia MIT: ver [`LICENSE`](LICENSE).
- **Remotion tiene su propia licencia.** Es gratis para personas, para empresas de hasta 3 empleados
  y para organizaciones sin fines de lucro. **Una empresa de 4 personas o más necesita una licencia de
  empresa** para usarlo: ver [remotion.dev/license](https://www.remotion.dev/license).
- **Los íconos, los efectos de sonido, los modelos y las tipografías** son de terceros, con licencias
  libres: ver [`THIRD_PARTY.md`](THIRD_PARTY.md).

---

Hecho por Agustín Goñi, de [Australis AI](https://australisai.tech).
