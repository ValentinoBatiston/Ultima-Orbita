import { defineConfig } from 'vite';

export default defineConfig({
    // Los assets del juego viven en assets/ y Vite los sirve desde la raíz,
    // así que un archivo en assets/sprites/player.png se carga como
    // 'sprites/player.png'. Ver ASSETS.rutas en src/config/parametros.js.
    publicDir: 'assets',
    base: './',
    server: {
        port: 8080
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    }
});