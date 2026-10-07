/**
 * Configuración para la build autónoma: un único archivo HTML con todo
 * adentro, para poder abrir el juego con doble clic sin Node, sin servidor y
 * sin conexión.
 *
 * Diferencias con vite.config.js:
 *  - Sin `manualChunks`: todo el código va en un solo bundle. Si Phaser quedara
 *    en un chunk aparte, el script incrustado conservaría un `import` hacia un
 *    archivo que no existe y el juego no arrancaría.
 *  - `inlineDynamicImports` y `cssCodeSplit: false` por lo mismo: un único JS
 *    y un único CSS que incrustar en el HTML.
 *  - Salida en dist-standalone/, separada del build normal que usa GitHub Pages.
 *
 * El paso que incrusta los sprites y el audio es scripts/embeber.mjs.
 */
import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: 'assets',
    base: './',
    build: {
        outDir: 'dist-standalone',
        cssCodeSplit: false,
        assetsInlineLimit: 100000000,
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        }
    }
});