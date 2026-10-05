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

/** Intervalos y comportamientos por nivel. §10 y §14. */
export const NIVELES = {
    1: {
        nombre: 'Zona de Tránsito',
        velocidadScroll: 90,
        distancia: 13500,
        enemigosMax: 3,
        spawnEnemigoMs: 3000,
        velocidadEnemigo: 70,
        movimientoEnemigo: 'recta',
        disparoEnemigoMs: 1500,
        velocidadAsteroide: 60,
        spawnAsteroideMs: 2500,
        escombros: null
    },
    2: {
        nombre: 'Campo de Escombros',
        velocidadScroll: 120,
        distancia: 18000,
        enemigosMax: 5,
        spawnEnemigoMs: 2200,
        velocidadEnemigo: 85,
        movimientoEnemigo: 'recta+horizontal',
        disparoEnemigoMs: 1250,
        velocidadAsteroide: 85,
        spawnAsteroideMs: 1800,
        escombros: { gruposMin: 2, gruposMax: 3 }
    },
    3: {
        nombre: 'Última Órbita',
        velocidadScroll: 150,
        distancia: 22500,
        enemigosMax: 7,
        spawnEnemigoMs: 1600,
        velocidadEnemigo: 100,
        movimientoEnemigo: 'recta+horizontal+perpendicular',
        disparoEnemigoMs: 1000,
        velocidadAsteroide: 110,
        spawnAsteroideMs: 1300,
        escombros: { gruposMin: 3, gruposMax: 5 }
    }
};

export const ASSETS = {
    /**
     * true  -> Boot genera mockups provisionales en runtime.
     * false -> Boot carga los archivos reales de assets/.
     *
     * Poner en false cuando incorporates los sprites definitivos.
     */
    modoMockup: true,

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
        sprites: 'sprites/',
        musica: 'music/',
        sfx: 'sfx/'
    },

    /** Claves de música por nivel, además del menú. */
    musica: {
        menu: 'music-menu',
        nivel1: 'music-level-1',
        nivel2: 'music-level-2',
        nivel3: 'music-level-3'
    }
};