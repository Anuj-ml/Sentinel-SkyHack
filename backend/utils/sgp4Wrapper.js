const satellite = require('satellite.js');

/**
 * Converts a TLE line pair into a satellite.js satrec.
 * @param {string} line1
 * @param {string} line2
 * @returns {import('satellite.js').SatRec}
 */
function tleToSatrec(line1, line2) {
    return satellite.twoline2satrec(line1, line2);
}

/**
 * Propagates a satellite record to a JavaScript date.
 * @param {import('satellite.js').SatRec} satrec
 * @param {Date} date
 * @returns {{ position: { x:number,y:number,z:number }, velocity: { x:number,y:number,z:number } } | null}
 */
function propagateSatrec(satrec, date = new Date()) {
    const pv = satellite.propagate(satrec, date);
    if (!pv.position || !pv.velocity) {
        return null;
    }

    return {
        position: {
            x: pv.position.x,
            y: pv.position.y,
            z: pv.position.z
        },
        velocity: {
            x: pv.velocity.x,
            y: pv.velocity.y,
            z: pv.velocity.z
        }
    };
}

/**
 * Converts ECI vector magnitudes into km and km/s.
 * Provided for future coordinate transforms (ECI -> ECEF -> Lat/Lon).
 * @param {{ position: {x:number,y:number,z:number} }} stateVector
 * @returns {number}
 */
function vectorMagnitude({ position }) {
    const { x, y, z } = position;
    return Math.sqrt(x * x + y * y + z * z);
}

module.exports = {
    tleToSatrec,
    propagateSatrec,
    vectorMagnitude
};


