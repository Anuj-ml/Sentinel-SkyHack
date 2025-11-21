const { tleToSatrec } = require('./sgp4Wrapper');

/**
 * Normalizes a raw TLE record.
 * Supports CelesTrak JSON entries and Space-Track CSV style payloads.
 * @param {object} raw
 * @returns {object|null}
 */
function normalizeTLE(raw) {
    if (!raw) return null;

    const name = raw.OBJECT_NAME || raw.name || raw.satellite || raw.objectName;
    const line1 = raw.TLE_LINE1 || raw.line1 || raw.tle1;
    const line2 = raw.TLE_LINE2 || raw.line2 || raw.tle2;

    if (!line1 || !line2) {
        return null;
    }

    const satrec = tleToSatrec(line1.trim(), line2.trim());

    return {
        satId: raw.NORAD_CAT_ID || raw.satId || raw.scc || raw.catalogNumber || satrec.satnum,
        name: name || `SAT-${satrec.satnum}`,
        line1: line1.trim(),
        line2: line2.trim(),
        epoch: raw.EPOCH || raw.epoch || satrec.jdsatepoch,
        source: raw.source || 'CELESTRAK',
        satrec
    };
}

/**
 * Format state vector payload for the frontend.
 * @param {object} normalized
 * @param {{position:{x:number,y:number,z:number},velocity:{x:number,y:number,z:number}}} stateVector
 */
function formatForClient(normalized, stateVector) {
    if (!normalized || !stateVector) return null;
    return {
        id: normalized.satId,
        name: normalized.name,
        line1: normalized.line1,
        line2: normalized.line2,
        epoch: normalized.epoch,
        source: normalized.source,
        position: stateVector.position,
        velocity: stateVector.velocity,
        type: 'SATELLITE'
    };
}

module.exports = {
    normalizeTLE,
    formatForClient
};

