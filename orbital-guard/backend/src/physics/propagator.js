const satellite = require('satellite.js');
const { GM } = require('../../../shared/constants');

/**
 * Propagates a satellite to a specific time.
 * @param {Object} satRec - Satellite record from satellite.js
 * @param {Date} date - Target date
 * @returns {Object} Position and velocity vectors (km, km/s)
 */
function propagate(satRec, date) {
    const positionAndVelocity = satellite.propagate(satRec, date);
    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    if (!positionEci || !velocityEci) {
        return null; // Error in propagation
    }

    // satellite.js returns position in km, velocity in km/s
    return {
        position: positionEci,
        velocity: velocityEci
    };
}

/**
 * Converts TLE to Satellite Record
 * @param {string} line1 
 * @param {string} line2 
 * @returns {Object} satRec
 */
function getSatRecFromTLE(line1, line2) {
    return satellite.twoline2satrec(line1, line2);
}

module.exports = {
    propagate,
    getSatRecFromTLE
};
