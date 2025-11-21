const fs = require('fs');
const path = require('path');

// Real Satellite Names
const REAL_NAMES = [
    "ISS (ZARYA)", "TIANGONG", "HUBBLE ST", "JAMES WEBB", "CHANDRA",
    "SENTINEL-6", "JASON-3", "LANDSAT-9", "LANDSAT-8", "AQUA",
    "TERRA", "SUOMI NPP", "NOAA-20", "NOAA-19", "NOAA-18",
    "METOP-C", "METOP-B", "GOES-18", "GOES-17", "GOES-16",
    "GALILEO-26", "GALILEO-25", "BEIDOU-3", "GLONASS-K", "GPS-III-5",
    "IRIDIUM-100", "IRIDIUM-101", "IRIDIUM-102", "ONEWEB-0156", "ONEWEB-0157",
    "STARLINK-1001", "STARLINK-1002", "STARLINK-1003", "STARLINK-1004", "STARLINK-1005",
    "STARLINK-1006", "STARLINK-1007", "STARLINK-1008", "STARLINK-1009", "STARLINK-1010",
    "COSMOS-2553", "COSMOS-2554", "LUCH-5A", "YAMAL-601", "EXPRESS-AM7",
    "INTELSAT-39", "EUTELSAT-7C", "SES-12", "INMARSAT-5", "VIASAT-2"
];

function getName(index) {
    if (index < REAL_NAMES.length) return REAL_NAMES[index];
    return `SATELLITE-${index}`;
}

const NUM_SATELLITES = 260;
const NUM_DEBRIS = 1500;
const COLLISION_PROBABILITY = 0.18;
const SAT_COLLISION_COUNT = 15; // INCREASED: Multiple satellite-on-satellite collision pairs

const satellites = [];
const debris = [];
const random = (min, max) => Math.random() * (max - min) + min;

// 1. Generate Active Satellites
for (let i = 0; i < NUM_SATELLITES; i++) {
    satellites.push({
        id: `SAT-${i}`,
        name: getName(i),
        type: 'satellite',
        radius: random(6700, 8000),
        inclination: random(0, Math.PI),
        raan: random(0, 2 * Math.PI),
        phase: random(0, 2 * Math.PI),
        speed: 0
    });
}

// 2. Satellite-on-Satellite Collisions (NEW!)
const satCollisionPairs = [];
for (let p = 0; p < SAT_COLLISION_COUNT; p++) {
    // Select two random satellites that aren't already in a collision
    let satA, satB;
    do {
        satA = satellites[Math.floor(random(0, satellites.length))];
        satB = satellites[Math.floor(random(0, satellites.length))];
    } while (satA.id === satB.id || satA.collisionTarget || satB.collisionTarget);

    // Force orbit intersection
    const sharedRadius = (satA.radius + satB.radius) / 2;
    const sharedInclination = (satA.inclination + satB.inclination) / 2;
    const sharedRaan = (satA.raan + satB.raan) / 2;

    satA.radius = sharedRadius;
    satA.inclination = sharedInclination;
    satA.raan = sharedRaan;

    satB.radius = sharedRadius;
    satB.inclination = sharedInclination;
    satB.raan = sharedRaan;

    // Set phases close to each other (imminent collision)
    satA.phase = random(0, 2 * Math.PI);
    satB.phase = satA.phase + random(-0.05, 0.05); // Within 0.05 radians

    // Tag with collision targets
    satA.collisionTarget = satB.id;
    satB.collisionTarget = satA.id;

    satCollisionPairs.push({ satA: satA.id, satB: satB.id });
}

console.log(`Created ${SAT_COLLISION_COUNT} satellite-on-satellite collision scenarios`);

// 3. Stochastic Debris Target Selection
const targetedSatellites = [];
for (const sat of satellites) {
    if (Math.random() < COLLISION_PROBABILITY) {
        targetedSatellites.push(sat);
    }
}

console.log(`Selected ${targetedSatellites.length} satellites to be targeted by debris`);

// 4. Generate Killer Debris with Variable Clusters
let killerDebrisCount = 0;
const debrisNamePrefixes = ['FRAGMENT', 'SHARD', 'CHUNK', 'PIECE', 'PARTICLE', 'REMNANT', 'SEGMENT', 'SPLINTER'];
const debrisOrigins = ['COSMOS', 'FENGYUN', 'IRIDIUM', 'THOR', 'DELTA', 'ARIANE', 'PROTON', 'ATLAS', 'PEGASUS', 'BREEZE'];

for (const target of targetedSatellites) {
    const debrisCount = Math.floor(random(4, 11)); // 4 to 10 debris per satellite (GUARANTEED MULTIPLE!)

    for (let i = 0; i < debrisCount; i++) {
        const isCritical = Math.random() < 0.4; // 40% critical, 60% moderate

        // Generate UNIQUE random debris name (not based on satellite name!)
        const prefix = debrisNamePrefixes[Math.floor(Math.random() * debrisNamePrefixes.length)];
        const origin = debrisOrigins[Math.floor(Math.random() * debrisOrigins.length)];
        const randomId = Math.floor(random(1000, 9999));
        const debrisName = `${prefix}-${origin}-${randomId}`;

        // Realistic distance variation (0.1km to 50km)
        const distance = isCritical ? random(0.1, 5) : random(5, 50); // km

        // Calculate time to collision (based on relative velocity ~14 km/s)
        const relativeVelocity = random(10, 18); // km/s
        const timeToCollision = (distance / relativeVelocity) * 3600; // seconds

        let debrisObj;
        if (isCritical) {
            // CRITICAL: Direct collision
            debrisObj = {
                id: `KILLER-${killerDebrisCount}`,
                name: debrisName,
                type: 'debris',
                isKiller: true,
                targetId: target.id,
                severity: 'CRITICAL',
                radius: target.radius,
                inclination: target.inclination,
                raan: target.raan,
                phase: random(0, 2 * Math.PI),
                speed: 0,
                estimatedDistance: distance,
                timeToCollision: timeToCollision
            };
        } else {
            // MODERATE: Proximity pass
            debrisObj = {
                id: `KILLER-${killerDebrisCount}`,
                name: debrisName,
                type: 'debris',
                isKiller: true,
                targetId: target.id,
                severity: 'MODERATE',
                radius: target.radius + random(-50, 50),
                inclination: target.inclination + random(-0.02, 0.02),
                raan: target.raan + random(-0.01, 0.01),
                phase: random(0, 2 * Math.PI),
                speed: 0,
                estimatedDistance: distance,
                timeToCollision: timeToCollision
            };
        }

        debris.push(debrisObj);
        killerDebrisCount++;
    }
}

console.log(`Generated ${killerDebrisCount} killer debris objects`);

// 5. Background Debris
for (let i = 0; i < NUM_DEBRIS - killerDebrisCount; i++) {
    debris.push({
        id: `DEBRIS-${i}`,
        name: `DEBRIS FRAGMENT ${i}`,
        type: 'debris',
        radius: random(6500, 8500),
        inclination: random(0, Math.PI),
        raan: random(0, 2 * Math.PI),
        phase: random(0, 2 * Math.PI),
        speed: 0
    });
}

// Calculate Speed
const MU = 398600;
[...satellites, ...debris].forEach(obj => {
    obj.speed = Math.sqrt(MU / obj.radius);
    obj.meanMotion = obj.speed / obj.radius;
});

const data = {
    generatedAt: new Date().toISOString(),
    satellites,
    debris,
    metadata: {
        totalSatellites: satellites.length,
        totalDebris: debris.length,
        targetedSatellites: targetedSatellites.length,
        killerDebris: killerDebrisCount,
        backgroundDebris: NUM_DEBRIS - killerDebrisCount,
        collisionProbability: COLLISION_PROBABILITY,
        satelliteCollisionPairs: satCollisionPairs.length
    }
};

const outputPath = path.join(__dirname, '../data/orbitalData.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`✓ Generated ${satellites.length} satellites and ${debris.length} debris objects.`);
console.log(`✓ Satellite-Satellite collisions: ${satCollisionPairs.length} pairs`);
console.log(`✓ Data saved to ${outputPath}`);
