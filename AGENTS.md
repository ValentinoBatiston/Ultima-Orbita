# AGENTS.md — Última Órbita

## Estado del proyecto

Arcade 2D de scroll vertical (tipo 1942) en Phaser. **El juego está completo y
es jugable de punta a punta**: menú, tres niveles, vidas, puntuación, Game Over y
Victoria. Falta ajustar el tuning con pruebas reales del usuario.

- Requisitos: `docs/GDD Trabajo final Desarrollo Tecnológico 2 - Valentino Batiston.pdf` (13 págs., 22 secciones). Fuente de verdad.
- Stack: **JavaScript + Phaser 4.2.1 + Vite 6**. Antes de escribir código,
  verificar la API leyendo `node_modules/phaser/src/`: la v4 no es la v3 y
  parte de la documentación web sigue describiendo la v3.
- Tuning: los valores que usa el código están en `src/config/parametros.js`
  (fuente de verdad) y el razonamiento en `docs/PARAMETROS.md`. **No hardcodear
  números en las escenas.** Al cambiar un valor, citar el §N del GDD que lo respalda.
- Referencia al GDD por número de sección (§N). El PDF no tiene paginación
  impresa y las páginas del archivo no coinciden con nada impreso.

## Comandos

```powershell
npm install
npm run dev        # Vite en http://localhost:8080
npm run build      # build de producción a dist/
npm run preview    # sirve dist/
```

No hay lint, typecheck ni tests configurados. Si se agregan, documentarlos acá.

## Estructura

- `src/config/parametros.js` — **todos** los valores de tuning, más las claves de
  sprites (`ASSETS.claves`) y de audio (`AUDIO.sfx`, `AUDIO.musica`).
- `src/game/main.js` — config del juego y registro de escenas.
- `src/game/estado/EstadoPartida.js` — patrón State + Observable. **Fuente única
  de verdad de vidas, puntuación y nivel**, guardada en el registro de Phaser.
  Se obtiene siempre con `obtenerEstado(scene)`.
- `src/game/objetos/` — entidades: `Nave`, `Enemigo`, `Obstaculo`, `Estacion`,
  `Proyectiles`, `Fondo`, `Generador`, y `sprite.js` (crear + colisión).
- `src/game/scenes/` — `Boot`, `MenuPrincipal`, `EscenaNivel`, `HUD`,
  `Pantallas.js` (GameOver + Victoria).
- `src/game/servicios/Sonido.js` — SFX y música.
- `src/game/utilidades/teclas.js` — `esperarTecla` (una pulsación = una acción).
- `assets/` — `sprites/`, `music/`, `sfx/`. Es el `publicDir` de Vite, así que
  `assets/sprites/player.png` se carga como `'sprites/player.png'`.

### Decisiones de diseño

- **Una sola clase de nivel** (`EscenaNivel`) registrada tres veces con claves
  `Nivel1/2/3`. Todo lo que distingue un nivel sale de `NIVELES`. Agregar un
  nivel es agregar una entrada de configuración, no copiar una escena.
- **Estrategia** para el movimiento de enemigos: cada nivel elige su función de
  movimiento, sin condicionales acumuladas.
- **Factory** en `Generador`: concentra los intervalos y límites de aparición de
  §9, §10 y §14.
- **Command** implícito en `Nave.mover()`: recibe direcciones lógicas, no teclas,
  así que el único lugar que conoce WASD/flechas es `registrarTeclas`.
- El HUD se refresca a 10 Hz con su propio `update`, no suscribiéndose a cada
  cambio: `sumarAvance()` mueve la puntuación en cada frame y notificar eso serían
  60 emisiones por segundo.

## Trampas de la API de Phaser 4

Verificado en 4.2.1 leyendo el paquete instalado. **No trasladar suposiciones de Phaser 3.**

- **`textures.generate(clave, config)` ya no existe** en v4, pero la página de
  docs de Textures todavía lo muestra. Para generar texturas usar
  `Graphics.generateTexture(clave, ancho, alto)` sobre un `Graphics`.
- **`sound.exists()` ya no existe.** Para saber si un audio está cargado:
  `scene.cache.audio.exists(clave)`.
- **`sound.add()` NO reproduce el sonido**, solo lo crea. Hay que llamar a
  `play()` aparte o la música queda muda.
- `make.graphics(config, addToScene)`: `add` es un **argumento posicional** y no
  está tipado en `Options`. Usar `make.graphics()` para generar texturas (no
  dibuja nada) y `add.graphics()` para dibujar visible.
- `pixelArt` va en la **raíz** del config de juego, nunca dentro de `scale`.
- Los cambios de escena se **encolan** y se aplican en el siguiente update del
  Scene Manager, no en el instante. Existen `start`, `launch`, `switch` y `run`;
  `start` apaga la escena que llama, `launch` no.
- `setVelocity` **no existe** en un GameObject base, solo en los plugins de
  físicas. Para mover sin motor: `setPosition` con `delta`. Para solapamiento:
  `Geom.Intersects.RectangleToRectangle(a.getBounds(), b.getBounds())`
  (`Geom` viene del import nombrado de `phaser`).
- Sin cambios respecto de v3: `add.text`, `input.keyboard.addKeys`,
  `createCursorKeys`, `addKey` y `.isDown`. El evento `'keydown-<TECLA>'` se
  emite una sola vez por pulsación (`emitOnRepeat` viene en `false`).
- **`npm create phaser` no es oficial**: `create-phaser` es un paquete de
  terceros de 2023. La vía oficial son los templates de GitHub
  (`phaserjs/template-vite`), que además pinean `phaser@4.0.0`.

### Trampa de unidades en el Generador (resuelta, no la repitas)

Los intervalos de aparición de `NIVELES` están en **milisegundos**
(`spawnEnemigoMs`, `spawnAsteroideMs`, `spawnEscombrosMs`), pero el `Generador`
mide la aparición por **distancia en píxeles** para que la densidad no dependa
de la tasa de frames. La conversión a píxeles se hace en el constructor:

```js
const aPx = (ms) => (this.cfg.velocidadScroll * ms) / 1000;
```

Si se comparan los milisegundos contra la distancia sin convertir, un intervalo
de 2000 ms se vuelve 2000 píxeles, que a 90 px/s son **33 segundos** en vez de 2.
Pasó: el nivel 1 quedaba vacío y parecía un problema de tuning.

### Trampa del estado de partida (ya resuelta, no la repitas)

`EstadoPartida.estado` debe volver a `JUGANDO` en **cada** transición. Si
`avanzarDeNivel()` no lo hace, el nivel nuevo hereda `NIVEL_CUMPLIDO` del
anterior, `update()` sale por `if (!enJuego) return` y **el juego queda
congelado**: sin movimiento, sin colisiones y sin poder completar el nivel.
Cualquier estado nuevo necesita su transición.

## Leer el GDD

El modelo no acepta PDFs como entrada y en esta máquina no hay `pdftotext`
ni `pip`. Ruta verificada:

```powershell
python -m ensurepip --default-pip        # una vez, habilita pip
python -m pip install pypdf
```

```python
from pypdf import PdfReader
import re
text = re.sub(r"\s+", " ", page.extract_text() or "")   # obligatorio: sin
# esto el texto sale en una palabra por línea y es ilegible
```

## Reglas del juego

Cerradas con el usuario. No reinterpretar sin consultarle.

- **3 vidas compartidas entre los tres niveles** (§11). No se renuevan al
  cambiar de nivel.
- Se pierde 1 vida por: choque con asteroide, choque con escombros espacial,
  choque con nave enemiga o disparo enemigo (§11 + resolución del usuario sobre
  la ambigüedad de §8).
- Al perder una vida la nave reaparece en **centro-abajo `(240, 540)`**, con
  **2 s de invulnerabilidad** y **sin perder el avance del nivel**.
- Victoria: completar N1 + N2 + N3 y llegar a la estación final (§13).
  Derrota: 0 vidas → Game Over → **reinicia desde el Nivel 1** (§12).
- Puntuación: destruir naves enemigas + avanzar. **Acumula entre niveles** y se
  muestra en Victoria y en Game Over (§15). El récord se compara **solo dentro
  de la sesión**, sin persistencia.
- La barra de progreso de §17 está **decidida como fuera de alcance por ahora**.
  No implementarla salvo pedido explícito.
- Nave: 260 px/s constantes en las 4 direcciones; no puede salir de
  `[0,480] x [0,720]`, ni por arriba, ni por abajo, ni por los costados. El
  avance vertical es automático y lo marca el scroll del nivel.
- Disparo del jugador: continuo manteniendo Espacio, cooldown 0.2 s.
- Enemigos: en el **Nivel 1 solo se mueven en línea recta** (§9). Los niveles 2
  y 3 suman desplazamiento horizontal y perpendicular para subir la dificultad.
- Controles: **WASD o flechas** para mover, **Espacio** para disparar (§6).
  **Solo PC y un jugador** (§1): no agregar controles táctiles ni multijugador.

## Guardas de alcance (§21)

No implementar aunque parezca una mejora fácil: mejoras de armas, árboles de
habilidades, inventarios, multijugador, niveles adicionales. La dificultad sube
por cantidad y frecuencia de enemigos y obstáculos (§14), no con sistemas nuevos.

## Recursos gráficos

**El arte definitivo ya está en `assets/`**: 8 PNG de sprites, 2 pistas de música
y 8 efectos. Los `.pxo` son archivos de proyecto de Aseprite y están ignorados
por `.gitignore`; el juego nunca los carga.

- Las claves de textura (`ASSETS.claves`) y de audio (`AUDIO.sfx`,
  `AUDIO.musica`) son el contrato con el arte. **No renombrarlas** sin actualizar
  la referencia del otro lado.
- `ASSETS.modoMockup` en `src/config/parametros.js` permite volver a generar
  figuras simples en runtime para desarrollar sin los PNG. Hoy está en `false`.
- **No elegir, crear ni inventar nombres o rutas de assets sin confirmarlo con
  el usuario.** Preguntar siempre si se quiere mockup o recurso existente.
- Si un archivo esperado no está, pedirlo antes de avanzar con lo que dependa de
  él; seguir con la lógica que no dependa de él.

## Pendientes

- **Tuning sin validar contra el juego real.** Todos los valores de §10 y §14
  (duración, cantidades, frecuencias) son estimaciones razonables, no valores
  medidos. Falta que el usuario juegue y los ajuste.
- La barra de progreso de §17 sigue fuera de alcance por decisión del usuario.
- Sin lint, typecheck ni tests. `EstadoPartida` es el candidato natural a tests
  unitarios: las reglas de vidas y puntuación son puras y fáciles de verificar.
- Sin ícono de ventana: el favicon por defecto es el de Vite.

## Flujo de trabajo

1. Localizar el §N que regula el cambio y citarlo.
2. Clasificar el requisito: definido / parcial / no documentado / en
   contradicción. Si no está en el GDD, es ampliación: **preguntar, no inventar
   la regla.**
3. No asumir que el código cumple el GDD: comparar contra §N.
4. Preservar cambios previos del usuario; no descartarlos ni mezclarlos.
5. **Commit y push solo con autorización explícita.** Sin force push, sin tocar
   hooks ni config, sin mergear. Si un hook falla, se arregla antes de seguir.

## Verificación en navegador

El navegador del entorno es headless: **`requestAnimationFrame` no dispara**,
así que el loop de Phaser queda en `frame 0` y nada se ve aunque el código esté
bien. Para verificar lógica sin abrir una ventana:

```javascript
let t = 0;
for (let i = 0; i < 5; i++) { t += 16; game.scene.update(t, 16); game.scene.render(game.renderer); }
```

Como el input del navegador tampoco llega a la página, disparar eventos
sintéticos: `window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', keyCode: 32 }))`.

Los estados de escena (`sys.settings.status`) sirven para comprobar transiciones:
1 = INIT, 5 = RUNNING, 8 = SHUTDOWN. Ojo: el canvas no se puede capturar por
captura de pantalla en este entorno.