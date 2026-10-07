/**
 * Escena de arranque: carga los assets y pasa al menú.
 *
 * API de Phaser 4 verificada leyendo el paquete instalado:
 *  - `textures.generate(clave, config)` ya NO existe en v4, aunque la página de
 *    docs de Textures todavía lo muestre. Para generar texturas en runtime se
 *    usa `Graphics.generateTexture(clave, ancho, alto)`.
 *  - `make.graphics(config, addToScene)`: `add` es posicional. `make.graphics()`
 *    genera texturas sin dejar nada dibujado; `add.graphics()` dibuja visible.
 *
 * Para el audio se usa `this.load.audio(clave, url)` con la misma mecánica de
 * caché que las imágenes: una vez cargado, `scene.sound.exists(clave)`.
 */
import { Scene } from 'phaser';

import { ASSETS, AUDIO, RUTAS_AUDIO } from '../../config/parametros.js';
import { urlDeAsset } from '../utilidades/assets.js';

export default class Boot extends Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    create() {
        this.cargarSprites();
        this.cargarAudio();

        this.load.once('complete', () => {
            if (ASSETS.modoMockup) {
                this.generarMockups();
            }
            this.scene.start('MenuPrincipal');
        });

        this.load.start();
    }

    /**
     * Los sprites reales están en assets/sprites/. Con ASSETS.modoMockup en
     * true se sustituyen por figuras simples generadas en runtime.
     */
    cargarSprites() {
        const base = ASSETS.rutas.sprites;
        const k = ASSETS.claves;

        const sprites = {
            [k.nave]: 'player.png',
            [k.enemigo]: 'enemy.png',
            [k.asteroide]: 'asteroid.png',
            [k.escombro]: 'debris.png',
            [k.balaJugador]: 'bullet-player.png',
            [k.balaEnemigo]: 'bullet-enemy.png',
            [k.estacion]: 'station.png',
            [k.estrella]: 'star.png'
        };

        for (const [clave, archivo] of Object.entries(sprites)) {
            this.load.image(clave, urlDeAsset(`${base}${archivo}`));
        }
    }

    /**
     * §20: los ocho efectos y las dos pistas de música.
     * Las claves viven en AUDIO para no repetirlas en el código.
     */
    cargarAudio() {
        const base = RUTAS_AUDIO;

        const sfx = {
            [AUDIO.sfx.disparoJugador]: 'sfx-player-shoot.wav',
            [AUDIO.sfx.disparoEnemigo]: 'sfx-enemy-shoot.wav',
            [AUDIO.sfx.impacto]: 'sfx-impact.wav',
            [AUDIO.sfx.enemigoDestruido]: 'sfx-enemy-destroyed.wav',
            [AUDIO.sfx.vidaPerdida]: 'sfx-life-lost.wav',
            [AUDIO.sfx.estacionAlcanzada]: 'sfx-station-reached.wav',
            [AUDIO.sfx.victoria]: 'sfx-victory.mp3',
            [AUDIO.sfx.gameOver]: 'sfx-game-over.wav'
        };

        for (const [clave, archivo] of Object.entries(sfx)) {
            this.load.audio(clave, urlDeAsset(`${base.sfx}${archivo}`));
        }

        this.load.audio(AUDIO.musica.menu, urlDeAsset(`${base.musica}music-menu.mp3`));
        this.load.audio(AUDIO.musica.juego, urlDeAsset(`${base.musica}music-game.mp3`));
    }

    /**
     * Mockups provisionales: siluetas blocky de un color, no son el arte
     * final. Solo se generan con ASSETS.modoMockup en true, para poder
     * desarrollar sin los sprites reales. Las claves coinciden con las de
     * ASSETS.claves, así que el reemplazo es directo.
     */
    generarMockups() {
        const k = ASSETS.claves;

        // Nave del jugador: proa arriba.
        this.mockup(k.nave, 32, 32, (g) => {
            g.fillStyle(0x2b7fd4, 1);
            g.fillRect(12, 2, 8, 8);
            g.fillRect(6, 10, 20, 8);
            g.fillRect(2, 18, 28, 6);
            g.fillStyle(0x5ad1ff, 1);
            g.fillRect(12, 18, 8, 14);
        });

        // Nave enemiga: proa abajo.
        this.mockup(k.enemigo, 32, 32, (g) => {
            g.fillStyle(0x8e2440, 1);
            g.fillRect(8, 4, 16, 8);
            g.fillRect(4, 12, 24, 8);
            g.fillStyle(0xd94a5c, 1);
            g.fillRect(8, 20, 16, 12);
        });

        // Asteroide.
        this.mockup(k.asteroide, 32, 32, (g) => {
            g.fillStyle(0x6b6b78, 1);
            g.fillRect(8, 0, 16, 4);
            g.fillRect(2, 4, 28, 24);
            g.fillRect(8, 28, 16, 4);
        });

        // Escombro.
        this.mockup(k.escombro, 32, 32, (g) => {
            g.fillStyle(0x55555f, 1);
            g.fillRect(4, 8, 16, 16);
            g.fillRect(16, 20, 12, 8);
        });

        // Proyectiles.
        this.mockup(k.balaJugador, 8, 16, (g) => {
            g.fillStyle(0xfff36b, 1);
            g.fillRect(0, 0, 8, 16);
        });
        this.mockup(k.balaEnemigo, 8, 16, (g) => {
            g.fillStyle(0xff5ce0, 1);
            g.fillRect(0, 0, 8, 16);
        });

        // Estación.
        this.mockup(k.estacion, 96, 64, (g) => {
            g.fillStyle(0x8d94a6, 1);
            g.fillRect(8, 20, 80, 24);
            g.fillRect(36, 0, 24, 20);
            g.fillRect(36, 44, 24, 20);
        });

        // Estrella.
        this.mockup(k.estrella, 8, 8, (g) => {
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, 8, 8);
        });
    }

    /**
     * Dibuja una figura con rectángulos y la convierte en textura.
     * Solo usa fillStyle/fillRect, confirmados en 4.2.1.
     */
    mockup(clave, ancho, alto, dibujar) {
        const g = this.make.graphics({ x: 0, y: 0 });
        dibujar(g);
        g.generateTexture(clave, ancho, alto);
        g.destroy();
    }
}