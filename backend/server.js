const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getSatellites, getDebris, getStatus } = require('./src/data/staticData');
const { getSatRecFromTLE, propagate } = require('./src/physics/propagator');
const { predictConjunctions } = require('./src/physics/collision');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// In-memory storage (Loaded from Static JSON)
let satellites = [];
let debris = [];
let satelliteRecs = {};
let debrisRecs = [];

// Initialize Data from Static Source
function initData() {
    satellites = getSatellites();
    debris = getDebris();
    console.log(`Initialized ${satellites.length} satellites and ${debris.length} debris objects from STATIC KEPLERIAN source.`);
}

initData();

// Routes
app.get('/api/satellites', (req, res) => {
    res.json(satellites);
});

app.get('/api/debris', (req, res) => {
    res.json(debris);
});

app.get('/api/tle/status', (req, res) => {
    res.json(getStatus());
});

// Alias for collision prediction
app.post('/api/collisions', (req, res) => {
    const { targetName } = req.body;
    // Simple distance check for Keplerian data
    const target = satellites.find(s => s.name === targetName);
    if (!target) return res.status(404).json({ error: 'Satellite not found' });

    // Find debris on same orbit (Killer Debris)
    const hazards = debris
        .filter(d => d.isKiller && d.targetId === target.id)
        .map(d => ({
            debrisName: d.name,
            distance: 0.1, // Mock close distance
            time: new Date().toISOString()
        }));

    res.json(hazards);
});

app.post('/api/predict-hazard', (req, res) => {
    const { targetName } = req.body;
    const target = satellites.find(s => s.name === targetName);
    if (!target) {
        return res.status(404).json({ error: 'Satellite not found' });
    }

    // Get ALL debris hazards (no slicing!)
    const debrisHazards = debris
        .filter(d => d.isKiller && d.targetId === target.id)
        .map(d => ({
            type: 'DEBRIS',
            debrisName: d.name,
            debrisId: d.id,
            severity: d.severity || 'MODERATE',
            distance: d.estimatedDistance || 0.1, // Use realistic distance
            timeToCollision: d.timeToCollision || 3600, // seconds
            time: new Date().toISOString()
        }));

    // Check for satellite-on-satellite collision
    const satelliteHazards = [];
    if (target.collisionTarget) {
        const collisionSat = satellites.find(s => s.id === target.collisionTarget);
        if (collisionSat) {
            satelliteHazards.push({
                type: 'SATELLITE',
                debrisName: collisionSat.name,
                debrisId: collisionSat.id,
                severity: 'CRITICAL',
                distance: 0.05, // Very close!
                time: new Date().toISOString()
            });
        }
    }

    // Combine ALL hazards and sort
    const allHazards = [...satelliteHazards, ...debrisHazards].sort((a, b) => {
        // Satellite collisions first, then CRITICAL, then MODERATE
        if (a.type === 'SATELLITE' && b.type !== 'SATELLITE') return -1;
        if (a.type !== 'SATELLITE' && b.type === 'SATELLITE') return 1;
        if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
        if (a.severity !== 'CRITICAL' && b.severity === 'CRITICAL') return 1;
        return a.distance - b.distance;
    });

    res.json(allHazards);
});

app.post('/api/restart', (req, res) => {
    console.log('Reloading static data...');
    initData();
    res.json({ status: 'success', message: 'Static data reloaded' });
});

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
    console.log(`Ready to accept connections from frontend`);
});
