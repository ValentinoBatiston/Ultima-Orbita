/**
 * Fondo espacial con estrellas en movimiento.
 *
 * §19: "el fondo estará compuesto por un espacio oscuro con estrellas y otros
 * elementos que ayuden a generar la sensación de movimiento".
 *
 * Usa la textura `star` del usuario con escala reducida y tres capas de
 * parallax: las estrellas lentas se lejan y dan sensación de profundidad.
 */
import { Math as PhaserMath } from 'phaser';

import { ASSETS, PANTALLA } from '../../config/parametros.js';
import { crearSprite } from './sprite.js';

const CAPAS = [
    { cantidad: 26, factor: 0.4, alpha: 0.35 },
    { cantidad: 18, factor: 0.7, alpha: 0.6 },
    { cantidad: 12, factor: 1.0, alpha: 0.9 }
];

export default class Fondo {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} velocidadScroll velocidad del nivel en px/s
     * @param {number} cantidadFactor 0..1, para que el menú use menos estrellas
     */
    constructor(scene, velocidadScroll, cantidadFactor = 1) {
        this.scene = scene;
        this.velocidad = velocidadScroll;
        this.estrellas = [];

        for (const capa of CAPAS) {
            const n = Math.round(capa.cantidad * cantidadFactor);
            for (let i = 0; i < n; i++) {
                const s = crearSprite(
                    scene,
                    ASSETS.claves.estrella,
                    PhaserMath.Between(0, PANTALLA.ancho),
                    PhaserMath.Between(0, PANTALLA.alto),
                    ASSETS.escala.estrella
                );
                s.setDepth(0);
                s.setAlpha(capa.alpha);
                this.estrellas.push({ sprite: s, factor: capa.factor });
            }
        }
    }

    update(delta) {
        const dt = delta / 1000;
        for (const e of this.estrellas) {
            e.sprite.y += this.velocidad * e.factor * dt;

            if (e.sprite.y > PANTALLA.alto + 10) {
                e.sprite.y = -10;
                e.sprite.x = PhaserMath.Between(0, PANTALLA.ancho);
            }
        }
    }

    destruir() {
        for (const e of this.estrellas) e.sprite.destroy();
        this.estrellas = [];
    }
}