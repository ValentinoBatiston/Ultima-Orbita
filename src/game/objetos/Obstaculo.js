/**
 * Obstáculos: asteroides y escombros espaciales.
 *
 * §8: no se pueden destruir, obligan a modificar la trayectoria.
 *   - Asteroides: aparecen en distintas posiciones, bajan y hay que esquivarlos.
 *   - Escombros: restos de otras naves, se mueven como los asteroides pero
 *     pueden aparecer en grupos que obligan a buscar un hueco.
 *
 * §8 no aclara si los escombros quitan vida, pero el usuario lo resolvió: sí,
 * igual que los asteroides.
 */
import { Math as PhaserMath } from 'phaser';

import { ASSETS, NIVELES, PANTALLA } from '../../config/parametros.js';
import { crearSprite } from './sprite.js';

export default class Obstaculo {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} nivel 1..3
     * @param {'asteroide'|'escombro'} tipo
     * @param {number} x
     */
    constructor(scene, nivel, tipo, x) {
        const cfg = NIVELES[nivel];
        this.scene = scene;
        this.tipo = tipo;

        const esAsteroide = tipo === 'asteroide';
        const clave = esAsteroide ? ASSETS.claves.asteroide : ASSETS.claves.escombro;
        const ancho = esAsteroide ? ASSETS.escala.asteroide : ASSETS.escala.escombro;

        this.velocidad = cfg.velocidadAsteroide;
        this.sprite = crearSprite(scene, clave, x, -ancho, ancho);
        this.sprite.setDepth(11);

        // Los escombros giran un poco: son restos sueltos (§8).
        this.rotacion = esAsteroide ? 0 : PhaserMath.FloatBetween(-0.6, 0.6);
    }

    /** Posición aleatoria en X dejando margen para que no nazcan pegados al borde. */
    static xAleatorio(ancho) {
        return PhaserMath.Between(ancho, PANTALLA.ancho - ancho);
    }

    update(delta) {
        this.sprite.y += this.velocidad * (delta / 1000);
        this.sprite.rotation += this.rotacion * (delta / 1000);
    }

    fueraDePantalla() {
        return this.sprite.y > PANTALLA.alto + this.sprite.displayHeight;
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