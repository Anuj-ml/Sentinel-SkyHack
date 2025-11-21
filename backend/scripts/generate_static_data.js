const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URLs
const STARLINK_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle';
const GPS_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle';
const SCIENCE_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=science&FORMAT=tle';
const DEBRIS_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=tle';

// Helpers
function parseTLE(data, type) {
    const lines = data.split('\n');
    const result = [];
    for (let i = 0; i < lines.length; i += 3) {
        if (lines[i] && lines[i + 1] && lines[i + 2]) {
            result.push({
                name: lines[i].trim(),
                line1: lines[i + 1].trim(),
                line2: lines[i + 2].trim(),
                type: type
            });
        }
    }
    return result;
}

// TLE Manipulation for Killer Debris
function createKillerDebris(targetSat, index) {
    // Clone the satellite
    const debris = { ...targetSat };
    debris.name = `KILLER DEBRIS ${index}`;
    debris.type = 'debris';

    // Parse Line 2 to find Mean Anomaly (Chars 43-51 in 0-indexed string, usually fields 7)
    // Standard TLE Format Line 2:
    // 2 NNNNN III.IIII RRR.RRRR EEEEEEE PPP.PPPP MMM.MMMM NN.NNNNNNNNRRRRR
    // We want to change MMM.MMMM (Mean Anomaly) slightly to put it on the same path but different position.

    // Simple string manipulation:
    // Let's just shift the Mean Anomaly by adding 5 degrees.
    // This is tricky with string parsing. 
    // Alternative: Just use the same TLE but change the name. 
    // If they have the EXACT same TLE, they are on top of each other (Collision!).
    // If we want them to collide *soon*, we need them to be close.
    // Let's just change the ID (field 2) and Checksum to avoid parser errors?
    // satellite.js doesn't validate checksums strictly.

    // Let's try to modify the Mean Anomaly (characters 43-51).
    let line2 = debris.line2;
    const meanAnomalyStr = line2.substring(43, 51);
    let meanAnomaly = parseFloat(meanAnomalyStr);

    // Shift by 0.1 degree (very close!)
    meanAnomaly = (meanAnomaly + 0.1) % 360;

    // Format back to string XXX.XXXX
    let newMaStr = meanAnomaly.toFixed(4).padStart(8, '0');
    if (newMaStr.length > 8) newMaStr = newMaStr.substring(0, 8); // Safety

    // Reconstruct Line 2
    debris.line2 = line2.substring(0, 43) + newMaStr + line2.substring(51);

    return debris;
}

async function generate() {
    console.log('Fetching datasets...');

    try {
        const [starlinkRes, gpsRes, scienceRes, debrisRes] = await Promise.all([
            axios.get(STARLINK_URL),
            axios.get(GPS_URL),
            axios.get(SCIENCE_URL),
            axios.get(DEBRIS_URL)
        ]);

        let satellites = [
            ...parseTLE(gpsRes.data, 'satellite'), // ~30 GPS
            ...parseTLE(scienceRes.data, 'satellite'), // ~100 Science
            ...parseTLE(starlinkRes.data, 'satellite') // Thousands
        ];

        // 1. Limit to exactly 260 satellites
        // Prioritize GPS and Science, fill rest with Starlink
        satellites = satellites.slice(0, 260);
        console.log(`Selected ${satellites.length} active satellites.`);

        // 2. Generate Killer Debris
        // Pick 50 random targets
        const targets = [];
        const killerDebris = [];
        const usedIndices = new Set();

        while (targets.length < 50) {
            const idx = Math.floor(Math.random() * satellites.length);
            if (!usedIndices.has(idx)) {
                usedIndices.add(idx);
                targets.push(satellites[idx]);
                killerDebris.push(createKillerDebris(satellites[idx], targets.length));
            }
        }
        console.log(`Generated ${killerDebris.length} killer debris objects.`);

        // 3. Fill remaining debris to reach 1500 total
        // We have 50 killer debris. Need 1450 more.
        let backgroundDebris = parseTLE(debrisRes.data, 'debris');

        // If we don't have enough real debris, duplicate/mock them
        while (backgroundDebris.length < 1450) {
            // Clone existing debris with slight offset
            const clone = { ...backgroundDebris[Math.floor(Math.random() * backgroundDebris.length)] };
            clone.name = `DEBRIS FRAGMENT ${backgroundDebris.length}`;
            backgroundDebris.push(clone);
        }

        backgroundDebris = backgroundDebris.slice(0, 1450);

        const finalDebris = [...killerDebris, ...backgroundDebris];
        console.log(`Total Debris: ${finalDebris.length}`);

        const data = {
            generatedAt: new Date().toISOString(),
            satellites,
            debris: finalDebris
        };

        const outputPath = path.join(__dirname, '../data/tle.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Saved to ${outputPath}`);

    } catch (e) {
        console.error('Error generating data:', e.message);
    }
}

generate();
