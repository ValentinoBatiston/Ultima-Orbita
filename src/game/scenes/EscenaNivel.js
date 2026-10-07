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
import { seSolapan } from '../objetos/sprite.js';
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

        // La estación arranca por debajo de la distancia del nivel, así que
        // entra en pantalla cuando el jugador ya recorrió el sector (§10).
        this.estacion = new Estacion(this, this.cfg.velocidadScroll, this.nivel === 3);
        this.estacion.sprite.y = this.cfg.distancia;

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

        // El avance y el scroll ocurren siempre, también durante la pausa por
        // muerte: el nivel no se detiene.
        this.distanciaRecorrida += this.cfg.velocidadScroll * dt;
        this.estado.sumarAvance(this.cfg.velocidadScroll * dt);

        this.fondo.update(delta);
        this.estacion.update(delta);

        if (!this.estado.enJuego) return;

        this.nave.mover(this.direcciones, delta);
        this.proyectiles.update(delta);
        this.generador.mover(delta, time);
        this.generador.generar(this.distanciaRecorrida);

        this.disparar();
        this.dispararEnemigos(time);
        this.revisarColisiones();
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
        if (this.proyectiles) this.proyectiles.destruir();
        if (this.generador) this.generador.limpiar();
        if (this.nave) this.nave.destruir();
        if (this.estacion) this.estacion.destruir();
        if (this.fondo) this.fondo.destruir();
    }
}