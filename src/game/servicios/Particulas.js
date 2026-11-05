/**
 * Servicio de partículas — el "jugo" visual del juego (§19 pide pulido).
 *
 * Tres efectos, todos de solo lectura de la jugabilidad:
 *   1. Explosión al morir algo: un núcleo de chispas rápidas en el punto
 *      exacto (para que quede claro DÓNDE murió) más humo lento que queda
 *      flotando un momento.
 *   2. Propulsión: llama continua detrás de cada nave, que sube si la nave va
 *      para abajo (jugador) o baja si va para arriba (enemigo).
 *   3. Estela: chispita corta detrás de cada proyectil.
 *
 * API verificada en 4.2.1 leyendo node_modules/phaser/src:
 *   - `scene.add.particles(x, y, textura, config)` devuelve un
 *     ParticleEmitter que se actualiza solo (está en el updateList, línea 957
 *     de ParticleEmitter.js).
 *   - `emitter.explode(cantidad, x, y)` tira una ráfaga única y no repite
 *     (frecuencia -1). Un emisor sirve para todas las explosiones.
 *   - `emitter.emitParticleAt(x, y)` emite una partícula puntual para las
 *     estelas y la propulsión de los enemigos, que van cambiando de lugar.
 *   - `emitting` se chequea en cada preUpdate, así que apagarlo y prenderlo
 *     detiene y reanuda el chorrito (válido al ocultar/reaparecer la nave).
 *   - Filtrado de colores: `tint` acepta una lista y elige una al azar por
 *     partícula (EmitterOp hace random sobre Array, línea 510).
 */
import { PARTICULAS } from '../../config/parametros.js';

export default class Particulas {
    /** @param {Phaser.Scene} scene */
    constructor(scene) {
        this.scene = scene;
        this.emisores = [];

        this.generarTextura();
        this.crearEmisores();
    }

    /**
     * La textura es un círculo blanco que se le pinta después con `tint`.
     * Generada en runtime igual que los mockups de Boot: no carga archivos y
     * no es parte del contrato con assets/.
     */
    generarTextura() {
        const clave = PARTICULAS.claves.chispa;
        if (this.scene.textures.exists(clave)) return;

        const { lado, radio } = PARTICULAS.textura;
        const g = this.scene.make.graphics({ x: 0, y: 0 });
        g.fillStyle(0xffffff, 1);
        g.fillCircle(lado / 2, lado / 2, radio);
        g.generateTexture(clave, lado, lado);
        g.destroy();
    }

    crearEmisores() {
        const e = PARTICULAS.explosion;
        const p = PARTICULAS.propulsion;
        const t = PARTICULAS.estela;

        // Explosiones: dos emisores compartidos, núcleo con chispas y humo.
        // El núcleo va en blend ADD para que resalte sobre el fondo oscuro;
        // el humo con blend normal para que se lea como humo, no como luz.
        this.chispasEnemigo = this.crearChispas(e.nucleo, e.tintesEnemigo);
        this.chispasJugador = this.crearChispas(e.nucleo, e.tintesJugador);
        this.humoEnemigo = this.crearHumo(e.humo, e.tintesEnemigo);
        this.humoJugador = this.crearHumo(e.humo, e.tintesJugador);

        // Propulsión del jugador: emisor continuo que la escena recoloca cada
        // frame sobre la nave.
        this.propulsorJugador = this.crearPropulsor(p.jugador);

        // La propulsión y las estelas de enemigos y proyectiles emiten manual,
        // uno por entidad, porque cambian de lugar todo el tiempo.
        this.propulsorEnemigo = this.crearPropulsorManual(p.enemigo);
        this.estelaJugador = this.crearEstela(t.jugador);
        this.estelaEnemigo = this.crearEstela(t.enemigo);
    }

    /** Ráfaga rápida en blend ADD. */
    crearChispas(cmd, tintes) {
        return this.registrar(
            this.scene.add.particles(0, 0, PARTICULAS.claves.chispa, {
                emitting: false,
                quantity: 1,
                speed: { min: cmd.velocidadMin, max: cmd.velocidadMax },
                angle: { min: 0, max: 360 },
                lifespan: { min: cmd.vidaMin, max: cmd.vidaMax },
                scale: { start: cmd.escalaInicial, end: cmd.escalaFinal },
                alpha: { start: 1, end: 0 },
                tint: tintes,
                blendMode: 'ADD'
            })
        );
    }

    /** Humo lento: chispa más grande que crece y se desvanece. */
    crearHumo(cmd, tintes) {
        return this.registrar(
            this.scene.add.particles(0, 0, PARTICULAS.claves.chispa, {
                emitting: false,
                quantity: 1,
                speed: { min: cmd.velocidadMin, max: cmd.velocidadMax },
                angle: { min: 0, max: 360 },
                lifespan: { min: cmd.vidaMin, max: cmd.vidaMax },
                scale: { start: cmd.escalaInicial, end: cmd.escalaFinal },
                alpha: { start: cmd.alphaInicial, end: 0 },
                tint: tintes,
                blendMode: 'SCREEN'
            })
        );
    }

    /** Chorro continuo de motor, del color del escape. */
    crearPropulsor(cmd) {
        return this.registrar(
            this.scene.add.particles(0, 0, PARTICULAS.claves.chispa, {
                frequency: PARTICULAS.propulsion.intervaloMs,
                quantity: 1,
                speed: { min: cmd.velocidadMin, max: cmd.velocidadMax },
                angle: { min: cmd.anguloMin, max: cmd.anguloMax },
                lifespan: { min: PARTICULAS.propulsion.vidaMin, max: PARTICULAS.propulsion.vidaMax },
                scale: { start: PARTICULAS.propulsion.escalaInicial, end: PARTICULAS.propulsion.escalaFinal },
                alpha: { start: 1, end: 0 },
                tint: cmd.tinte,
                blendMode: 'ADD'
            })
        );
    }

    /** Emisor para emitir a mano; no tiene intervalo. */
    crearPropulsorManual(cmd) {
        return this.registrar(
            this.scene.add.particles(0, 0, PARTICULAS.claves.chispa, {
                emitting: false,
                quantity: 1,
                speed: { min: cmd.velocidadMin, max: cmd.velocidadMax },
                angle: { min: cmd.anguloMin, max: cmd.anguloMax },
                lifespan: { min: PARTICULAS.propulsion.vidaMin, max: PARTICULAS.propulsion.vidaMax },
                scale: { start: PARTICULAS.propulsion.escalaInicial, end: PARTICULAS.propulsion.escalaFinal },
                alpha: { start: 1, end: 0 },
                tint: cmd.tinte,
                blendMode: 'ADD'
            })
        );
    }

    /** Estela chiquita en blend normal, para que no compita con la nave. */
    crearEstela(cmd) {
        return this.registrar(
            this.scene.add.particles(0, 0, PARTICULAS.claves.chispa, {
                emitting: false,
                quantity: 1,
                speed: { min: PARTICULAS.estela.velocidadMin, max: PARTICULAS.estela.velocidadMax },
                angle: { min: cmd.anguloMin, max: cmd.anguloMax },
                lifespan: { min: PARTICULAS.estela.vidaMin, max: PARTICULAS.estela.vidaMax },
                scale: { start: PARTICULAS.estela.escalaInicial, end: PARTICULAS.estela.escalaFinal },
                alpha: { start: 0.9, end: 0 },
                tint: cmd.tinte,
                blendMode: 'ADD'
            })
        );
    }

    registrar(emisor) {
        this.emisores.push(emisor);
        return emisor;
    }

    // ------------------------------------------------------------------
    // API para la escena
    // ------------------------------------------------------------------

    /**
     * Ráfaga donde murió algo. `tipo` es 'enemigo' o 'jugador', y cada
     * identidad tiene su paleta.
     *
     * Si el servicio ya fue destruido (la escena cambió de nivel, apagada por
     * Game Over, en el mismo frame que la última colisión), no explota nada:
     * no hay nada a la vista.
     */
    explosion(x, y, tipo) {
        const muerto = tipo === 'jugador' ? this.chispasJugador : this.chispasEnemigo;
        const humo = tipo === 'jugador' ? this.humoJugador : this.humoEnemigo;
        if (!muerto || !humo) return;
        const e = PARTICULAS.explosion;

        muerto.explode(e.nucleo.cantidad, x, y);
        humo.explode(e.humo.cantidad, x, y);
    }

    /**
     * Llama cada frame con la nave. Recoloca el emisor sobre el escape y lo
     * apaga si la nave está oculta (por ejemplo, entre la muerte y el
     * reaparecer), así que el chorrito no queda suelto en el aire.
     */
    propulsionJugador(nave) {
        if (!this.propulsorJugador) return;
        const cmd = PARTICULAS.propulsion.jugador;
        this.propulsorJugador.setPosition(nave.x, nave.y + cmd.separacion);
        this.propulsorJugador.emitting = nave.visible;
    }

    /** Una sola chispa atrás de un enemigo. La escena la llama por enemigo. */
    propulsionEnemigo(x, y) {
        if (!this.propulsorEnemigo) return;
        const cmd = PARTICULAS.propulsion.enemigo;
        this.propulsorEnemigo.emitParticleAt(x, y - cmd.separacion);
    }

    /** Chispita atrás de un proyectil. La escena la llama por bala. */
    estelaDeProyectil(x, y, delJugador) {
        const emisor = delJugador ? this.estelaJugador : this.estelaEnemigo;
        if (!emisor) return;
        const separacion = PARTICULAS.estela.separacion;
        emisor.emitParticleAt(x, delJugador ? y + separacion : y - separacion);
    }

    /**
     * Destruye los emisores y deja las referencias en null, para que ni la
     * escena ni un update tardío emitan en un emisor ya apagado.
     */
    destruir() {
        for (const emisor of this.emisores) emisor.destroy();
        this.emisores = [];
        this.chispasEnemigo = null;
        this.chispasJugador = null;
        this.humoEnemigo = null;
        this.humoJugador = null;
        this.propulsorJugador = null;
        this.propulsorEnemigo = null;
        this.estelaJugador = null;
        this.estelaEnemigo = null;
    }
}
