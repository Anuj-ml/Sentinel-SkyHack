const { propagate } = require('./propagator');
const { COLLISION_THRESHOLD_KM, PREDICTION_WINDOW_HOURS, PREDICTION_STEP_SECONDS } = require('../../../shared/constants');

/**
 * Calculates Euclidean distance between two position vectors.
 */
function getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Predicts conjunctions for a target satellite against a catalog of debris.
 * @param {Object} targetSatRec - Satellite record for the target
 * @param {Array} debrisSatRecs - Array of satellite records for debris
 * @param {Date} startTime - Start time for prediction
 * @returns {Array} List of conjunction events
 */
function predictConjunctions(targetSatRec, debrisSatRecs, startTime = new Date()) {
    const events = [];
    const steps = (PREDICTION_WINDOW_HOURS * 3600) / PREDICTION_STEP_SECONDS;

    // Optimization: Limit steps for the prototype if performance is an issue.
    // 156 hours is a long time for a synchronous loop in a single request.
    // We'll stick to the requested logic but might need to be careful.

    console.log(`Starting collision analysis: ${steps} steps for ${debrisSatRecs.length} debris objects.`);

    for (let i = 0; i < steps; i++) {
        const timeOffset = i * PREDICTION_STEP_SECONDS * 1000;
        const currentTime = new Date(startTime.getTime() + timeOffset);

        // Propagate target
        const targetState = propagate(targetSatRec, currentTime);
        if (!targetState) continue;

        for (let d = 0; d < debrisSatRecs.length; d++) {
            const debrisRec = debrisSatRecs[d];
            const debrisState = propagate(debrisRec, currentTime);

            if (!debrisState) continue;

            const dist = getDistance(targetState.position, debrisState.position);

            if (dist < COLLISION_THRESHOLD_KM) {
                // Check if we already have an event for this debris in this pass (simple de-bouncing)
                // For now, just record everything and we can filter later.
                events.push({
                    debrisId: debrisRec.satnum, // Assuming satnum is available or we add an ID
                    debrisName: debrisRec.name || 'Unknown Debris',
                    time: currentTime,
                    distance: dist,
                    targetPosition: targetState.position,
                    debrisPosition: debrisState.position
                });
            }
        }
    }

    // Post-process: Sort by distance and time
    // Group by debris and find the closest approach per pass?
    // For the prompt: "Return top 10" sorted by min distance.

    // Group by debris ID to find minimum distance per encounter
    const minDistances = {};

    events.forEach(event => {
        const id = event.debrisName; // Use name as ID for now
        if (!minDistances[id] || event.distance < minDistances[id].distance) {
            minDistances[id] = event;
        }
    });

    const sortedEvents = Object.values(minDistances).sort((a, b) => a.distance - b.distance);

    return sortedEvents.slice(0, 10);
}

module.exports = {
    predictConjunctions
};
