/**
 * Pantallas de fin de partida: Game Over y Victoria.
 *
 * §18: el juego cuenta con Game Over y Victoria.
 * §12: Game Over muestra la puntuación y permite comenzar una nueva partida
 * desde el Nivel 1.
 * §13: Victoria indica que la misión fue completada y muestra la puntuación.
 * §15: la puntuación final se muestra tanto en Victoria como en Game Over.
 */
import { Scene } from 'phaser';

import { AUDIO, NIVELES, PANTALLA } from '../../config/parametros.js';
import { KEYS } from '../../enums/keys.js';
import { getPhrase } from '../../services/translations.js';
import { obtenerEstado } from '../estado/EstadoPartida.js';
import Sonido from '../servicios/Sonido.js';
import Fondo from '../objetos/Fondo.js';
import { esperarTecla } from '../utilidades/teclas.js';

const TITULO = {
    fontFamily: 'monospace',
    fontSize: '32px',
    color: '#ffffff'
};

const TEXTO = {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#c8c8d4',
    align: 'center'
};

/** Líneas de puntuación que comparten Game Over y Victoria (§15). */
function mostrarPuntuacion(scene, estado, y) {
    const cx = PANTALLA.ancho / 2;
    const nivel = NIVELES[estado.nivel];

    scene.add
        .text(cx, y, `${getPhrase(KEYS.PUNTUACION)} ${estado.puntuacion}`, {
            ...TEXTO,
            fontSize: '20px',
            color: '#5ad1ff'
        })
        .setOrigin(0.5);

    scene.add
        .text(cx, y + 32, `${getPhrase(KEYS.MEJOR_DE_LA_SESION)} ${estado.mejorPuntuacion}`, TEXTO)
        .setOrigin(0.5);

    if (nivel) {
        scene.add
            .text(
                cx,
                y + 58,
                `${getPhrase(KEYS.ALCANZASTE_NIVEL)} ${estado.nivel} — ${nivel.nombre}`,
                TEXTO
            )
            .setOrigin(0.5);
    }
}

export default class GameOver extends Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    create() {
        const cx = PANTALLA.ancho / 2;
        const estado = obtenerEstado(this);

        this.fondo = new Fondo(this, 30, 0.4);
        this.sonido = new Sonido(this);
        this.sonido.sfx(AUDIO.sfx.gameOver);

        this.add.text(cx, 230, getPhrase(KEYS.GAME_OVER), TITULO).setOrigin(0.5);
        this.add.text(cx, 286, getPhrase(KEYS.SIN_VIDAS_RESTANTES), TEXTO).setOrigin(0.5);

        mostrarPuntuacion(this, estado, 350);

        this.add
            .text(cx, 540, getPhrase(KEYS.ESPACIO_PARA_REINICIAR_DESDE_EL_NIVEL_1), {
                ...TEXTO,
                color: '#fff36b'
            })
            .setOrigin(0.5);
        this.add.text(cx, 572, getPhrase(KEYS.ESC_PARA_VOLVER_AL_MENU), TEXTO).setOrigin(0.5);

        esperarTecla(this, 'SPACE', () => {
            // §12: desde Game Over se reinicia siempre en el Nivel 1.
            estado.reiniciar();
            this.scene.start('Nivel1');
        });

        esperarTecla(this, 'ESC', () => {
            estado.reiniciar();
            this.scene.start('MenuPrincipal');
        });

        this.events.once('shutdown', () => this.fondo.destruir());
    }
}

export class Victoria extends Scene {
    constructor() {
        super({ key: 'Victoria' });
    }

    create() {
        const cx = PANTALLA.ancho / 2;
        const estado = obtenerEstado(this);

        this.fondo = new Fondo(this, 30, 0.4);
        this.sonido = new Sonido(this);
        this.sonido.sfx(AUDIO.sfx.victoria);

        this.add.text(cx, 190, getPhrase(KEYS.MISION), TITULO).setOrigin(0.5);
        this.add.text(cx, 234, getPhrase(KEYS.COMPLETADA), TITULO).setOrigin(0.5);
        this.add
            .text(cx, 292, getPhrase(KEYS.ALCANZASTE_LA_ESTACION_ESPACIAL_FINAL), TEXTO)
            .setOrigin(0.5);

        mostrarPuntuacion(this, estado, 360);

        this.add
            .text(cx, 540, getPhrase(KEYS.ESPACIO_PARA_VOLVER_AL_MENU), {
                ...TEXTO,
                color: '#fff36b'
            })
            .setOrigin(0.5);

        esperarTecla(this, 'SPACE', () => {
            estado.reiniciar();
            this.scene.start('MenuPrincipal');
        });

        this.events.once('shutdown', () => this.fondo.destruir());
    }
}