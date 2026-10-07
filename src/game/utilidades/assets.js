/**
 * Resolución de rutas de assets.
 *
 * El juego normalmente carga los archivos con rutas relativas, por ejemplo
 * 'sprites/player.png'. Eso funciona cuando hay un servidor, pero desde un
 * archivo local abierto con doble clic el navegador bloquea las peticiones a
 * archivos vecinos y el juego no arranca.
 *
 * Por eso la build autónoma define `window.__ASSETS_EMBEBIDOS__`, un mapa de
 * ruta -> data URI. Cuando el mapa existe se usan los datos incrustados; si no,
 * se usa la ruta normal. El resto del juego no necesita saber en que modo esta.
 */

/**
 * Devuelve la ruta a usar para un asset: el data URI si esta incrustado, o la
 * ruta relativa original.
 *
 * @param {string} ruta por ejemplo 'sprites/player.png'
 * @returns {string}
 */
export function urlDeAsset(ruta) {
    const embebidos = globalThis.__ASSETS_EMBEBIDOS__;

    if (embebidos && typeof embebidos[ruta] === 'string') {
        return embebidos[ruta];
    }

    return ruta;
}