/**
 * Bootstrap de la aplicación.
 * La configuración del juego vive en src/game/main.js.
 */
import { iniciarJuego } from './game/main.js';

document.addEventListener('DOMContentLoaded', () => {
    // Hook de debug: permite inspeccionar el juego desde la consola del
    // navegador (game.scene, game.textures, etc.). No lo usa el juego.
    window.juego = iniciarJuego('game-container');
});