# Parámetros y decisiones cerradas — Última Órbita

Decisiones tomadas con el usuario para completar los vacíos del GDD. Los valores
numéricos son **puntos de partida**, no valores validados: se ajustan al probar.

Este documento explica el **porqué** de cada valor. Los valores que consume el
juego están en `src/config/parametros.js`, que es la fuente de verdad para el
código: cambiar los números ahí, no en las escenas.

## Stack

- **JavaScript + Phaser 4.2.1** (etiqueta `latest` de npm a 2026-10).
- Phaser 4 no es la v3: la API cambió. Verificar contra la documentación oficial.

## Pantalla

**480 × 720**, escalado con `Scale.FIT`.

Vertical tipo arcade, conducive a pixel art con píxel entero, y encaja exacto a
1080p con factor 1.5. No sale de estos límites en ningún momento.

## Nave del jugador

| Parámetro | Valor |
|---|---|
| Velocidad | 260 px/s, constante en las 4 direcciones |
| Límites | `[0,480] x [0,720]`, clamp duro en los 4 bordes |
| Avance vertical | automático, lo marca el scroll del nivel |
| Disparo | continuo manteniendo Espacio, cooldown 0.2 s |
| Proyectil | 600 px/s hacia arriba |

A 0.2 s de cooldown y 600 px/s coexisten ~6 proyectiles en pantalla, así que no
hace falta un tope artificial de proyectiles.

## Niveles

Objetivo de duración: **150 s por nivel** (2.5 min), dentro del rango de 2-3 min.

| Parámetro | Nivel 1 | Nivel 2 | Nivel 3 |
|---|---|---|---|
| Velocidad de scroll | 90 px/s | 120 px/s | 150 px/s |
| Distancia del nivel | 13.500 px | 18.000 px | 22.500 px |
| Enemigos máx. simultáneos | 3 | 5 | 7 |
| Intervalo de spawn enemigo | 3.0 s | 2.2 s | 1.6 s |
| Velocidad enemigo | 70 px/s | 85 px/s | 100 px/s |
| Movimiento enemigo | solo recta | + horizontal | + ambos |
| Disparo enemigo | cada 1.5 s | cada 1.25 s | cada 1.0 s |
| Proyectil enemigo | 300 px/s hacia abajo | | |
| Velocidad asteroide | 60 px/s | 85 px/s | 110 px/s |
| Spawn asteroide | cada 2.5 s | cada 1.8 s | cada 1.3 s |
| Escombros | no aparecen | grupos de 2-3 | grupos de 3-5 |

El intervalo de disparo enemigo baja 0.25 s por nivel, según lo acordado. La
dificultad sube por velocidad de scroll, cantidad y frecuencia, nunca con sistemas
nuevos (§14).

El Nivel 1 es el único con enemigos estrictamente en línea recta (§9). Los niveles
2 y 3 suman desplazamientos horizontales y perpendiculares.

Los escombros no aparecen en el Nivel 1: §10 solo los menciona para los niveles
2 y 3.

## Vidas y reaparición

| Parámetro | Valor |
|---|---|
| Vidas iniciales | 3, **compartidas entre los tres niveles** |
| Causas de pérdida | choque con asteroide, con escombros, con nave enemiga o disparo enemigo |
| Posición de reaparición | centro-abajo `(240, 540)` |
| Invulnerabilidad | 2 s, con parpadeo |
| Progreso del nivel | **se conserva** |

## Puntuación

| Evento | Puntos |
|---|---|
| Nave enemiga destruida | 100 |
| Avance | 1 cada 10 px |

El recorrido completo de los tres niveles vale ~5.400 pts solo por avance. La
puntuación acumula entre niveles y se muestra en Victoria y en Game Over (§15).

**Récord:** se compara solo dentro de la sesión, sin persistencia en disco.

## Fuera de alcance por ahora

- **Barra de progreso** de §17: decidida como fuera de alcance. No implementar
  salvo pedido explícito.
- **Sprites y audio reales**: los crea el usuario. Hasta entonces, mockups
  provisionales.
- Mejoras de armas, árboles de habilidades, inventarios, multijugador y niveles
  adicionales, según §21.

## Pantallas

Menú principal, Nivel 1, Nivel 2, Nivel 3, Game Over y Victoria (§18). Desde
Game Over se reinicia siempre **desde el Nivel 1** (§12).