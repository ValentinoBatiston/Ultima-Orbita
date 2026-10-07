/**
 * Sonido y música.
 *
 * Los nombres de clave salen de los archivos reales que aportó el usuario en
 * assets/. Ver AUDIO.sfx, AUDIO.musica y AUDIO.volumen en
 * src/config/parametros.js: si un archivo se renombra, se cambia ahí y no acá.
 *
 * §20: efectos de disparo (jugador y enemigo), impacto contra obstáculos,
 * destrucción de enemigos, pérdida de una vida, llegada a una estación,
 * victoria y game over. La música es una sola para los tres niveles y sube de
 * intensidad con la dificultad.
 *
 * API de Phaser 4 verificada en el paquete instalado: `sound.exists()` ya no
 * existe. Para saber si un audio está cargado se consulta `cache.audio.exists()`,
 * que viene de BaseCache.
 */
import { AUDIO } from '../../config/parametros.js';

export default class Sonido {
    /** @param {Phaser.Scene} scene */
    constructor(scene) {
        this.scene = scene;
        this.pistaActual = null;
    }

    /** ¿Está este audio en la caché? */
    tiene(clave) {
        return this.scene.cache.audio.exists(clave);
    }

    /**
     * Toca un efecto. No hace nada si la clave no está cargada: el sonido es
     * accesorio y el juego debe seguir funcionando sin él.
     * @param {string} clave
     * @param {object} config overrides, por ejemplo { volume: 0.3 }
     */
    sfx(clave, config = {}) {
        if (!this.tiene(clave)) return;
        this.scene.sound.play(clave, { volume: AUDIO.volumen.sfx, ...config });
    }

    /**
     * Arranca una pista en loop, reemplazando la anterior.
     *
     * OJO: `sound.add()` solo crea el sonido, no lo reproduce. Hay que llamar
     * a `play()` aparte, si queda mudo.
     *
     * @param {string} clave
     * @param {number} volumen 0..1
     */
    musica(clave, volumen) {
        this.detenerMusica();
        if (!this.tiene(clave)) return;

        this.pistaActual = this.scene.sound.add(clave, { loop: true, volume: volumen });
        this.pistaActual.play();
    }

    /**
     * Sube el volumen de la música con la dificultad del nivel, para que
     * acompañe el aumento de peligro sin necesitar varias pistas (§20).
     * @param {number} nivel 1..3
     */
    ajustarIntensidad(nivel) {
        if (!this.pistaActual) return;
        this.pistaActual.setVolume(AUDIO.volumen.musicaJuego[nivel] ?? 0.55);
    }

    /** Detiene y libera la pista en curso. */
    detenerMusica() {
        if (!this.pistaActual) return;
        this.pistaActual.stop();
        this.pistaActual.destroy();
        this.pistaActual = null;
    }
}