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
        .text(cx, y, `PUNTUACIÓN: ${estado.puntuacion}`, {
            ...TEXTO,
            fontSize: '20px',
            color: '#5ad1ff'
        })
        .setOrigin(0.5);

    scene.add
        .text(cx, y + 32, `Mejor de la sesión: ${estado.mejorPuntuacion}`, TEXTO)
        .setOrigin(0.5);

    if (nivel) {
        scene.add
            .text(cx, y + 58, `Alcanzaste: Nivel ${estado.nivel} — ${nivel.nombre}`, TEXTO)
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

        this.add.text(cx, 230, 'GAME OVER', TITULO).setOrigin(0.5);
        this.add.text(cx, 286, 'Sin vidas restantes', TEXTO).setOrigin(0.5);

        mostrarPuntuacion(this, estado, 350);

        this.add
            .text(cx, 540, 'ESPACIO para reiniciar desde el Nivel 1', {
                ...TEXTO,
                color: '#fff36b'
            })
            .setOrigin(0.5);
        this.add.text(cx, 572, 'ESC para volver al menú', TEXTO).setOrigin(0.5);

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

        this.add.text(cx, 190, 'MISIÓN', TITULO).setOrigin(0.5);
        this.add.text(cx, 234, 'COMPLETADA', TITULO).setOrigin(0.5);
        this.add.text(cx, 292, 'Alcanzaste la estación espacial final.', TEXTO).setOrigin(0.5);

        mostrarPuntuacion(this, estado, 360);

        this.add
            .text(cx, 540, 'ESPACIO para volver al menú', { ...TEXTO, color: '#fff36b' })
            .setOrigin(0.5);

        esperarTecla(this, 'SPACE', () => {
            estado.reiniciar();
            this.scene.start('MenuPrincipal');
        });

        this.events.once('shutdown', () => this.fondo.destruir());
    }
}