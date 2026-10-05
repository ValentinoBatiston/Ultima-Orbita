# AGENTS.md — Última Órbita

## Estado del proyecto

Arcade 2D de scroll vertical (tipo 1942) en Phaser. **Fase de diseño:** el
código todavía no existe.

- Requisitos: `docs/GDD Trabajo final Desarrollo Tecnológico 2 - Valentino Batiston.pdf` (13 págs., 22 secciones). Fuente de verdad.
- Stack: **JavaScript + Phaser 4.2.1** (etiqueta `latest` de npm a 2026-10).
  Phaser 4 **no** es la v3: la API cambió. Verificar contra la documentación
  oficial de Phaser 4 antes de escribir código, no trasladar conocimiento de v3.
- Valores numéricos de tuning y decisiones cerradas: `docs/PARAMETROS.md`.
  No duplicar números entre archivos; cambiarlos ahí.
- Referencia al GDD por número de sección (§N). El PDF no tiene paginación
  impresa y las páginas del archivo no coinciden con nada impreso.

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
- Nave: 260 px/s constantes en las 4 direcciones; no puede salir de `[0,480] x [0,720]`, ni por arriba, ni por abajo, ni por los costados. El avance vertical
  es automático y lo marca el scroll del nivel.
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

**Todavía no hay ningún asset.** El usuario va a crear los sprites en pixel art y
la música, y hasta entonces se usan **mockups provisionales**.

- Poner los mockups en `assets/` con los mismos nombres del destino final, para
  que sean un reemplazo directo.
- Convenciones: `assets/sprites/`, `assets/music/`, `assets/sfx/`.
- **No elegir, crear ni inventar nombres ni rutas de assets sin confirmarlo con
  el usuario.** Preguntar siempre si se quiere mockup o recurso existente.
- Si un archivo esperado no está, pedirlo antes de avanzar con lo que dependa de
  él; seguir con la lógica que no dependa de él.

## Flujo de trabajo

1. Localizar el §N que regula el cambio y citarlo.
2. Clasificar el requisito: definido / parcial / no documentado / en
   contradicción. Si no está en el GDD, es ampliación: **preguntar, no inventar
   la regla.**
3. No asumir que el código cumple el GDD: comparar contra §N.
4. Preservar cambios previos del usuario; no descartarlos ni mezclarlos.
5. **Commit y push solo con autorización explícita.** Sin force push, sin tocar
   hooks ni config, sin mergear. Si un hook falla, se arregla antes de seguir.