/**
 * Última Órbita — valores de tuning.
 *
 * Este archivo es la fuente de verdad PARA EL CÓDIGO. El razonamiento detrás de
 * cada valor está en docs/PARAMETROS.md y los requisitos en el GDD (docs/),
 * citados como §N.
 *
 * Los valores son puntos de partida: se ajustan al probar. Cambiar acá, no
 * hardcodear números en las escenas.
 */

export const PANTALLA = {
    ancho: 480,
    alto: 720,
    colorFondo: '#05060f'
};

export const NAVE = {
    // px/s, idéntica en las 4 direcciones.
    velocidad: 260,
    xReaparicion: 240,
    yReaparicion: 540,
    invulnerabilidadMs: 2000,
    cooldownDisparoMs: 200,
    velocidadProyectil: 600,
    pxPorPunto: 10
};

export const VIDAS = {
    // Compartidas entre los tres niveles (§11).
    iniciales: 3
};

export const PUNTUACION = {
    porEnemigo: 100,
    porPxAvance: 1 / 10
};

export const PROYECTIL_ENEMIGO = {
    velocidad: 300
};

/**
 * Intervalos y comportamientos por nivel. §10 y §14.
 *
 * spawn*Ms e intervalo de disparo están en MILISEGUNDOS. El Generador los
 * convierte a píxeles con la velocidad de scroll de cada nivel, así la
 * densidad no depende de la tasa de frames. No comparar estos valores contra
 * distancia directamente.
 */
export const NIVELES = {
    1: {
        nombre: 'Zona de Tránsito',
        velocidadScroll: 90,
        distancia: 8100,
        enemigosMax: 5,
        spawnEnemigoMs: 2000,
        velocidadEnemigo: 70,
        movimientoEnemigo: 'recta',
        disparoEnemigoMs: 1500,
        velocidadAsteroide: 60,
        spawnAsteroideMs: 2800,
        escombros: null,
        spawnEscombrosMs: null
    },
    2: {
        nombre: 'Campo de Escombros',
        velocidadScroll: 120,
        distancia: 10800,
        enemigosMax: 7,
        spawnEnemigoMs: 1500,
        velocidadEnemigo: 85,
        movimientoEnemigo: 'recta+horizontal',
        disparoEnemigoMs: 1250,
        velocidadAsteroide: 85,
        spawnAsteroideMs: 2000,
        escombros: { gruposMin: 2, gruposMax: 3 },
        spawnEscombrosMs: 3000
    },
    3: {
        nombre: 'Última Órbita',
        velocidadScroll: 150,
        distancia: 13500,
        enemigosMax: 9,
        spawnEnemigoMs: 900,
        velocidadEnemigo: 100,
        movimientoEnemigo: 'recta+horizontal+perpendicular',
        disparoEnemigoMs: 1000,
        velocidadAsteroide: 110,
        spawnAsteroideMs: 1560,
        escombros: { gruposMin: 3, gruposMax: 5 },
        spawnEscombrosMs: 2000
    }
};

/**
 * Claves de audio. Los nombres coinciden con los archivos reales de assets/.
 * Si se renombra un archivo, se actualiza acá.
 *
 * §20 pide ocho efectos y una sola música para los tres niveles.
 */
export const AUDIO = {
    sfx: {
        disparoJugador: 'sfx-player-shoot',
        disparoEnemigo: 'sfx-enemy-shoot',
        impacto: 'sfx-impact',
        enemigoDestruido: 'sfx-enemy-destroyed',
        vidaPerdida: 'sfx-life-lost',
        estacionAlcanzada: 'sfx-station-reached',
        victoria: 'sfx-victory',
        gameOver: 'sfx-game-over'
    },
    musica: {
        menu: 'music-menu',
        juego: 'music-game'
    },
    volumen: {
        sfx: 0.6,
        musicaMenu: 0.4,
        musicaJuego: { 1: 0.55, 2: 0.7, 3: 0.85 }
    }
};

/**
 * Rutas de audio dentro de assets/, relativas a la raíz servida.
 */
export const RUTAS_AUDIO = {
    sfx: 'sfx/',
    musica: 'music/'
};

export const ASSETS = {
    /**
     * true  -> Boot genera mockups provisionales en runtime.
     * false -> Boot carga los archivos reales de assets/.
     *
     * Poner en false cuando incorporates los sprites definitivos.
     */
    modoMockup: false,

    /** Claves de textura que espera el juego. */
    claves: {
        nave: 'player',
        enemigo: 'enemy',
        asteroide: 'asteroid',
        escombro: 'debris',
        balaJugador: 'bullet-player',
        balaEnemigo: 'bullet-enemy',
        estacion: 'station',
        estrella: 'star'
    },

    /**
     * Rutas relativas a la raíz servida. assets/ es el publicDir de Vite
     * (ver vite.config.js), así que las carpetas cuelgan de la raíz.
     */
    rutas: {
        sprites: 'sprites/'
    },

    /**
     * Una sola pista para los tres niveles, por decisión del usuario.
     * Ver AUDIO.musica y RUTAS_AUDIO.
     */

    /**
     * Tamaño de display de cada sprite, medido en los PNG reales.
     * Los PNG vienen de 64x64 aunque el dibujo ocupe menos, así que acá se
     * define a qué tamaño se dibujan en pantalla.
     *
     * `estacion` es el ancho con el que se DIBUJA, no el del PNG: el PNG mide
     * 480x200 y con 480 sale del ancho completo de la pantalla. Si se agranda
     * el dibujo, hay que subir este número para que siga cubriendo la pantalla.
     */
    escala: {
        nave: 48,
        enemigo: 48,
        asteroide: 48,
        escombro: 40,
        balaJugador: 10,
        balaEnemigo: 10,
        estacion: 480,
        estrella: 12
    }
};

/**
 * "Jugo" visual: efectos de partículas. Solo lectura de la escena, no
 * cambia la jugabilidad.
 *
 * Duraciones en ms, velocidades en px/s y ángulos en grados con la convención
 * de Phaser: 0 = derecha, 90 = abajo (donde va el escape del jugador), 270 =
 * arriba (donde va el escape del enemigo, que viaja hacia abajo).
 *
 * `escalaInicial`/`escalaFinal` multiplican la textura de la partícula, que
 * mide `texturaLado` px: escala 2 sobre una textura de 12 px son 24 px.
 *
 * Las dos claves no cargan archivos: son texturas generadas en runtime con
 * `Graphics.generateTexture`, igual que los mockups, y se les da color con
 * `tint`. No son parte del contrato con el arte de `assets/`.
 */
export const PARTICULAS = {
    claves: {
        chispa: 'particula-chispa'
    },
    textura: { lado: 12, radio: 4 },

    /**
     * Ráfaga al morir: núcleo de chispas rápidas en el punto exacto (para que
     * se vea DÓNDE murió) + humo lento que queda flotando.
     */
    explosion: {
        nucleo: {
            cantidad: 22,
            velocidadMin: 90,
            velocidadMax: 240,
            vidaMin: 120,
            vidaMax: 380,
            escalaInicial: 1.1,
            escalaFinal: 0
        },
        humo: {
            cantidad: 12,
            velocidadMin: 15,
            velocidadMax: 70,
            vidaMin: 380,
            vidaMax: 780,
            escalaInicial: 0.7,
            escalaFinal: 2.4,
            alphaInicial: 0.42
        },
        tintesEnemigo: [0xfff3b0, 0xffd166, 0xff8a3c, 0xff5030],
        tintesJugador: [0xeafcff, 0x9be7ff, 0x2f8dff, 0xff6d9e]
    },

    /** Llama continua del motor, pegada a la parte de atrás de cada nave. */
    propulsion: {
        intervaloMs: 22,
        vidaMin: 160,
        vidaMax: 340,
        escalaInicial: 1.05,
        escalaFinal: 0,
        jugador: {
            tinte: [0xffd166, 0xff9a3c, 0xfff3b0],
            anguloMin: 68,
            anguloMax: 112,
            velocidadMin: 40,
            velocidadMax: 110,
            separacion: 26
        },
        enemigo: {
            tinte: [0xffb45e, 0xff7a3c],
            anguloMin: 248,
            anguloMax: 292,
            velocidadMin: 40,
            velocidadMax: 100,
            separacion: 26
        }
    },

    /** Estela corta detrás de cada proyectil. */
    estela: {
        vidaMin: 90,
        vidaMax: 170,
        escalaInicial: 0.9,
        escalaFinal: 0,
        velocidadMin: 15,
        velocidadMax: 55,
        separacion: 10,
        jugador: {
            tinte: 0xfff36b,
            anguloMin: 68,
            anguloMax: 112
        },
        enemigo: {
            tinte: 0xff92e6,
            anguloMin: 248,
            anguloMax: 292
        }
    }
};