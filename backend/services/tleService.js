const axios = require('axios');
const Redis = require('ioredis');
const { normalizeTLE, formatForClient } = require('../utils/tleParser');
const { propagateSatrec } = require('../utils/sgp4Wrapper');

const CELESTRAK_URL = process.env.CELESTRAK_URL || 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json';
const SPACETRACK_LOGIN_URL = 'https://www.space-track.org/ajaxauth/login';
const SPACETRACK_QUERY_URL = 'https://www.space-track.org/basicspacedata/query/class/tle_latest/ORDINAL/1/FORMAT/json';
const CACHE_KEY = 'sentinel:tle_catalog';
const DEFAULT_REFRESH_MINUTES = Number(process.env.TLE_REFRESH_MINUTES) || 15;

let redis;
let liveCatalog = [];
let status = {
    lastRefresh: null,
    lastSource: 'STATIC',
    fallbackReason: null,
    error: null
};

if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
        password: process.env.REDIS_PASS,
        lazyConnect: true
    });

    redis.on('error', (err) => {
        console.warn('[TLE] Redis connection error', err.message);
    });
}

async function fetchFromCelesTrak() {
    const { data } = await axios.get(CELESTRAK_URL, { timeout: 8000 });
    return Array.isArray(data) ? data : [];
}

async function fetchFromSpaceTrack() {
    if (!process.env.SPACETRACK_USER || !process.env.SPACETRACK_PASS) {
        throw new Error('Space-Track credentials missing');
    }

    const login = await axios.post(SPACETRACK_LOGIN_URL, `identity=${process.env.SPACETRACK_USER}&password=${process.env.SPACETRACK_PASS}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000
    });

    const cookie = login.headers['set-cookie'];
    if (!cookie) {
        throw new Error('Space-Track login failed');
    }

    const { data } = await axios.get(SPACETRACK_QUERY_URL, {
        headers: { Cookie: cookie.map((c) => c.split(';')[0]).join(';') },
        timeout: 8000
    });

    return Array.isArray(data) ? data.map((entry) => ({ ...entry, source: 'SPACE-TRACK' })) : [];
}

async function hydrateCatalog(rawEntries, source) {
    const normalized = rawEntries
        .map((entry) => normalizeTLE({ ...entry, source }))
        .filter(Boolean);

    liveCatalog = normalized;
    status = {
        lastRefresh: new Date().toISOString(),
        lastSource: source,
        fallbackReason: null,
        error: null
    };

    if (redis) {
        try {
            await redis.set(CACHE_KEY, JSON.stringify(normalized), 'EX', 60 * 60);
        } catch (err) {
            console.warn('[TLE] Failed to persist cache', err.message);
        }
    }
}

async function refreshCatalog() {
    try {
        const celesTrakData = await fetchFromCelesTrak();
        await hydrateCatalog(celesTrakData, 'CELESTRAK');
        return;
    } catch (err) {
        console.warn('[TLE] CelesTrak fetch failed, attempting Space-Track...', err.message);
        status.fallbackReason = err.message;
    }

    try {
        const spaceTrackData = await fetchFromSpaceTrack();
        await hydrateCatalog(spaceTrackData, 'SPACE-TRACK');
    } catch (err) {
        console.error('[TLE] Space-Track fallback failed', err.message);
        status.error = err.message;
        if (redis) {
            try {
                const cached = await redis.get(CACHE_KEY);
                if (cached) {
                    liveCatalog = JSON.parse(cached);
                    status.lastSource = 'REDIS-CACHE';
                }
            } catch (cacheErr) {
                console.warn('[TLE] Redis cache unavailable', cacheErr.message);
            }
        }
    }
}

function getLiveSatellites(limit = 500, date = new Date()) {
    if (!liveCatalog.length) {
        return null;
    }

    return liveCatalog.slice(0, limit).map((entry) => {
        const stateVector = propagateSatrec(entry.satrec, date);
        return stateVector ? formatForClient(entry, stateVector) : null;
    }).filter(Boolean);
}

function getCatalogSize() {
    return liveCatalog.length;
}

function getIngestionStatus() {
    return {
        ...status,
        liveCount: liveCatalog.length
    };
}

function findSatrecById(id) {
    return liveCatalog.find((entry) => `${entry.satId}` === `${id}`);
}

async function initTLEIngestion(options = {}) {
    const intervalMinutes = options.refreshMinutes || DEFAULT_REFRESH_MINUTES;
    await refreshCatalog();
    setInterval(refreshCatalog, intervalMinutes * 60 * 1000).unref();
    console.log(`[TLE] Live ingestion initialized. Refresh every ${intervalMinutes} minutes.`);
}

module.exports = {
    initTLEIngestion,
    getLiveSatellites,
    getIngestionStatus,
    getCatalogSize,
    findSatrecById
};

