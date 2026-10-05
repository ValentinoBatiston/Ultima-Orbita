/**
 * Escena de arranque.
 *
 * Genera las texturas que el juego necesita. Como todavía no hay assets, crea
 * MOCKUPS PROVISIONALES: siluetas blocky de un color, no son el arte final.
 *
 * En cuanto incorpores los sprites reales poné ASSETS.modoMockup en false en
 * src/config/parametros.js y esta escena los cargará desde assets/.
 *
 * API: en Phaser 4 `textures.generate()` ya no existe. La forma vigente es
 * `Graphics.generateTexture(clave, ancho, alto)`, y después hay que destruir el
 * Graphics para que no quede dibujado en pantalla.
 */
import { Scene } from 'phaser';

import { ASSETS } from '../../config/parametros.js';

export default class Boot extends Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    create() {
        if (ASSETS.modoMockup) {
            this.generarMockups();
            this.scene.start('MenuPrincipal');
        } else {
            this.cargarAssetsReales();
        }
    }

    /**
     * Dibuja una figura con rectángulos y la convierte en textura.
     * Solo usa fillStyle/fillRect: son los métodos confirmados en 4.2.1.
     */
    mockup(clave, ancho, alto, dibujar) {
        const g = this.make.graphics({ x: 0, y: 0 });
        dibujar(g);
        g.generateTexture(clave, ancho, alto);
        g.destroy();
    }

    generarMockups() {
        const k = ASSETS.claves;

        // Nave del jugador, 24x32, proa hacia arriba.
        this.mockup(k.nave, 24, 32, (g) => {
            g.fillStyle(0x2b7fd4, 1);
            g.fillRect(8, 2, 8, 6);
            g.fillRect(4, 8, 16, 8);
            g.fillRect(0, 14, 24, 6);
            g.fillStyle(0x5ad1ff, 1);
            g.fillRect(8, 14, 8, 18);
            g.fillStyle(0xffffff, 1);
            g.fillRect(11, 18, 2, 14);
        });

        // Nave enemiga, 24x28, proa hacia abajo.
        this.mockup(k.enemigo, 24, 28, (g) => {
            g.fillStyle(0x8e2440, 1);
            g.fillRect(6, 2, 12, 6);
            g.fillRect(2, 8, 20, 8);
            g.fillStyle(0xd94a5c, 1);
            g.fillRect(6, 16, 12, 12);
        });

        // Asteroide, 24x24.
        this.mockup(k.asteroide, 24, 24, (g) => {
            g.fillStyle(0x6b6b78, 1);
            g.fillRect(6, 0, 12, 4);
            g.fillRect(2, 4, 20, 16);
            g.fillRect(6, 20, 12, 4);
            g.fillStyle(0x4a4a55, 1);
            g.fillRect(8, 8, 4, 4);
            g.fillRect(14, 12, 4, 4);
        });

        // Escombro espacial, 16x16.
        this.mockup(k.escombro, 16, 16, (g) => {
            g.fillStyle(0x55555f, 1);
            g.fillRect(2, 4, 8, 8);
            g.fillRect(8, 10, 6, 4);
        });

        // Proyectiles, 4x10.
        this.mockup(k.balaJugador, 4, 10, (g) => {
            g.fillStyle(0xfff36b, 1);
            g.fillRect(0, 0, 4, 10);
        });

        this.mockup(k.balaEnemigo, 4, 10, (g) => {
            g.fillStyle(0xff5ce0, 1);
            g.fillRect(0, 0, 4, 10);
        });

        // Estación espacial, 96x64.
        this.mockup(k.estacion, 96, 64, (g) => {
            g.fillStyle(0x8d94a6, 1);
            g.fillRect(8, 20, 80, 24);
            g.fillRect(36, 0, 24, 20);
            g.fillRect(36, 44, 24, 20);
            g.fillStyle(0x3d4457, 1);
            g.fillRect(0, 26, 12, 12);
            g.fillRect(84, 26, 12, 12);
            g.fillStyle(0x6ce0ff, 1);
            g.fillRect(42, 26, 12, 12);
        });

        // Estrella de fondo, 2x2.
        this.mockup(k.estrella, 2, 2, (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, 2, 2);
        });
    }

    /** Placeholder: se completa cuando existan los archivos en assets/. */
    cargarAssetsReales() {
        const { sprites } = ASSETS.rutas;
        const k = ASSETS.claves;

        this.load.image(k.nave, `${sprites}player.png`);
        this.load.image(k.enemigo, `${sprites}enemy.png`);
        this.load.image(k.asteroide, `${sprites}asteroid.png`);
        this.load.image(k.escombro, `${sprites}debris.png`);
        this.load.image(k.balaJugador, `${sprites}bullet-player.png`);
        this.load.image(k.balaEnemigo, `${sprites}bullet-enemy.png`);
        this.load.image(k.estacion, `${sprites}station.png`);
        this.load.image(k.estrella, `${sprites}star.png`);

        this.load.once('complete', () => {
            this.scene.start('MenuPrincipal');
        });

        this.load.start();
    }
}