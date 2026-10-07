/**
 * Estado de la partida — patrón State, y Observable para la interfaz.
 *
 * Un único objeto vive en el registro de Phaser y lo comparten todas las
 * escenas, así el HUD y las transiciones ven siempre el mismo dato en vez de
 * llevar copias.
 *
 * Extiende EventEmitter para que el HUD sea reactivo: la escena de nivel
 * muta el estado y notifica, sin que la interfaz sepa quién la cambió.
 *
 * Reglas del GDD que verticaliza este objeto:
 *  - §11: 3 vidas, compartidas entre los tres niveles.
 *  - §12: a 0 vidas, Game Over, y se reinicia desde el Nivel 1.
 *  - §13: victoria al completar los tres niveles.
 *  - §15: la puntuación acumula entre niveles.
 */
import { Events } from 'phaser';

import { NIVELES, PUNTUACION, VIDAS } from '../../config/parametros.js';

/** Clave con la que el estado se guarda en el registro de Phaser. */
export const CLAVE_ESTADO = 'partida';

export const ESTADOS = {
    JUGANDO: 'jugando',
    MURIENDO: 'muriendo',
    NIVEL_CUMPLIDO: 'nivelCumplido',
    VICTORIA: 'victoria',
    DERROTA: 'derrota'
};

/**
 * Devuelve el estado de la partida, creándolo la primera vez.
 * Todas las escenas pasan por acá, así hay una sola fuente de verdad.
 */
export function obtenerEstado(scene) {
    let estado = scene.registry.get(CLAVE_ESTADO);
    if (!estado) {
        estado = new EstadoPartida(scene.registry);
        scene.registry.set(CLAVE_ESTADO, estado);
    }
    return estado;
}

export class EstadoPartida extends Events.EventEmitter {
    constructor(registry) {
        super();
        this.registry = registry;

        /**
         * Récord de la sesión. §15 pide comparar solo dentro de la sesión,
         * así que no se persiste: se reinicia al recargar la página.
         */
        this.mejorPuntuacion = 0;

        this.reiniciar();
    }

    // ------------------------------------------------------------------
    // Ciclo de vida
    // ------------------------------------------------------------------

    /**
     * Empieza una partida nueva desde el Nivel 1 (§12).
     * Conserva el récord de la sesión.
     */
    reiniciar() {
        this.estado = ESTADOS.JUGANDO;
        this.nivel = 1;
        this.vidas = VIDAS.iniciales;
        this.puntuacion = 0;
        this.puntosDelNivel = 0;
        this.distanciaDelNivel = 0;
        this.notificar();
    }

    /**
     * Avanza al siguiente nivel. La puntuación y las vidas no se tocan (§11).
     *
     * OJO: además de sumar los puntos del nivel, hay que volver a JUGANDO. Sin
     * esto el nivel nuevo queda con el estado NIVEL_CUMPLIDO del anterior y
     * update() sale temprano con `if (!enJuego) return`, dejando el juego
     * congelado: sin movimiento, sin colisiones y sin poder completar el
     * nivel.
     */
    avanzarDeNivel() {
        this.nivel += 1;
        this.puntosDelNivel = 0;
        this.distanciaDelNivel = 0;
        this.estado = ESTADOS.JUGANDO;
        this.notificar();
    }

    // ------------------------------------------------------------------
    // Consultas
    // ------------------------------------------------------------------

    get enJuego() {
        return this.estado === ESTADOS.JUGANDO;
    }

    get esUltimoNivel() {
        return this.nivel >= Object.keys(NIVELES).length;
    }

    /** Avance 0..1 del nivel actual. Solo para la barra de progreso opcional. */
    get avanceNivel() {
        const total = NIVELES[this.nivel].distancia;
        return Math.min(1, this.distanciaDelNivel / total);
    }

    // ------------------------------------------------------------------
    // Reglas de juego
    // ------------------------------------------------------------------

    /**
     * Suma puntos por destruir un enemigo (§15). Se acredita al nivel en
     * curso; al completar el nivel pasa al total.
     */
    sumarEnemigoDestruido() {
        this.puntosDelNivel += PUNTUACION.porEnemigo;
        this.notificar();
    }

    /**
     * Suma puntos por avanzar (§15). Se llama con la distancia recorrida en
     * este frame, no píxel a píxel, para no acumular error de redondeo.
     */
    sumarAvance(distanciaPx) {
        const antes = Math.floor(this.distanciaDelNivel / 10);
        this.distanciaDelNivel += distanciaPx;
        this.puntosDelNivel +=
            Math.floor(this.distanciaDelNivel / 10) - antes;
    }

    /**
     * Pierde una vida (§11). Devuelve true si la partida sigue.
     * Las vidas son compartidas: no se renuevan al cambiar de nivel.
     */
    perderVida() {
        this.vidas = Math.max(0, this.vidas - 1);

        if (this.vidas === 0) {
            this.estado = ESTADOS.DERROTA; // §12
            this.cerrarPuntuacion();
            return false;
        }

        this.estado = ESTADOS.MURIENDO;
        this.notificar();
        return true;
    }

    /** La nave reaparece y el nivel continúa (§11). */
    revivir() {
        this.estado = ESTADOS.JUGANDO;
        this.notificar();
    }

    /** El jugador llegó a la estación del nivel. */
    completarNivel() {
        this.estado = this.esUltimoNivel ? ESTADOS.VICTORIA : ESTADOS.NIVEL_CUMPLIDO;
        this.cerrarPuntuacion();
    }

    /** Suma lo pendiente del nivel al total y anota el récord de sesión (§15). */
    cerrarPuntuacion() {
        this.puntuacion += this.puntosDelNivel;
        if (this.puntuacion > this.mejorPuntuacion) {
            this.mejorPuntuacion = this.puntuacion;
        }
        this.notificar();
    }

    /** Avisa a los observadores (HUD) que el estado cambió. */
    notificar() {
        this.emit('cambio', this);
    }
}