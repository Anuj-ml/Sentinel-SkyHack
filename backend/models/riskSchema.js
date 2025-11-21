const SEVERITY_THRESHOLDS = {
    CRITICAL: 0.75,
    HIGH: 0.45,
    MODERATE: 0.2,
    LOW: 0.05
};

function classifySeverity(probability = 0) {
    if (probability >= SEVERITY_THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (probability >= SEVERITY_THRESHOLDS.HIGH) return 'HIGH';
    if (probability >= SEVERITY_THRESHOLDS.MODERATE) return 'MODERATE';
    if (probability >= SEVERITY_THRESHOLDS.LOW) return 'LOW';
    return 'NEGLIGIBLE';
}

function buildRiskResponse(payload) {
    return {
        satelliteId: payload.satelliteId,
        debrisId: payload.debrisId,
        probability: Number(payload.probability.toFixed(3)),
        severity: payload.severity || classifySeverity(payload.probability),
        timeToCA: payload.timeToCA,
        relativeVelocity: payload.relativeVelocity,
        confidence: payload.confidence || 'MEDIUM',
        source: payload.source || 'ML',
        generatedAt: new Date().toISOString()
    };
}

module.exports = {
    SEVERITY_THRESHOLDS,
    classifySeverity,
    buildRiskResponse
};


