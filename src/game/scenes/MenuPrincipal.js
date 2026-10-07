/**
 * Menú principal. §18 — "Permitirá comenzar una partida".
 *
 * API verificada en 4.2.1: `add.text(x, y, texto, estilo)` y
 * `input.keyboard.addKey(codigo)`. El evento `keydown-<TECLA>` se emite una
 * sola vez por pulsación porque `emitOnRepeat` viene en false por default.
 */
import { Scene } from 'phaser';

import { AUDIO, NIVELES, PANTALLA } from '../../config/parametros.js';
import { obtenerEstado } from '../estado/EstadoPartida.js';
import Sonido from '../servicios/Sonido.js';
import Fondo from '../objetos/Fondo.js';
import { esperarTecla } from '../utilidades/teclas.js';

const TITULO = {
    fontFamily: 'monospace',
    fontSize: '38px',
    color: '#5ad1ff'
};

const TEXTO = {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#c8c8d4',
    align: 'center'
};

export default class MenuPrincipal extends Scene {
    constructor() {
        super({ key: 'MenuPrincipal' });
    }

    create() {
        const cx = PANTALLA.ancho / 2;

        // Fondo animado para dar sensación de movimiento (§19).
        this.fondo = new Fondo(this, 40, 0.6);

        this.sonido = new Sonido(this);
        this.sonido.musica(AUDIO.musica.menu, AUDIO.volumen.musicaMenu);

        this.add.text(cx, 170, 'ÚLTIMA', TITULO).setOrigin(0.5);
        this.add.text(cx, 214, 'ÓRBITA', TITULO).setOrigin(0.5);
        this.add.text(cx, 270, 'Misión de evacuación espacial', TEXTO).setOrigin(0.5);

        this.add
            .text(cx, 410, 'PULSA ESPACIO PARA INICIAR', { ...TEXTO, color: '#fff36b' })
            .setOrigin(0.5);

        this.add.text(cx, 500, 'Mover: WASD o flechas', TEXTO).setOrigin(0.5);
        this.add.text(cx, 526, 'Disparar: Espacio', TEXTO).setOrigin(0.5);

        const niveles = [1, 2, 3]
            .map((n) => `${n}. ${NIVELES[n].nombre} — ${describeDificultad(n)}`)
            .join('\n');
        this.add.text(cx, 610, niveles, { ...TEXTO, fontSize: '13px' }).setOrigin(0.5);

        const mejor = obtenerEstado(this).mejorPuntuacion;
        if (mejor > 0) {
            this.add
                .text(cx, 690, `Mejor de la sesión: ${mejor}`, { ...TEXTO, fontSize: '13px' })
                .setOrigin(0.5);
        }

        esperarTecla(this, 'SPACE', () => {
            this.sonido.detenerMusica();
            // §12: una partida nueva arranca en el Nivel 1 con 3 vidas.
            obtenerEstado(this).reiniciar();
            this.scene.start('Nivel1');
        });

        this.events.once('shutdown', () => {
            this.sonido.detenerMusica();
            if (this.fondo) this.fondo.destruir();
        });
    }
}

function describeDificultad(n) {
    return { 1: 'baja', 2: 'media', 3: 'alta' }[n] ?? '';
}