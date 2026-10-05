/**
 * Configuración del juego Phaser.
 *
 * Notas de API verificadas contra phaser@4.2.1:
 *  - `pixelArt` va en la raíz del config, nunca dentro de `scale`.
 *  - `make.graphics(config, addToScene)`: el `add` es posicional y no está
 *    tipado en Options. Usar `make.graphics()` para generar texturas y
 *    `add.graphics()` para dibujar visible.
 *  - No usar `textures.generate(key, config)`: se eliminó en Phaser 4 y la
 *    página de docs de Textures todavía la muestra por error.
 */
import { AUTO, Game, Scale } from 'phaser';

import { PANTALLA } from '../config/parametros.js';
import Boot from './scenes/Boot.js';
import MenuPrincipal from './scenes/MenuPrincipal.js';
import Nivel1 from './scenes/Nivel1.js';

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
        scene: [Boot, MenuPrincipal, Nivel1]
    });
}