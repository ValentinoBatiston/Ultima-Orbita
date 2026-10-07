/**
 * Generador de obstáculos y enemigos — patrón Factory.
 *
 * Centraliza los intervalos y límites de §9, §10 y §14 en un solo lugar para
 * que la escena de nivel no tenga que conocer las reglas de aparición.
 *
 * §14: la dificultad sube por cantidad y frecuencia de aparición de enemigos y
 * obstáculos, no por sistemas nuevos.
 * §8: los escombros aparecen en grupos que obligan a buscar un hueco.
 * §10: el Nivel 1 es el único sin escombros.
 */
import { Math as PhaserMath } from 'phaser';

import { NIVELES, PANTALLA } from '../../config/parametros.js';
import Enemigo from './Enemigo.js';
import Obstaculo from './Obstaculo.js';

export default class Generador {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} nivel 1..3
     */
    constructor(scene, nivel) {
        this.scene = scene;
        this.nivel = nivel;
        this.cfg = NIVELES[nivel];
        this.enemigos = [];
        this.obstaculos = [];

        // La aparición se mide por DISTANCIA recorrida y no por tiempo, para
        // que la densidad no cambie con la tasa de frames.
        //
        // OJO: los intervalos de la configuración están en milisegundos, así
        // que hay que convertirlos a píxeles con la velocidad de scroll de este
        // nivel. Sin esta conversión se comparan milisegundos contra píxeles y
        // el intervalo se va de 3 s a 33 s.
        const aPx = (ms) => (this.cfg.velocidadScroll * ms) / 1000;

        this.distanciaEntreEnemigos = aPx(this.cfg.spawnEnemigoMs);
        this.distanciaEntreAsteroides = aPx(this.cfg.spawnAsteroideMs);
        this.distanciaEntreEscombros = aPx(this.cfg.spawnEscombrosMs);

        this.proximoEnemigo = 0;
        this.proximoAsteroide = 0;
        this.proximoEscombros = this.cfg.escombros ? 0 : Infinity;
    }

    get enemigosVivos() {
        return this.enemigos.length;
    }

    /**
     * Decide qué hay que crear en este frame según la distancia recorrida.
     * Devuelve lo creado para que la escena lo use si necesita reconfigurar
     * los temporizadores de disparo de los enemigos nuevos.
     */
    generar(distanciaRecorrida) {
        const nuevosEnemigos = [];
        const nuevosObstaculos = [];

        if (this.enemigos.length < this.cfg.enemigosMax && distanciaRecorrida >= this.proximoEnemigo) {
            nuevosEnemigos.push(new Enemigo(this.scene, this.nivel));
            this.proximoEnemigo += this.distanciaEntreEnemigos;
        }

        if (distanciaRecorrida >= this.proximoAsteroide) {
            nuevosObstaculos.push(
                new Obstaculo(this.scene, this.nivel, 'asteroide', Obstaculo.xAleatorio(40))
            );
            this.proximoAsteroide += this.distanciaEntreAsteroides;
        }

        const cfgEscombros = this.cfg.escombros;
        if (cfgEscombros && distanciaRecorrida >= this.proximoEscombros) {
            const cantidad = PhaserMath.Between(cfgEscombros.gruposMin, cfgEscombros.gruposMax);
            const xBase = Obstaculo.xAleatorio(40);

            for (let i = 0; i < cantidad; i++) {
                // Se colocan cerca unas de otras para obligar a buscar un hueco (§8).
                const x = Math.min(PANTALLA.ancho - 24, Math.max(24, xBase + PhaserMath.Between(-36, 36)));
                nuevosObstaculos.push(new Obstaculo(this.scene, this.nivel, 'escombro', x));
            }
            this.proximoEscombros += this.distanciaEntreEscombros;
        }

        this.enemigos.push(...nuevosEnemigos);
        this.obstaculos.push(...nuevosObstaculos);

        return { nuevosEnemigos, nuevosObstaculos };
    }

    /** Mueve todo lo que está en pantalla y retira lo que ya salió. */
    mover(delta, tiempo) {
        for (const e of this.enemigos) e.update(delta, tiempo);
        for (const o of this.obstaculos) o.update(delta);

        this.enemigos = this.enemigos.filter((e) => {
            if (e.fueraDePantalla()) {
                e.destruir();
                return false;
            }
            return true;
        });

        this.obstaculos = this.obstaculos.filter((o) => {
            if (o.fueraDePantalla()) {
                o.destruir();
                return false;
            }
            return true;
        });
    }

    /** Quita un enemigo de la lista y destruye su sprite. */
    quitarEnemigo(enemigo) {
        const i = this.enemigos.indexOf(enemigo);
        if (i !== -1) {
            this.enemigos.splice(i, 1);
            enemigo.destruir();
        }
    }

    /** Vacia enemigos y obstáculos. */
    limpiar() {
        for (const e of this.enemigos) e.destruir();
        for (const o of this.obstaculos) o.destruir();
        this.enemigos = [];
        this.obstaculos = [];
    }
}