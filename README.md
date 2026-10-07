# Última Órbita

Arcade 2D de scroll vertical, en el estilo de los clásicos como *1942*, hecho
con **Phaser 4** y **JavaScript**. Controlás una nave que avanza sola hacia la
parte superior de la pantalla y tenés que esquivar asteroides, escombros y naves
enemigas hasta llegar a la estación espacial, en tres niveles de dificultad
creciente.

## Cómo jugar

**Opción 1 — online, sin instalar nada**

El juego está publicado en GitHub Pages:

**<https://valentinobatiston.github.io/Ultima-Orbita/>**

Se actualiza sola con cada cambio que se mergee a `main`, así que siempre está
al día.

**Opción 2 — desde tu máquina**

Ejecutá `jugar.bat`: instala lo necesario, compila y abre el juego en el
navegador.

O a mano:

```powershell
npm install
npm run dev
```

Y abrí <http://localhost:8080>.

Requisitos para la opción 2: **Node.js 18 o superior**. No hay nada más que
instalar a mano; las dependencias y los recursos del juego están en el repositorio.

## Controles

| Acción | Tecla |
|---|---|
| Mover | **W A S D** o **flechas** |
| Disparar | **Espacio** (mantener para disparo continuo) |

## Qué hay en el juego

- Tres niveles: Zona de Tránsito, Campo de Escombros y Última Órbita.
- Tres vidas compartidas entre los tres niveles.
- Puntuación por derribar enemigos y por avanzar, que acumula entre niveles.
- Pantallas de menú, Game Over y Victoria.
- Ocho efectos de sonido y dos pistas de música.

## Documentación

- `docs/GDD Trabajo final Desarrollo Tecnológico 2 - Valentino Batiston.pdf` —
  documento de diseño del juego, fuente de los requisitos.
- `docs/PARAMETROS.md` — valores de dificultad y decisiones tomadas.
- `AGENTS.md` — guía de desarrollo para asistentes de IA.

## Estructura

```
src/
  config/parametros.js     valores de juego, claves de sprites y de audio
  game/
    main.js                configuración del juego
    estado/                estado de la partida (vidas, puntos, nivel)
    objetos/               nave, enemigos, obstáculos, proyectiles, fondo
    scenes/                boot, menú, niveles, HUD, pantallas finales
    servicios/             sonido y música
    utilidades/            helpers
assets/
  sprites/  music/  sfx/   recursos del juego
```