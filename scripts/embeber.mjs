/**
 * Incrusta el build en un único archivo HTML: ultima-orbita.html
 *
 * El objetivo es que el juego se pueda abrir con doble clic, sin Node, sin
 * servidor local y sin internet. Para eso hay que meter dentro del HTML:
 *   - el CSS
 *   - todo el JavaScript (un solo bundle, ver vite.config.standalone.js)
 *   - cada sprite, sonido y musica como data URI
 *
 * Los assets no los resuelve Vite por su cuenta: el juego los pide con rutas de
 * texto ('sprites/player.png'), no con imports, asi que Vite los copia tal cual.
 * Por eso este script arma el mapa y lo expone en window.__ASSETS_EMBEBIDOS__,
 * que es lo que consulta src/game/utilidades/assets.js.
 *
 * Uso: npm run build:standalone
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ENTRADA = resolve(process.cwd(), 'dist-standalone');
const SALIDA = resolve(process.cwd(), 'ultima-orbita.html');

const MIMES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav'
};

/** Carpetas de assets a incrustar. El .pxo queda afuera: son proyectos de Aseprite. */
const CARPETAS = ['sprites', 'music', 'sfx'];

/**
 * Inserta contenido sin que `String.replace` interprete los patrones `$`.
 *
 * Importante: si el reemplazo se pasa como cadena, el motor trata `$&`, `$'`,
 * `` $` `` y `$1`...`$99` como referencias dentro del texto insertado. El bundle
 * minificado de Phaser está lleno de identificadores así (`$1`, `$i`), así que
 * con reemplazo de texto el JavaScript salía corrupto. Pasar una función
 * desactiva esa interpretación: el contenido entra literal.
 *
 * @param {string} html documento destino
 * @param {string} ancla texto a reemplazar, por ejemplo '</body>'
 * @param {string} contenido lo que va en su lugar
 * @param {string} cierre cierre que se conserva despues del contenido
 */
function insertar(html, ancla, contenido, cierre) {
    return html.replace(ancla, () => contenido + cierre);
}

/**
 * Escapa las etiquetas de cierre HTML que aparezcan dentro del contenido
 * incrustado.
 *
 * Es indispensable: Phaser trae el texto "</body>" dentro del bundle, porque lo
 * usa para armar nodos DOM con innerHTML. Al meter el JS en un <script>, el
 * parser de HTML corta el script en esa aparicion y la etiqueta queda metida en
 * medio de una cadena de JavaScript, lo que produce un
 * "SyntaxError: Unexpected token '<'".
 *
 * Escribir "<\\/" en vez de "</" deja el mismo valor dentro de la cadena de JS y
 * no cierra la etiqueta. Solo se escapan las etiquetas que realmente cierran
 * algo, para no tocar operadores del codigo.
 */
function escaparCierras(texto) {
    return texto.replace(/<\/(script|body|head|html|style|title|div|meta|link)/gi, '<\\/$1');
}

function listar(dir) {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
        const completo = join(dir, entrada.name);
        return entrada.isDirectory() ? listar(completo) : [completo];
    });
}

function aDataUri(archivo) {
    const mime = MIMES[extname(archivo).toLowerCase()] || 'application/octet-stream';
    return `data:${mime};base64,` + readFileSync(archivo).toString('base64');
}

let html = readFileSync(join(ENTRADA, 'index.html'), 'utf8');

// 1. CSS dentro de un <style>, y se quitan los <link> a hojas.
const css = listar(join(ENTRADA, 'assets'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

html = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/g, '');
html = insertar(html, '</head>', `<style>\n${escaparCierras(css)}\n</style>\n`, '</head>');

// 2. JavaScript dentro de un <script>, y se quitan los <script src> y los
//    modulepreload, que apuntan a archivos que dentro del HTML no existen.
//
//    Se emite como script CLASICO, no como modulo, a proposito: un modulo
//    inline puede quedar bloqueado por las politicas de file:// del navegador,
//    mientras que un script clasico siempre se ejecuta. El bundle de esta
//    build no usa sintaxis ESM (nada de import/export/import.meta), asi que
//    corre igual. Si alguna vez el bundle necesitara ESM, el chequeo de abajo
//    corta la build con un mensaje claro en vez de fallar en el navegador.
const js = listar(join(ENTRADA, 'assets'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

const usaESM =
    /(^|[;\s}])export\s*[{]|export\s+(default|const|function|class|let|var)/.test(js) ||
    /(^|[;\s}])import\s*[{*\w][^;\n]*from\s*["']/.test(js) ||
    js.includes('import.meta');

if (usaESM) {
    console.error('El bundle usa sintaxis ESM y no se puede incrustar como script clasico.');
    console.error('Sacar type="module" de este script o cambiar el build.');
    process.exit(1);
}

html = html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '');

// 3. Mapa de assets incrustados. Va antes del codigo para que exista al arrancar.
const mapa = {};
for (const carpeta of CARPETAS) {
    for (const archivo of listar(join(ENTRADA, carpeta))) {
        if (archivo.endsWith('.pxo')) continue;
        const relativa = archivo.slice(ENTRADA.length + 1).replace(/\\/g, '/');
        mapa[relativa] = aDataUri(archivo);
    }
}

const scripts = [
    `<script>window.__ASSETS_EMBEBIDOS__ = ${JSON.stringify(mapa)};</script>`,
    `<script>${escaparCierras(js)}</script>`
].join('\n');

html = insertar(html, '</body>', `${scripts}\n`, '</body>');

writeFileSync(SALIDA, html, 'utf8');

console.log('Listo: ultima-orbita.html (' + (html.length / 1024 / 1024).toFixed(2) + ' MB)');
console.log('  assets incrustados: ' + Object.keys(mapa).length);
console.log('');
console.log('Doble clic en ultima-orbita.html para jugar. No necesita Node ni internet.');