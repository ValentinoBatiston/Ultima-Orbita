/**
 * Proyectiles del jugador y de los enemigos.
 *
 * No es una Scene: es lógica de juego que la escena del nivel compone y le
 * pasa los sprites que ya administra. Así el nivel mantiene el flujo de §16 sin
 * depender del SceneManager para cada bala.
 *
 * §7: el arma del jugador lanza un proyectil hacia arriba y destruye a los
 * enemigos al contacto.
 * §9: las naves enemigas también disparan proyectiles hacia el jugador.
 */
import { ASSETS, NAVE, PROYECTIL_ENEMIGO } from '../../config/parametros.js';
import { crearSprite } from './sprite.js';

export default class Proyectiles {
    constructor(scene) {
        this.scene = scene;
        this.lista = [];
    }

    /**
     * Crea un proyectil del jugador hacia arriba. §7.
     * El nombre es crear* y no disparar* a propósito: los getters delJugador y
     * delEnemigo de esta clase devuelven las listas, no disparan.
     */
    crearJugador(nave) {
        const sprite = crearSprite(
            this.scene,
            ASSETS.claves.balaJugador,
            nave.sprite.x,
            nave.sprite.y - 20,
            ASSETS.escala.balaJugador
        );
        sprite.setDepth(20);
        this.lista.push({ sprite, vy: -NAVE.velocidadProyectil, delJugador: true });
    }

    /** Crea un proyectil enemigo hacia abajo. §9. */
    crearEnemigo(enemigo) {
        const sprite = crearSprite(
            this.scene,
            ASSETS.claves.balaEnemigo,
            enemigo.sprite.x,
            enemigo.sprite.y + 20,
            ASSETS.escala.balaEnemigo
        );
        sprite.setDepth(15);
        this.lista.push({ sprite, vy: PROYECTIL_ENEMIGO.velocidad, delJugador: false });
    }

    update(delta) {
        const dt = delta / 1000;
        const alto = this.scene.scale.height;

        for (let i = this.lista.length - 1; i >= 0; i--) {
            const p = this.lista[i];
            p.sprite.y += p.vy * dt;

            if (p.sprite.y < -20 || p.sprite.y > alto + 20) {
                this._quitar(i);
            }
        }
    }

    get delJugador() {
        return this.lista.filter((p) => p.delJugador);
    }

    get delEnemigo() {
        return this.lista.filter((p) => !p.delJugador);
    }

    /**
     * Quita un proyectil de la lista y destruye su sprite.
     * @param {object} p el objeto de la lista, no el sprite
     */
    quitar(p) {
        const i = this.lista.indexOf(p);
        if (i !== -1) this._quitar(i);
    }

    _quitar(indice) {
        this.lista[indice].sprite.destroy();
        this.lista.splice(indice, 1);
    }

    destruir() {
        for (const p of this.lista) p.sprite.destroy();
        this.lista = [];
    }
}