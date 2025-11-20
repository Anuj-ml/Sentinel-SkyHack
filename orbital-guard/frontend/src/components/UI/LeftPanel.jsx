import React from 'react';
import { motion } from 'framer-motion';

const LeftPanel = ({ selectedSat, hazards, currentTime }) => {
    // Mock Ground Stations
    const stations = [
        { name: 'Goldstone (USA)', connected: true },
        { name: 'Svalbard (NOR)', connected: false },
        { name: 'Canberra (AUS)', connected: true }
    ];

    if (!selectedSat) return null;

    return (
        <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-panel"
            style={{
                width: '380px', // Fixed width
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                background: 'var(--glass-bg)', // High contrast
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)'
            }}
        >
            {/* Header */}
            <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-color)' }}>{selectedSat.name}</h2>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>ID: {selectedSat.id}</div>
            </div>

            {/* Telemetry */}
            <div className="section">
                <h3 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px' }}>LIVE TELEMETRY</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                    <div>SPEED</div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>7.66 km/s</div>
                    <div>ALTITUDE</div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>420 km</div>
                    <div>LATITUDE</div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>34.55° N</div>
                    <div>LONGITUDE</div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>12.33° W</div>
                </div>
            </div>

            {/* Ground Stations */}
            <div className="section">
                <h3 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px' }}>GROUND STATIONS</h3>
                {stations.map(st => (
                    <div key={st.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                        <span>{st.name}</span>
                        <span style={{ color: st.connected ? '#00ff88' : '#ff4444' }}>
                            {st.connected ? 'CONNECTED' : 'OFFLINE'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Collision List */}
            <div className="section">
                <h3 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px', color: '#ff4444' }}>
                    COLLISION WARNINGS ({hazards.length})
                </h3>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {hazards.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>No immediate threats detected.</div>
                    ) : (
                        hazards.map((h, i) => (
                            <div key={i} style={{ fontSize: '0.8rem', marginBottom: '8px', padding: '5px', background: 'rgba(255,0,0,0.1)', borderLeft: '2px solid red' }}>
                                <div style={{ fontWeight: 'bold' }}>{h.debrisName}</div>
                                <div>Dist: {h.distance.toFixed(2)} km</div>
                                <div>Time: {new Date(h.time).toLocaleTimeString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default LeftPanel;
