/**
 * Configuración del juego Phaser.
 *
 * Notas de API verificadas contra phaser@4.2.1 leyendo el paquete instalado:
 *  - `pixelArt` va en la raíz del config, nunca dentro de `scale`.
 *  - `make.graphics(config, addToScene)`: `add` es posicional y no está
 *    tipado en Options. Usar `make.graphics()` para generar texturas y
 *    `add.graphics()` para dibujar visible.
 *  - `textures.generate(key, config)` ya no existe en Phaser 4, aunque la
 *    página de docs de Textures todavía la muestre.
 *  - Los cambios de escena se encolan y se aplican en el siguiente update del
 *    Scene Manager, no en el instante.
 */
import { AUTO, Game, Scale } from 'phaser';

import { PANTALLA } from '../config/parametros.js';
import Boot from './scenes/Boot.js';
import EscenaNivel from './scenes/EscenaNivel.js';
import HUD from './scenes/HUD.js';
import MenuPrincipal from './scenes/MenuPrincipal.js';
import GameOver, { Victoria } from './scenes/Pantallas.js';

/**
 * Una sola clase de nivel, registrada tres veces. Todo lo que diferencia a un
 * nivel de otro sale de NIVELES en src/config/parametros.js, así que agregar
 * un cuarto nivel sería agregar una entrada, no copiar una escena.
 */
const niveles = [1, 2, 3].map((n) => new EscenaNivel({ key: `Nivel${n}`, nivel: n }));

export function iniciarJuego(parent) {
    return new Game({
        type: AUTO,
        width: PANTALLA.ancho,
        height: PANTALLA.alto,
        parent,
        pixelArt: true,
        backgroundColor: PANTALLA.colorFondo,
        scale: {
            mode: Scale.FIT,
            autoCenter: Scale.CENTER_BOTH
        },
        scene: [Boot, MenuPrincipal, ...niveles, GameOver, Victoria, HUD]
    });
}