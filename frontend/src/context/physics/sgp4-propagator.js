import { twoline2satrec, propagate } from 'satellite.js';

export function buildSatrec(line1, line2) {
    if (!line1 || !line2) return null;
    try {
        return twoline2satrec(line1.trim(), line2.trim());
    } catch (err) {
        console.warn('[sgp4] failed to build satrec', err.message);
        return null;
    }
}

export function propagateSatrec(satrec, date = new Date()) {
    if (!satrec) return null;
    const pv = propagate(satrec, date);
    if (!pv.position) return null;
    return {
        position: pv.position,
        velocity: pv.velocity
    };
}

export function convertToThree(position, scale = 1 / 6371) {
    if (!position) return null;
    return [
        position.x * scale,
        position.z * scale,
        -position.y * scale
    ];
}


