/**
 * Helper para crear sprites con un tamaño de pantalla concreto.
 *
 * Los PNG del usuario tienen tamaños dispares (64x64 para naves, 8x15 para
 * proyectiles, 480x200 para la estación), así que se escalan de forma uniforme
 * a partir del ancho y se conserva la proporción original.
 */
import { Geom } from 'phaser';

/**
 * @param {Phaser.Scene} scene
 * @param {string} clave clave de textura
 * @param {number} x
 * @param {number} y
 * @param {number} anchoObjetivo ancho en píxeles de pantalla
 */
export function crearSprite(scene, clave, x, y, anchoObjetivo) {
    const sprite = scene.add.image(x, y, clave);
    sprite.setScale(anchoObjetivo / sprite.width);
    sprite.setOrigin(0.5, 0.5);
    return sprite;
}

/**
 * Rectángulo de solapamiento entre dos sprites.
 *
 * `getBounds()` devuelve un rectángulo reutilizado del GameObject: hay que
 * consumirlo en el momento, no guardarlo en una variable entre iteraciones.
 */
export function seSolapan(a, b) {
    return Geom.Intersects.RectangleToRectangle(a.getBounds(), b.getBounds());
}