/**
 * Helper de teclado.
 *
 * Registra una tecla que se dispara una sola vez por pulsación. El guardián
 * `ejecutado` evita que la acción corra de nuevo mientras la escena sigue
 * viva, y el listener se da de baja en el shutdown para no dejar enganches.
 */
export function esperarTecla(scene, tecla, accion) {
    const manager = scene.input.keyboard;
    let ejecutado = false;

    const alPulsar = () => {
        if (ejecutado) return;
        ejecutado = true;
        accion();
    };

    manager.on(`keydown-${tecla}`, alPulsar);
    scene.events.once('shutdown', () => manager.off(`keydown-${tecla}`, alPulsar));
}