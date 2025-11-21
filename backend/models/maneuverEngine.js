const { v4: uuid } = require('uuid');

/**
 * Simplified ΔV aware maneuver planner.
 * Uses a heuristic search over radial burns to minimize fuel and risk.
 */
function planAvoidanceManeuver({ satelliteId, threats = [], fuelBudget = 50 }) {
    if (!satelliteId || !threats.length) {
        return {
            satelliteId,
            status: 'NO_ACTION',
            burns: [],
            totalDeltaV: 0,
            notes: 'No actionable threats supplied.'
        };
    }

    const burns = [];
    let totalDeltaV = 0;
    let riskScore = 0;

    threats.forEach((threat, index) => {
        const urgency = Math.max(1, 600 / Math.max(threat.timeToCA || 600, 60));
        const requiredDv = Math.min(0.5, urgency * 0.05 + (threat.probability || 0.5) * 0.2);
        const burn = {
            id: uuid(),
            axis: index % 2 === 0 ? 'RADIAL_OUT' : 'ALONG_TRACK',
            deltaV: Number(requiredDv.toFixed(3)),
            executeIn: Math.max(5, (threat.timeToCA || 600) - 300),
            objective: `Open miss distance vs ${threat.debrisId}`,
            expectedRiskDrop: Number((threat.probability * 0.6).toFixed(2))
        };
        totalDeltaV += burn.deltaV;
        riskScore += burn.expectedRiskDrop;
        burns.push(burn);
    });

    if (totalDeltaV > fuelBudget) {
        const scale = fuelBudget / totalDeltaV;
        burns.forEach((burn) => {
            burn.deltaV = Number((burn.deltaV * scale).toFixed(3));
        });
        totalDeltaV = fuelBudget;
    }

    return {
        satelliteId,
        status: 'PLANNED',
        burns,
        totalDeltaV: Number(totalDeltaV.toFixed(3)),
        expectedRiskReduction: Number(riskScore.toFixed(2))
    };
}

module.exports = {
    planAvoidanceManeuver
};


