import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import OrbitCreator from '../components/simulator/OrbitCreator';
import SimulatorScene from '../components/simulator/SimulatorScene';
import RiskPlayback from '../components/simulator/RiskPlayback';
import { buildSatrec, propagateSatrec, convertToThree } from '../context/physics/sgp4-propagator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DEFAULT_SCENARIO = [
    { id: 'SIM-A', name: 'Sentinel-A', altitude: 540, inclination: 53, raan: 12, collisionRadius: 8 },
    { id: 'SIM-B', name: 'Relay-B', altitude: 560, inclination: 55, raan: 90, collisionRadius: 8 }
];

export default function AdvancedSimulator({ onBack, onLaunchTracker }) {
    const [scenario, setScenario] = useState(DEFAULT_SCENARIO);
    const [mode, setMode] = useState('SIMULATION');
    const [result, setResult] = useState(null);
    const [frameIndex, setFrameIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trackingAssets, setTrackingAssets] = useState([]);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/satellites`);
                const enriched = data.slice(0, 50).map((sat) => {
                    const satrec = buildSatrec(sat.line1, sat.line2);
                    const state = propagateSatrec(satrec);
                    return {
                        id: sat.id,
                        name: sat.name,
                        positionVector: convertToThree(state?.position)
                    };
                }).filter((asset) => asset.positionVector);
                setTrackingAssets(enriched);
            } catch (err) {
                console.warn('[AdvancedSimulator] tracking bootstrap failed', err.message);
            }
        };

        bootstrap();
    }, []);

    const handleAddOrbit = (orbit) => {
        if (scenario.length >= 10) return;
        setScenario((prev) => [...prev, orbit]);
    };

    const handleRunSimulation = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post(`${API_URL}/simulator/run`, {
                mode,
                satellites: scenario,
                durationMinutes: 45,
                stepSeconds: 60
            });
            setResult(data);
            setFrameIndex(0);
        } catch (err) {
            setError('Failed to run simulation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const infoCards = useMemo(() => ([
        { label: 'Mode', value: mode },
        { label: 'Objects', value: scenario.length },
        { label: 'Frames', value: result?.frames?.length || 0 },
        { label: 'Conjunctions', value: result?.events?.length || 0 }
    ]), [mode, scenario.length, result]);

    return (
        <div style={{ width: '100%', minHeight: '100vh', background: '#010409', color: '#fff' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px clamp(16px, 4vw, 48px)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Sentinel Lab</p>
                        <h1 style={{ margin: 0 }}>Advanced Collision Simulator</h1>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        <button onClick={onBack} style={navButtonStyle}>Back to Landing</button>
                        <button onClick={onLaunchTracker} style={navButtonStyle}>Launch Live Tracker</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {infoCards.map((card) => (
                        <div key={card.label} style={{ minWidth: '160px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 20px' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{card.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{card.value}</div>
                        </div>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        <button onClick={() => setMode('SIMULATION')} style={{ ...chipStyle, background: mode === 'SIMULATION' ? '#2563EB' : 'transparent' }}>
                            Simulation Mode
                        </button>
                        <button onClick={() => setMode('TRACKING')} style={{ ...chipStyle, background: mode === 'TRACKING' ? '#2563EB' : 'transparent' }}>
                            Tracking Mode
                        </button>
                        <button onClick={handleRunSimulation} disabled={loading} style={{ ...chipStyle, background: '#16a34a', minWidth: '160px' }}>
                            {loading ? 'Simulating...' : 'Run Scenario'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ background: '#7f1d1d', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                    alignItems: 'stretch'
                }}>
                    <div style={{ flex: '1 1 320px' }}>
                        <OrbitCreator onAddOrbit={handleAddOrbit} scenario={scenario} />
                    </div>
                    <div style={{ flex: '2 1 520px', minWidth: 'min(100%, 640px)' }}>
                        <SimulatorScene
                            frames={result?.frames || []}
                            frameIndex={frameIndex}
                            mode={mode}
                            objects={trackingAssets}
                            height={520}
                        />
                    </div>
                    <div style={{ flex: '1 1 320px' }}>
                        <RiskPlayback
                            events={result?.events || []}
                            summary={result?.summary}
                            frameIndex={frameIndex}
                            onFrameChange={setFrameIndex}
                            totalFrames={result?.frames?.length || 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const navButtonStyle = {
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '999px',
    cursor: 'pointer'
};

const chipStyle = {
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '10px 18px',
    borderRadius: '999px',
    cursor: 'pointer',
    color: '#fff'
};


