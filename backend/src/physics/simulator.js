const { EARTH_RADIUS_KM, COLLISION_THRESHOLD_KM } = require('../../../shared/constants');

function toRadians(deg) {
    return (deg * Math.PI) / 180;
}

function propagateCircularOrbit(orbitDefinition, timeSeconds = 0) {
    const altitude = orbitDefinition.altitude || 550;
    const inclination = toRadians(orbitDefinition.inclination || 53);
    const r = EARTH_RADIUS_KM + altitude;
    const mu = 398600.4418;
    const angularVelocity = Math.sqrt(mu / Math.pow(r, 3));
    const theta = angularVelocity * timeSeconds + toRadians(orbitDefinition.raan || 0);

    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta) * Math.cos(inclination);
    const z = r * Math.sin(theta) * Math.sin(inclination);

    return { x, y, z };
}

function distance(a, b) {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2) +
        Math.pow(a.z - b.z, 2)
    );
}

function runSandboxScenario({ mode = 'SIMULATION', satellites = [], durationMinutes = 60, stepSeconds = 60 }) {
    const steps = Math.max(5, Math.floor((durationMinutes * 60) / stepSeconds));
    const frames = [];
    const events = [];

    for (let i = 0; i < steps; i++) {
        const time = i * stepSeconds;
        const positions = satellites.map((sat) => ({
            id: sat.id || sat.name || `SIM-${i}`,
            name: sat.name || `Sim-${i}`,
            position: propagateCircularOrbit(sat, time)
        }));

        frames.push({ time, positions });

        // Collision detection per frame
        for (let a = 0; a < positions.length; a++) {
            for (let b = a + 1; b < positions.length; b++) {
                const dist = distance(positions[a].position, positions[b].position);
                if (dist <= (satellites[a].collisionRadius || COLLISION_THRESHOLD_KM)) {
                    events.push({
                        type: 'CONJUNCTION',
                        time,
                        distance: Number(dist.toFixed(2)),
                        actors: [positions[a].id, positions[b].id]
                    });
                }
            }
        }
    }

    return {
        mode,
        frames,
        events,
        summary: {
            durationMinutes,
            steps,
            satellites: satellites.length,
            conjunctions: events.length
        }
    };
}

module.exports = {
    runSandboxScenario
};


