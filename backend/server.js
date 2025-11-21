require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getSatellites, getDebris, getStatus } = require('./src/data/staticData');
const { scoreCollisionRisk, getModelStatus } = require('./services/collisionMLService');
const { initTLEIngestion, getLiveSatellites, getIngestionStatus } = require('./services/tleService');
const { registerSubscriber, sendCriticalAlert, getSubscribers } = require('./services/alertService');
const { planAvoidanceManeuver } = require('./models/maneuverEngine');
const { runSandboxScenario } = require('./src/physics/simulator');

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

// In-memory storage (Loaded from Static JSON for fallback)
let staticSatellites = [];
let staticDebris = [];

function initStaticData() {
    staticSatellites = getSatellites();
    staticDebris = getDebris();
    console.log(`[Static] Loaded ${staticSatellites.length} satellites and ${staticDebris.length} debris objects.`);
}

initStaticData();

initTLEIngestion().catch((err) => {
    console.error('[TLE] Failed to start live ingestion', err.message);
});

function resolveSatelliteCatalog() {
    const live = getLiveSatellites(800);
    if (live && live.length) {
        return live;
    }
    return staticSatellites;
}

app.get('/api/satellites', (req, res) => {
    return res.json(resolveSatelliteCatalog());
});

app.get('/api/debris', (req, res) => {
    res.json(staticDebris);
});

app.get('/api/tle/status', (req, res) => {
    res.json({
        live: getIngestionStatus(),
        static: getStatus()
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        live: getIngestionStatus(),
        mlModels: getModelStatus(),
        alerts: {
            subscribers: getSubscribers().length,
            smtpConfigured: Boolean(process.env.SMTP_EMAIL && process.env.SMTP_PASS)
        }
    });
});

app.post('/api/collision-risk', async (req, res) => {
    try {
        const result = await scoreCollisionRisk(req.body || {});
        if (result.severity === 'CRITICAL') {
            await sendCriticalAlert(result);
        }
        res.json(result);
    } catch (err) {
        console.error('[Collision Risk]', err);
        res.status(500).json({ error: 'Failed to score collision risk' });
    }
});

app.post('/api/alert-subscribe', (req, res) => {
    try {
        const entry = registerSubscriber(req.body.email, req.body);
        res.json({ status: 'subscribed', entry });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/alert-send', async (req, res) => {
    try {
        const report = await sendCriticalAlert(req.body);
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/maneuver/plan', (req, res) => {
    const plan = planAvoidanceManeuver({
        satelliteId: req.body.satelliteId,
        threats: req.body.threats || [],
        fuelBudget: req.body.fuelBudget || 25
    });
    res.json(plan);
});

app.post('/api/simulator/run', (req, res) => {
    try {
        const payload = runSandboxScenario({
            mode: req.body.mode,
            satellites: req.body.satellites || [],
            durationMinutes: req.body.durationMinutes || 60,
            stepSeconds: req.body.stepSeconds || 60
        });
        res.json(payload);
    } catch (err) {
        console.error('[Simulator]', err);
        res.status(500).json({ error: 'Simulation failed' });
    }
});

// Legacy compatibility endpoints
app.post('/api/collisions', async (req, res) => {
    const { targetName } = req.body;
    const target = resolveSatelliteCatalog().find((s) => s.name === targetName || s.id === targetName);
    if (!target) return res.status(404).json({ error: 'Satellite not found' });
    const hazards = staticDebris.slice(0, 25).map((d) => ({
            debrisName: d.name,
        distance: d.estimatedDistance || 0.1,
            time: new Date().toISOString()
        }));
    res.json(hazards);
});

app.post('/api/predict-hazard', async (req, res) => {
    const { targetName } = req.body;
    const target = resolveSatelliteCatalog().find((s) => s.name === targetName || s.id === targetName);
    if (!target) {
        return res.status(404).json({ error: 'Satellite not found' });
    }

    const hazards = await Promise.all(
        staticDebris.slice(0, 10).map(async (debrisObj) => {
            const ml = await scoreCollisionRisk({
                satelliteId: target.id || target.name,
                debrisId: debrisObj.id || debrisObj.name,
                timeToCA: debrisObj.timeToCollision || 900,
                relativeVelocity: debrisObj.relativeVelocity || 5.2
            });
            return {
                ...ml,
                debrisName: debrisObj.name,
                type: 'DEBRIS',
                distance: debrisObj.estimatedDistance || Math.random()
            };
        })
    );

    hazards.sort((a, b) => b.probability - a.probability);
    res.json(hazards);
});

app.post('/api/restart', (req, res) => {
    initStaticData();
    res.json({ status: 'success', message: 'Static data reloaded' });
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
});
