/**
 * Menú principal. §18 — "Permitirá comenzar una partida".
 *
 * API verificada en 4.2.1: `add.text(x, y, texto, estilo)` y
 * `input.keyboard.on('keydown-<TECLA>', cb)`. El evento se emite una sola vez
 * por pulsación porque `emitOnRepeat` viene en false por default.
 */
import { Scene } from 'phaser';

import { NIVELES, PANTALLA } from '../../config/parametros.js';

const TITULO = {
    fontFamily: 'monospace',
    fontSize: '38px',
    color: '#5ad1ff'
};

const TEXTO = {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#c8c8d4'
};

export default class MenuPrincipal extends Scene {
    constructor() {
        super({ key: 'MenuPrincipal' });
    }

    create() {
        const cx = PANTALLA.ancho / 2;

        this.add.text(cx, 180, 'ÚLTIMA', TITULO).setOrigin(0.5);
        this.add.text(cx, 224, 'ÓRBITA', TITULO).setOrigin(0.5);
        this.add.text(cx, 280, 'Misión de evacuación espacial', TEXTO).setOrigin(0.5);

        this.add
            .text(cx, 420, 'PULSA ESPACIO PARA INICIAR', { ...TEXTO, color: '#fff36b' })
            .setOrigin(0.5);

        this.add.text(cx, 520, 'Mover: WASD o flechas', TEXTO).setOrigin(0.5);
        this.add.text(cx, 548, 'Disparar: Espacio', TEXTO).setOrigin(0.5);

        const niveles = [1, 2, 3].map((n) => `${n}. ${NIVELES[n].nombre}`).join('\n');
        this.add.text(cx, 620, niveles, TEXTO).setOrigin(0.5);

        let saliendo = false;
        const iniciar = () => {
            if (saliendo) return;
            saliendo = true;
            this.scene.start('Nivel1');
        };

        this.input.keyboard.on('keydown-SPACE', iniciar);
        this.input.keyboard.on('keydown-ENTER', iniciar);
    }
}