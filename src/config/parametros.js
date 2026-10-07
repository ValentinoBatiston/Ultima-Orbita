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
        distancia: 13500,
        enemigosMax: 5,
        spawnEnemigoMs: 2000,
        velocidadEnemigo: 70,
        movimientoEnemigo: 'recta',
        disparoEnemigoMs: 1500,
        velocidadAsteroide: 60,
        spawnAsteroideMs: 1800,
        escombros: null,
        spawnEscombrosMs: null
    },
    2: {
        nombre: 'Campo de Escombros',
        velocidadScroll: 120,
        distancia: 18000,
        enemigosMax: 7,
        spawnEnemigoMs: 1500,
        velocidadEnemigo: 85,
        movimientoEnemigo: 'recta+horizontal',
        disparoEnemigoMs: 1250,
        velocidadAsteroide: 85,
        spawnAsteroideMs: 1400,
        escombros: { gruposMin: 2, gruposMax: 3 },
        spawnEscombrosMs: 3000
    },
    3: {
        nombre: 'Última Órbita',
        velocidadScroll: 150,
        distancia: 22500,
        enemigosMax: 9,
        spawnEnemigoMs: 900,
        velocidadEnemigo: 100,
        movimientoEnemigo: 'recta+horizontal+perpendicular',
        disparoEnemigoMs: 1000,
        velocidadAsteroide: 110,
        spawnAsteroideMs: 1100,
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
     */
    escala: {
        nave: 48,
        enemigo: 48,
        asteroide: 48,
        escombro: 40,
        balaJugador: 10,
        balaEnemigo: 10,
        estacion: 240,
        estrella: 12
    }
};