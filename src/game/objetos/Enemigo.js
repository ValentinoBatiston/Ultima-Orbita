/**
 * Naves enemigas.
 *
 * §9: aparecen desde la parte superior y se desplazan hacia el jugador.
 * Pueden moverse en línea recta y disparar proyectiles. La cantidad y
 * frecuencia aumenta progresivamente en cada nivel.
 * §10: en el Nivel 1 los patrones son sencillos; los niveles 2 y 3 suman
 * movimiento horizontal y perpendicular.
 *
 * Aquí vive el patrón Strategy para el movimiento: cada nivel elige una
 * estrategia distinta en vez de acumular condicionales sobre el tipo de enemigo.
 */
import { Math as PhaserMath } from 'phaser';

import { ASSETS, NIVELES, PANTALLA } from '../../config/parametros.js';
import { crearSprite } from './sprite.js';

// -------------------------------------------------------------- estrategias

/**
 * §9 y decisión del usuario: en el Nivel 1 los enemigos solo se mueven en
 * línea recta. Bajan en vertical constante.
 */
function moverRecto(enemigo, delta) {
    enemigo.sprite.y += enemigo.velocidad * (delta / 1000);
}

/**
 * Niveles 2+: suma deriva horizontal. Usa una senoide para que el enemigo
 * zigzaguee de forma suave, sin cambiar de dirección de golpe.
 */
function moverHorizontal(enemigo, delta, tiempo) {
    moverRecto(enemigo, delta);
    const ancho = enemigo.sprite.displayWidth;
    const rango = PANTALLA.ancho - ancho - 8;
    enemigo.sprite.x = 8 + ancho / 2 + ((Math.sin(tiempo / 700) + 1) / 2) * rango;
}

/**
 * Nivel 3: vertical, horizontal y un vaivén más aggressive en X. Cada enemigo
 * arranca con una fase distinta para que no se muevan todos igual.
 */
function moverPerpendicular(enemigo, delta, tiempo) {
    moverRecto(enemigo, delta);
    const ancho = enemigo.sprite.displayWidth;
    const rango = PANTALLA.ancho - ancho - 8;
    const fase = enemigo.fase + tiempo / 900;
    enemigo.sprite.x = 8 + ancho / 2 + ((Math.sin(fase) + 1) / 2) * rango;
}

/** Estrategia de movimiento vigente según el nivel (§10). */
const ESTRATEGIAS = {
    recta: moverRecto,
    'recta+horizontal': moverHorizontal,
    'recta+horizontal+perpendicular': moverPerpendicular
};

// ------------------------------------------------------------------ entidad

let contadorId = 0;

export default class Enemigo {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} nivel 1..3: decide velocidad y estrategia de movimiento
     */
    constructor(scene, nivel) {
        const cfg = NIVELES[nivel];
        this.scene = scene;
        this.nivel = nivel;
        this.id = contadorId++;
        this.fase = (this.id % 7) * 0.9;
        this.velocidad = cfg.velocidadEnemigo;
        this.estrategia = ESTRATEGIAS[cfg.movimientoEnemigo];

        const ancho = ASSETS.escala.enemigo;
        const x = PhaserMath.Between(ancho, PANTALLA.ancho - ancho);
        this.sprite = crearSprite(scene, ASSETS.claves.enemigo, x, -ancho, ancho);
        this.sprite.setDepth(12);
    }

    update(delta, tiempo) {
        this.estrategia(this, delta, tiempo);
    }

    /** Salió por abajo: ya no amenaza, se retira sin puntos. */
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