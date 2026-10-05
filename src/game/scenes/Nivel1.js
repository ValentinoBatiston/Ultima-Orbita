/**
 * Nivel 1 — PLACEHOLDER.
 *
 * Existe únicamente para que el menú tenga un destino y la app sea ejecutable
 * de punta a punta. El gameplay (movimiento, disparo, spawns, vidas, HUD) NO
 * está implementado.
 *
 * Alcance previsto: §10 (niveles), §11 (vidas), §12/§13 (derrota y victoria),
 * §15 (puntuación), §17 (interfaz, sin barra de progreso por decisión del
 * usuario). Los valores de tuning están en src/config/parametros.js.
 */
import { Scene } from 'phaser';

import { NIVELES, PANTALLA } from '../../config/parametros.js';

export default class Nivel1 extends Scene {
    constructor() {
        super({ key: 'Nivel1' });
    }

    create() {
        const cx = PANTALLA.ancho / 2;
        const nivel = NIVELES[1];

        this.add
            .text(cx, 48, `NIVEL 1 — ${nivel.nombre}`, {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#5ad1ff'
            })
            .setOrigin(0.5);

        this.add
            .text(
                cx,
                PANTALLA.alto / 2,
                'ESCENA PLACEHOLDER\n\nEl gameplay todavía no está implementado.',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#c8c8d4',
                    align: 'center'
                }
            )
            .setOrigin(0.5);

        this.add
            .text(cx, PANTALLA.alto - 48, 'ESC para volver al menú', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#7a7a88'
            })
            .setOrigin(0.5);

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuPrincipal');
        });
    }
}