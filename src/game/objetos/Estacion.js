/**
 * Estación espacial: el objetivo de cada nivel.
 *
 * §10: el jugador debe llegar hasta la estación ubicada al final del sector.
 * §13: al llegar a la estación del Nivel 3 se completa la partida.
 * §21: una estación al final de cada nivel, más la estación final.
 *
 * Baja a la velocidad de scroll del nivel, igual que el resto del escenario,
 * para que la estación sea alcanzable esquivando y no saltando el tramo final.
 */
import { ASSETS, PANTALLA } from '../../config/parametros.js';
import { crearSprite } from './sprite.js';

export default class Estacion {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} velocidadScroll velocidad a la que baja la estación
     * @param {boolean} esFinal marca la estación final del Nivel 3 (§13)
     */
    constructor(scene, velocidadScroll, esFinal = false) {
        this.scene = scene;
        this.esFinal = esFinal;

        const ancho = ASSETS.escala.estacion;
        this.sprite = crearSprite(scene, ASSETS.claves.estacion, PANTALLA.ancho / 2, -ancho, ancho);
        this.sprite.setDepth(8);

        this.velocidad = velocidadScroll;
    }

    update(delta) {
        this.sprite.y += this.velocidad * (delta / 1000);
    }

    get x() {
        return this.sprite.x;
    }

    get y() {
        return this.sprite.y;
    }

    destruir() {
        this.sprite.destroy();
    }
}