/**
 * Menú principal. §18 — "Permitirá comenzar una partida".
 *
 * API verificada en 4.2.1: `add.text(x, y, texto, estilo)` y
 * `input.keyboard.addKey(codigo)`. El evento `keydown-<TECLA>` se emite una
 * sola vez por pulsación porque `emitOnRepeat` viene en false por default.
 *
 * Selector de idioma (Traducila): dos textos clickeables, cada uno con el
 * nombre propio del idioma, que NO se traducen — así el jugador sabe siempre
 * a cuál le tiene que hacer click. Al cambiar, se espera la respuesta de
 * Traducila antes de re-resolver los textos: nada se actualiza con un fetch
 * en curso.
 */
import { Scene } from 'phaser';

import { AUDIO, PANTALLA } from '../../config/parametros.js';
import { EN, ES } from '../../enums/languages.js';
import { KEYS } from '../../enums/keys.js';
import { getPhrase, getTranslations } from '../../services/translations.js';
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

const IDIOMA_ACTIVO = '#fff36b';
const IDIOMA_INACTIVO = '#555b66';

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

        // El idioma de la sesión lo dejó cargado Boot y viaja en el registro,
        // que es la misma puerta por la que entra EstadoPartida.
        this.idioma = this.registry.get('idioma') ?? ES;

        // Todo texto visible del menú guarda la función que lo resuelve:
        // al cambiar de idioma se re-resuelve con getPhrase y se actualiza
        // con setText, sin recargar la escena.
        this.textos = [];

        this.texto(cx, 170, () => getPhrase(KEYS.ULTIMA), TITULO);
        this.texto(cx, 214, () => getPhrase(KEYS.ORBITA), TITULO);
        this.texto(cx, 270, () => getPhrase(KEYS.MISION_DE_EVACUACION_ESPACIAL), TEXTO);

        this.texto(cx, 410, () => getPhrase(KEYS.PULSA_ESPACIO_PARA_INICIAR), {
            ...TEXTO,
            color: '#fff36b'
        });

        this.texto(cx, 500, () => getPhrase(KEYS.MOVER_WASD_O_FLECHAS), TEXTO);
        this.texto(cx, 526, () => getPhrase(KEYS.DISPARAR_ESPACIO), TEXTO);

        // Los tres sectores con su dificultad, tal como están cargados en
        // Traducila.
        this.texto(cx, 610, () => (
            [KEYS.TEXT_1_ZONA_DE_TRANSITO_BAJA, KEYS.TEXT_2_CAMPO_DE_ESCOMBROS_MEDIA, KEYS.TEXT_3_ULTIMA_ORBITA_ALTA]
                .map((clave) => getPhrase(clave))
                .join('\n')
        ), { ...TEXTO, fontSize: '13px' });

        const mejor = obtenerEstado(this).mejorPuntuacion;
        if (mejor > 0) {
            this.texto(cx, 690, () => `${getPhrase(KEYS.MEJOR_DE_LA_SESION)} ${mejor}`, {
                ...TEXTO,
                fontSize: '13px'
            });
        }

        this.crearSelectorIdioma();

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

    /**
     * Crea un texto visible y guarda cómo se resuelve, para que el cambio de
     * idioma lo actualice con setText sin recargar la escena.
     */
    texto(x, y, resolver, estilo) {
        const t = this.add
            .text(x, y, resolver(), estilo)
            .setOrigin(0.5);
        this.textos.push({ t, resolver });
        return t;
    }

    /** Dos labels clickeables, uno por idioma. Los nombres van sin traducir. */
    crearSelectorIdioma() {
        const cx = PANTALLA.ancho / 2;
        const y = 648;

        this.subrayadoIdioma = this.add
            .text(cx, y - 15, 'IDIOMA / LANGUAGE', {
                ...TEXTO,
                fontSize: '11px',
                color: IDIOMA_INACTIVO
            })
            .setOrigin(0.5);

        this.botonEspañol = this.add
            .text(cx - 34, y, 'Español', { ...TEXTO, fontSize: '13px' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => this.cambiarIdioma(ES));

        this.separadorIdioma = this.add
            .text(cx, y, '|', { ...TEXTO, fontSize: '13px', color: IDIOMA_INACTIVO })
            .setOrigin(0.5);

        this.botonIngles = this.add
            .text(cx + 34, y, 'English', { ...TEXTO, fontSize: '13px' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => this.cambiarIdioma(EN));

        this.actualizarSelector();
    }

    /** Idioma actual en color activo, el otro apagado. */
    actualizarSelector() {
        const activo = (t) => t.setColor(IDIOMA_ACTIVO);
        const inactivo = (t) => t.setColor(IDIOMA_INACTIVO);

        if (this.idioma === ES) {
            activo(this.botonEspañol);
            inactivo(this.botonIngles);
        } else {
            activo(this.botonIngles);
            inactivo(this.botonEspañol);
        }
    }

    /**
     * Cambia el idioma: primero se espera la respuesta de Traducila (el
     * oficial getTranslations no es síncrona) y recién entonces se
     * re-resuelven los textos.
     */
    async cambiarIdioma(destino) {
        if (destino === this.idioma) return;

        this.idioma = destino;
        this.registry.set('idioma', destino);
        await getTranslations(destino);

        for (const { t, resolver } of this.textos) {
            t.setText(resolver());
        }
        this.actualizarSelector();
    }
}
