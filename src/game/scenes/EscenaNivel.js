/**
 * Escena de nivel. Una sola clase cubre los tres niveles.
 *
 * Se registra tres veces con distinta clave y distinto número (§10, §18), y
 * todo lo que diferencia a un nivel de otro sale de NIVELES en
 * src/config/parametros.js: velocidad, distancia, enemigos, obstáculos y
 * estrategia de movimiento. Agregar un nivel es agregar una entrada de
 * configuración, no una escena nueva.
 *
 * Flujo (§16): nivel → esquivar/disparar/sobrevivir → ¿llegó a la estación?
 * sí → siguiente nivel, o Victoria si era el último.
 */
import { Scene } from 'phaser';

import { AUDIO, NIVELES, PANTALLA } from '../../config/parametros.js';
import { ESTADOS, obtenerEstado } from '../estado/EstadoPartida.js';
import Estacion from '../objetos/Estacion.js';
import Fondo from '../objetos/Fondo.js';
import Generador from '../objetos/Generador.js';
import Nave from '../objetos/Nave.js';
import Proyectiles from '../objetos/Proyectiles.js';
import { seSolapan } from '../objetos/hitbox.js';
import Sonido from '../servicios/Sonido.js';

const PAUSA_POR_MUERTE_MS = 700;

export default class EscenaNivel extends Scene {
    /**
     * @param {object} config { key, nivel }
     */
    constructor(config) {
        super({ key: config.key });
        this.nivelInicial = config.nivel;
        this.nivel = config.nivel;
    }

    // ------------------------------------------------------------------
    // Ciclo de vida
    // ------------------------------------------------------------------

    init(data) {
        this.nivel = data && data.nivel ? data.nivel : this.nivelInicial;
        this.estado = obtenerEstado(this);
        this.estado.nivel = this.nivel;

        this.cfg = NIVELES[this.nivel];
        this.distanciaRecorrida = 0;
        this.ultimoDisparo = 0;
        this.ultimoDisparoEnemigo = 0;
    }

    create() {
        this.fondo = new Fondo(this, this.cfg.velocidadScroll);
        this.nave = new Nave(this, this.estado);
        this.generador = new Generador(this, this.nivel);
        this.proyectiles = new Proyectiles(this);

        // §20: la música de juego arranca en loop y sube de intensidad con la
        // dificultad. Una sola pista para los tres niveles.
        this.sonido = new Sonido(this);
        this.sonido.musica(AUDIO.musica.juego, AUDIO.volumen.musicaJuego[this.nivel]);

        // La estación arranca ARRIBA de la pantalla, fuera de vista. Entra
        // cuando el jugador ya recorrió el sector, y de ahí baja a la
        // velocidad del scroll hasta cruzarse con la nave (§10).
        //
        // OJO: no puede nascer en y = distancia, porque y crece hacia abajo y
        // quedaría por debajo de la pantalla, alejándose del jugador.
        this.estacion = new Estacion(this, this.cfg.velocidadScroll, this.nivel === 3);
        this.estacion.sprite.y = -this.estacion.sprite.displayHeight;
        this.estacion.sprite.setVisible(false);
        this.estacionVisible = false;
        this.mundoCongelado = false;

        this.registrarTeclas();

        this.events.once('shutdown', () => this.limpiar());
    }

    /**
     * §6: WASD y flechas para mover, Espacio para disparar. El resto del
     * código consume direcciones, no teclas, así que el mapa es el único lugar
     * que conoce el control.
     */
    registrarTeclas() {
        const k = this.input.keyboard;

        this.wasd = k.addKeys('W,A,S,D');
        this.flechas = k.createCursorKeys();
        this.espacio = k.addKey('SPACE');
    }

    get direcciones() {
        return {
            arriba: this.wasd.W.isDown || this.flechas.up.isDown,
            abajo: this.wasd.S.isDown || this.flechas.down.isDown,
            izquierda: this.wasd.A.isDown || this.flechas.left.isDown,
            derecha: this.wasd.D.isDown || this.flechas.right.isDown
        };
    }

    // ------------------------------------------------------------------
    // Bucle
    // ------------------------------------------------------------------

    update(time, delta) {
        const dt = delta / 1000;

        // Cuando la estación ya se ve entera, el mundo se congela: el scroll
        // se detiene para que quede claro que ahí termina el nivel y no es un
        // obstáculo más. El jugador sigue moviéndose y tiene que subir a
        // entrar en la estación.
        if (!this.mundoCongelado) {
            this.distanciaRecorrida += this.cfg.velocidadScroll * dt;
            this.estado.sumarAvance(this.cfg.velocidadScroll * dt);
            this.fondo.update(delta);

            // La estación entra en pantalla cuando falta una pantalla entera
            // de recorrido, para que el jugador la encuentre al final.
            if (!this.estacionVisible && this.distanciaRecorrida >= this.cfg.distancia - PANTALLA.alto) {
                this.estacionVisible = true;
                this.estacion.sprite.setVisible(true);
            }
            if (this.estacionVisible) {
                this.estacion.update(delta);
                if (this.estacionTotalmenteVisible()) {
                    this.congelarMundo();
                }
            }
        }

        if (!this.estado.enJuego) return;

        this.nave.mover(this.direcciones, delta);
        this.proyectiles.update(delta);

        // Los obstáculos que ya están en pantalla siguen bajando aunque el
        // mundo esté congelado: se apartan solos y despejan el camino a la
        // estación. Si quedaran inmóviles, uno podría tapar la entrada y el
        // nivel quedaría trabado, porque los obstáculos no se pueden
        // destruir (§8).
        this.generador.mover(delta, time);

        if (!this.mundoCongelado) {
            this.generador.generar(this.distanciaRecorrida);
        }

        this.disparar();
        this.dispararEnemigos(time);
        this.revisarColisiones();
    }

    /**
     * ¿La estación ya entra entera en la pantalla?
     *
     * OJO: el origen del sprite es 0.5, así que sprite.y es el CENTRO. Para
     * saber si entra entera hay que mirar arriba y abajo, no comparar y contra
     * 0. Con el error anterior el mundo se congelaba con la mitad de la
     * estación fuera de la pantalla.
     */
    estacionTotalmenteVisible() {
        const s = this.estacion.sprite;
        const arriba = s.y - s.displayHeight / 2;
        const abajo = s.y + s.displayHeight / 2;
        return arriba >= 0 && abajo <= PANTALLA.alto;
    }

    /**
     * Detiene el mundo y avisa que la estación es el final del nivel.
     * Se congela y no se pausa: la nave sigue respondiendo, así que el
     * jugador sube a entrar en la estación.
     */
    congelarMundo() {
        this.mundoCongelado = true;

        const cx = PANTALLA.ancho / 2;
        this.avisoEstacion = this.add
            .text(cx, 70, '¡ESTACIÓN!  ACERCATE PARA TERMINAR EL NIVEL', {
                fontFamily: 'monospace',
                fontSize: '15px',
                color: '#6ce0ff',
                align: 'center',
                backgroundColor: '#05060fcc',
                padding: { x: 8, y: 5 }
            })
            .setOrigin(0.5, 0.5)
            .setDepth(30);

        // Latido suave para que destaque del fondo.
        this.tweens.add({
            targets: this.avisoEstacion,
            alpha: 0.55,
            duration: 700,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * §7 y decisión del usuario: disparo continuo manteniendo Espacio, con
     * cooldown de 200 ms.
     */
    disparar() {
        if (!this.espacio.isDown) return;
        if (!this.nave.puedeDisparar(this.ultimoDisparo)) return;

        this.ultimoDisparo = this.time.now;
        this.proyectiles.crearJugador(this.nave);
        this.sonido.sfx(AUDIO.sfx.disparoJugador, { volume: AUDIO.volumen.sfx });
    }

    /**
     * §9: los enemigos disparan proyectiles. El intervalo baja 0.25 s por
     * nivel, así que se toma del nivel activo.
     */
    dispararEnemigos(time) {
        if (time - this.ultimoDisparoEnemigo < this.cfg.disparoEnemigoMs) return;

        const candidatos = this.generador.enemigos.filter(
            (e) => e.y > 40 && e.y < PANTALLA.alto - 40
        );
        if (candidatos.length === 0) return;

        this.ultimoDisparoEnemigo = time;
        this.proyectiles.crearEnemigo(candidatos[0]);
        this.sonido.sfx(AUDIO.sfx.disparoEnemigo, { volume: AUDIO.volumen.sfx * 0.7 });
    }

    // ------------------------------------------------------------------
    // Colisiones
    // ------------------------------------------------------------------

    revisarColisiones() {
        this.proyectilesJugadorContraEnemigos();
        this.proyectilesEnemigosContraNave();
        this.enemigosContraNave();
        this.obstaculosContraNave();
        this.naveContraEstacion();
    }

    proyectilesJugadorContraEnemigos() {
        for (const bala of this.proyectiles.delJugador) {
            for (const enemigo of [...this.generador.enemigos]) {
                if (!seSolapan(bala.sprite, enemigo.sprite)) continue;

                this.proyectiles.quitar(bala);
                this.generador.quitarEnemigo(enemigo);
                this.estado.sumarEnemigoDestruido();
                this.sonido.sfx(AUDIO.sfx.enemigoDestruido, { volume: AUDIO.volumen.sfx });
                break;
            }
        }
    }

    proyectilesEnemigosContraNave() {
        if (this.nave.invulnerable) return;

        for (const bala of this.proyectiles.delEnemigo) {
            if (!seSolapan(bala.sprite, this.nave.sprite)) continue;

            this.proyectiles.quitar(bala);
            this.perderVida();
            return;
        }
    }

    enemigosContraNave() {
        if (this.nave.invulnerable) return;

        for (const enemigo of [...this.generador.enemigos]) {
            if (!seSolapan(enemigo.sprite, this.nave.sprite)) continue;

            this.generador.quitarEnemigo(enemigo);
            this.perderVida();
            return;
        }
    }

    /**
     * §8 y §11: los asteroides y los escombros quitan vida, igual que los
     * enemigos. Resuelto con el usuario, que §8 no lo decía.
     */
    obstaculosContraNave() {
        if (this.nave.invulnerable) return;

        for (const obstaculo of this.generador.obstaculos) {
            if (!seSolapan(obstaculo.sprite, this.nave.sprite)) continue;

            this.perderVida();
            return;
        }
    }

    /**
     * §10 y §13: llegar a la estación completa el nivel. La estación no daña
     * al jugador, así que no resta vida.
     */
    naveContraEstacion() {
        if (!seSolapan(this.nave.sprite, this.estacion.sprite)) return;

        this.estado.completarNivel();
        this.sonido.sfx(AUDIO.sfx.estacionAlcanzada, { volume: AUDIO.volumen.sfx });

        if (this.estado.estado === ESTADOS.VICTORIA) {
            this.scene.start('Victoria');
        } else {
            this.estado.avanzarDeNivel();
            this.scene.start(`Nivel${this.estado.nivel}`);
        }
    }

    // ------------------------------------------------------------------
    // Vidas
    // ------------------------------------------------------------------

    /**
     * §11: una vida menos por choque con asteroide, escombro, nave enemiga o
     * disparo enemigo. Las vidas se comparten entre los tres niveles.
     */
    perderVida() {
        if (!this.estado.enJuego) return;

        this.sonido.sfx(AUDIO.sfx.vidaPerdida, { volume: AUDIO.volumen.sfx });
        // §8: el impacto contra un obstáculo tiene su propio efecto.
        this.sonido.sfx(AUDIO.sfx.impacto, { volume: AUDIO.volumen.sfx * 0.8 });

        const sigue = this.estado.perderVida();
        if (!sigue) {
            this.scene.start('GameOver');
            return;
        }

        this.nave.ocultar();
        this.time.delayedCall(PAUSA_POR_MUERTE_MS, () => {
            this.nave.reaparecer();
            this.estado.revivir();
        });
    }

    // ------------------------------------------------------------------
    // Limpieza
    // ------------------------------------------------------------------

    limpiar() {
        if (this.sonido) this.sonido.detenerMusica();
        if (this.avisoEstacion) this.avisoEstacion.destroy();
        if (this.proyectiles) this.proyectiles.destruir();
        if (this.generador) this.generador.limpiar();
        if (this.nave) this.nave.destruir();
        if (this.estacion) this.estacion.destruir();
        if (this.fondo) this.fondo.destruir();
    }
}