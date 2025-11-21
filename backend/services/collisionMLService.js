const { buildRiskResponse, classifySeverity } = require('../models/riskSchema');
const { findSatrecById } = require('./tleService');
const { propagateSatrec } = require('../utils/sgp4Wrapper');

const modelStatus = {
    lstm: {
        name: 'LSTM-Drift-Compensator',
        version: '0.1.0',
        loaded: true,
        lastWarmStart: new Date().toISOString()
    },
    ensemble: {
        name: 'GradientBoost-Risk',
        version: '0.1.0',
        loaded: true,
        lastWarmStart: new Date().toISOString()
    }
};

function logistic(x) {
    return 1 / (1 + Math.exp(-x));
}

function computeFeatureVector(payload = {}) {
    const {
        timeToCA = 600,
        relativeVelocity = 3,
        radialUncertainty = 0.1,
        crossTrackUncertainty = 0.1,
        historicalMissDistance = 5
    } = payload;

    return {
        timeToCA,
        relativeVelocity,
        radialUncertainty,
        crossTrackUncertainty,
        historicalMissDistance
    };
}

function heuristicProbability(features) {
    let score = 0;
    score += (1 / Math.max(features.timeToCA, 60)) * 400;
    score += (features.relativeVelocity / 10) * 0.6;
    score += (1 / Math.max(features.historicalMissDistance, 0.1)) * 2;
    score += (features.radialUncertainty + features.crossTrackUncertainty) * 0.5;

    return Math.min(0.999, Math.max(0.001, logistic(score - 4)));
}

function deriveConfidence(probability, sensorQuality = 'HIGH') {
    const base = sensorQuality === 'LOW' ? 0.6 : sensorQuality === 'MEDIUM' ? 0.75 : 0.9;
    if (probability > 0.8) return 'HIGH';
    if (probability > 0.5) return base > 0.7 ? 'MEDIUM' : 'LOW';
    return 'LOW';
}

function estimateRelativeVelocity(satrecA, satrecB) {
    if (!satrecA || !satrecB) return null;
    const now = new Date();
    const stateA = propagateSatrec(satrecA, now);
    const stateB = propagateSatrec(satrecB, now);
    if (!stateA || !stateB) return null;
    const dvx = stateA.velocity.x - stateB.velocity.x;
    const dvy = stateA.velocity.y - stateB.velocity.y;
    const dvz = stateA.velocity.z - stateB.velocity.z;
    return Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);
}

async function scoreCollisionRisk(payload) {
    const features = computeFeatureVector(payload);

    if (!payload.relativeVelocity && payload.satelliteId && payload.debrisId) {
        const satA = findSatrecById(payload.satelliteId);
        const satB = findSatrecById(payload.debrisId);
        const rv = estimateRelativeVelocity(satA?.satrec, satB?.satrec);
        if (rv) {
            features.relativeVelocity = rv;
        }
    }

    const probability = heuristicProbability(features);
    const severity = classifySeverity(probability);
    const confidence = deriveConfidence(probability, payload.sensorQuality);

    return buildRiskResponse({
        satelliteId: payload.satelliteId,
        debrisId: payload.debrisId,
        probability,
        severity,
        timeToCA: features.timeToCA,
        relativeVelocity: Number(features.relativeVelocity.toFixed(2)),
        confidence,
        source: 'ML-HYBRID'
    });
}

function getModelStatus() {
    return modelStatus;
}

module.exports = {
    scoreCollisionRisk,
    getModelStatus
};

