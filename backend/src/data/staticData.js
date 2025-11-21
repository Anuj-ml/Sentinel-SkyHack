const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data/orbitalData.json');

let cachedData = null;

function loadData() {
    if (cachedData) return cachedData;
    try {
        const raw = fs.readFileSync(DATA_PATH, 'utf8');
        cachedData = JSON.parse(raw);
        console.log(`Loaded static data generated at ${cachedData.generatedAt}`);
        return cachedData;
    } catch (e) {
        console.error('Failed to load static TLE data:', e.message);
        return { satellites: [], debris: [] };
    }
}

function getSatellites() {
    const data = loadData();
    return data.satellites;
}

function getDebris() {
    const data = loadData();
    return data.debris;
}

function getStatus() {
    const data = loadData();
    return {
        generatedAt: data.generatedAt,
        satelliteCount: data.satellites.length,
        debrisCount: data.debris.length
    };
}

module.exports = {
    getSatellites,
    getDebris,
    getStatus
};
