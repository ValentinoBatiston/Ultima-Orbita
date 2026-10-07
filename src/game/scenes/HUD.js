/**
 * Interfaz de usuario durante la partida.
 *
 * §17: puntuación, vidas, nivel actual. La barra de progreso de §17 fue
 * dejada fuera de alcance por decisión del usuario, así que no está.
 *
 * Es un observador: se suscribe a los cambios del EstadoPartida y redibuja.
 * No consulta nada del nivel ni de los objetos, solo del estado.
 *
 * Se registra con `active: true` para que permanezca visible mientras cambian
 * las escenas de nivel.
 */
import { Scene } from 'phaser';

import { ESTADOS, obtenerEstado } from '../estado/EstadoPartida.js';

const ESTILO = {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#c8c8d4'
};

/**
 * El HUD se refresca a 10 Hz con su propio update en vez de suscribirse a los
 * cambios de estado. Motivo: sumarAvance() mueve la puntuación en cada frame y
 * notificar eso provocaría 60 emisiones por segundo. 10 Hz es suficiente para
 * una puntuación y deja la interfaz bien desacoplada del bucle del nivel.
 */
const REFRESCO_MS = 100;

export default class HUD extends Scene {
    constructor() {
        super({ key: 'HUD', active: true });
    }

    create() {
        this.estado = obtenerEstado(this);

        const y = 14;

        this.textoNivel = this.add.text(10, y, '', ESTILO);
        this.textoPuntuacion = this.add.text(10, y + 18, '', ESTILO);
        this.textoVidas = this.add.text(10, y + 36, '', ESTILO);

        this.ultimoRefresco = 0;
        this.redibujar();
    }

    update(time) {
        if (time - this.ultimoRefresco < REFRESCO_MS) return;
        this.ultimoRefresco = time;
        this.redibujar();
    }

    redibujar() {
        const e = this.estado;

        this.textoNivel.setText(`NIVEL ${e.nivel}`);
        this.textoPuntuacion.setText(`PUNTOS ${e.puntuacion + e.puntosDelNivel}`);
        this.textoVidas.setText(`VIDAS ${'♥'.repeat(e.vidas)}`);

        // Fade out cuando la partida terminó: el HUD no compite con las
        // pantallas de Victoria o Game Over.
        const terminado = e.estado === ESTADOS.VICTORIA || e.estado === ESTADOS.DERROTA;
        this.textoNivel.setAlpha(terminado ? 0.25 : 1);
        this.textoPuntuacion.setAlpha(terminado ? 0.25 : 1);
        this.textoVidas.setAlpha(terminado ? 0.25 : 1);
    }
}