/**
 * Hitboxes de colisión.
 *
 * El rectángulo de un sprite es la caja completa del PNG, y los sprites del
 * usuario tienen márgenes: el asteroide es una roca redonda dibujada dentro de
 * un cuadro de 64x64. Con la caja completa el jugador recibía daño antes de
 * tocar el dibujo, que es lo que reportó.
 *
 * Cada objeto lleva su hitbox pegada al sprite y `seSolapan` la consulta, así
 * que la forma no hay que pasarla en cada llamada.
 *
 * `factor` indica qué parte del sprite ocupa la hitbox:
 *   - círculo: diámetro = displayWidth * factor
 *   - rectángulo: ancho y alto = display * factor
 */
import { Geom } from 'phaser';

export const HITBOX = {
    // La nave es un triángulo: el círculo la representa bien y perdona los
    // bordes de las alas.
    nave: { forma: 'circulo', factor: 0.3 },

    // La nave enemiga es ancha y con alas puntiagudas.
    enemigo: { forma: 'rect', factor: 0.72 },

    // La roca es redonda, asi que un círculo encaja con el dibujo.
    asteroide: { forma: 'circulo', factor: 0.34 },

    // Los escombros son trozos angulosos con huecos entre ellos.
    escombro: { forma: 'rect', factor: 0.58 },

    // Las balas son chicas y conviene que peguen.
    proyectil: { forma: 'rect', factor: 0.85 },

    // La estación es una estructura grande: generosa, para no pasar de largo.
    estacion: { forma: 'rect', factor: 0.8 }
};

/**
 * Le pega la hitbox a un sprite.
 * @param {Phaser.GameObjects.Image} sprite
 * @param {string} tipo clave de HITBOX
 */
export function aplicarHitbox(sprite, tipo) {
    sprite.hitbox = HITBOX[tipo];
    return sprite;
}

/** Convierte un sprite en la forma con la que se va a colisionar. */
function formaDe(sprite) {
    const h = sprite.hitbox;

    if (!h) {
        return { tipo: 'rect', rect: sprite.getBounds() };
    }

    if (h.forma === 'circulo') {
        return {
            tipo: 'circulo',
            circulo: new Geom.Circle(sprite.x, sprite.y, (sprite.displayWidth * h.factor) / 2)
        };
    }

    const ancho = sprite.displayWidth * h.factor;
    const alto = sprite.displayHeight * h.factor;

    return {
        tipo: 'rect',
        rect: new Geom.Rectangle(sprite.x - ancho / 2, sprite.y - alto / 2, ancho, alto)
    };
}

/**
 * ¿Se solapan a y b? Considera la hitbox de cada uno, no su caja completa.
 * @param {Phaser.GameObjects.Image} a
 * @param {Phaser.GameObjects.Image} b
 */
export function seSolapan(a, b) {
    const fa = formaDe(a);
    const fb = formaDe(b);

    if (fa.tipo === 'circulo' && fb.tipo === 'circulo') {
        return Geom.Intersects.CircleToCircle(fa.circulo, fb.circulo);
    }
    if (fa.tipo === 'circulo') {
        return Geom.Intersects.CircleToRectangle(fa.circulo, fb.rect);
    }
    if (fb.tipo === 'circulo') {
        return Geom.Intersects.CircleToRectangle(fb.circulo, fa.rect);
    }
    return Geom.Intersects.RectangleToRectangle(fa.rect, fb.rect);
}