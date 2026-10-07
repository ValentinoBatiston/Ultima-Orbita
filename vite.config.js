import { defineConfig } from 'vite';
import { readdirSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Borra del build los archivos .pxo, que son proyectos de Aseprite. Están
 * ignorados por git pero `publicDir` copia todo assets/ tal cual, así que sin
 * esto terminarían publicados en la página.
 */
function sinArchivosDeEditor() {
    const PATRON = /\.pxo$/i;

    return {
        name: 'sin-archivos-de-editor',
        closeBundle() {
            const salida = resolve(process.cwd(), 'dist');
            for (const archivo of readdirSync(salida, { recursive: true })) {
                if (PATRON.test(archivo)) {
                    unlinkSync(join(salida, archivo));
                }
            }
        }
    };
}

export default defineConfig({
    // Los assets del juego viven en assets/ y Vite los sirve desde la raíz,
    // así que un archivo en assets/sprites/player.png se carga como
    // 'sprites/player.png'. Ver ASSETS.rutas en src/config/parametros.js.
    publicDir: 'assets',
    // Rutas relativas: necesario para que funcione en GitHub Pages, que
    // publica el sitio desde un subdirectorio (/Ultima-Orbita/).
    base: './',
    plugins: [sinArchivosDeEditor()],
    server: {
        port: 8080
    },
    build: {
        rollupOptions: {
            output: {
                // Nombres de archivo ESTABLES, sin hash. Importante: la
                // publicación hace force-push sobre gh-pages, así que los
                // archivos viejos desaparecen en cada deploy. Si el index.html
                // llevara hash y alguien tuviera la versión anterior en caché,
                // pediría un bundle que ya no existe y la página daría 404.
                entryFileNames: 'assets/juego.js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name][extname]',
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    }
});