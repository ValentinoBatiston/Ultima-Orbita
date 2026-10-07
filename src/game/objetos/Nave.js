/**
 * La nave del jugador.
 *
 * §5: la nave avanza automáticamente hacia la parte superior de la pantalla y
 * el jugador controla la posición horizontal y vertical dentro del área
 * disponible.
 * §6: controles WASD o flechas, Espacio para disparar.
 * §11 y decisión del usuario: al perder una vida reaparece en el centro
 * abajo, con 2 s de invulnerabilidad y sin perder el avance del nivel.
 */
import { ASSETS, NAVE, PANTALLA } from '../../config/parametros.js';
import { crearSprite } from './sprite.js';

export default class Nave {
    constructor(scene, estado) {
        this.scene = scene;
        this.estado = estado;

        const ancho = ASSETS.escala.nave;
        this.sprite = crearSprite(scene, ASSETS.claves.nave, NAVE.xReaparicion, NAVE.yReaparicion, ancho);
        this.sprite.setDepth(10);

        this.vida = ancho * 0.6; // hitbox más chica que el sprite
        this.invulnerable = false;
        this.temporizadorInvulnerabilidad = null;
    }

    get x() {
        return this.sprite.x;
    }

    get y() {
        return this.sprite.y;
    }

    /**
 * Movimiento con el patrón Command: cada tecla aporta una dirección y la nave
 * los combina. Normaliza para que la diagonal no sea más rápida, respetando
 * que la velocidad es igual en las 4 direcciones.
 */
    mover(teclas, delta) {
        const dt = delta / 1000;
        let dx = 0;
        let dy = 0;

        if (teclas.izquierda) dx -= 1;
        if (teclas.derecha) dx += 1;
        if (teclas.arriba) dy -= 1;
        if (teclas.abajo) dy += 1;

        if (dx !== 0 || dy !== 0) {
            const largo = Math.hypot(dx, dy);
            this.sprite.x += (dx / largo) * NAVE.velocidad * dt;
            this.sprite.y += (dy / largo) * NAVE.velocidad * dt;
        }

        this.limitar();
    }

    /** Clamp duro a los bordes: §6, la nave no abandona la pantalla. */
    limitar() {
        const margen = this.sprite.displayWidth / 2;
        const minX = margen;
        const maxX = PANTALLA.ancho - margen;
        const minY = margen;
        const maxY = PANTALLA.alto - margen;

        this.sprite.x = Math.max(minX, Math.min(maxX, this.sprite.x));
        this.sprite.y = Math.max(minY, Math.min(maxY, this.sprite.y));
    }

    /**
     * Dispara si pasó el cooldown. §7 y decisión del usuario: continuo
     * manteniendo Espacio, cooldown de 200 ms.
     */
    puedeDisparar(ultimoDisparo) {
        return this.scene.time.now - ultimoDisparo >= NAVE.cooldownDisparoMs;
    }

    /**
     * Reaparición tras perder una vida. No resetea el avance del nivel.
     * Arranca con 2 s de invulnerabilidad.
     */
    reaparecer() {
        this.sprite.setPosition(NAVE.xReaparicion, NAVE.yReaparicion);
        this.sprite.setVisible(true);
        this.activarInvulnerabilidad();
    }

    activarInvulnerabilidad() {
        this.invulnerable = true;
        this.sprite.setAlpha(0.35);

        if (this.temporizadorInvulnerabilidad) {
            this.temporizadorInvulnerabilidad.remove(false);
        }

        this.temporizadorInvulnerabilidad = this.scene.time.addEvent({
            delay: NAVE.invulnerabilidadMs,
            callback: () => {
                this.invulnerable = false;
                this.sprite.setAlpha(1);
            }
        });
    }

    ocultar() {
        this.sprite.setVisible(false);
    }

    destruir() {
        if (this.temporizadorInvulnerabilidad) {
            this.temporizadorInvulnerabilidad.remove(false);
            this.temporizadorInvulnerabilidad = null;
        }
        this.sprite.destroy();
    }
}