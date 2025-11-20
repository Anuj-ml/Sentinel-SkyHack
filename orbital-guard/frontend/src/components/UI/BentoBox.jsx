import React from 'react';
import { motion } from 'framer-motion';

const BentoBox = ({ selectedSat, hazards }) => {
    if (!selectedSat) return null;

    return (
        <motion.div
            className="glass-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '320px',
                height: 'calc(100% - 40px)',
                padding: '20px',
                overflowY: 'auto',
                zIndex: 10
            }}
        >
            <h2 style={{ marginTop: 0 }}>{selectedSat.name}</h2>
            <div style={{ marginBottom: '20px' }}>
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Status: Active</p>
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Type: Satellite</p>
            </div>

            <h3>Conjunction Assessment</h3>
            {hazards && hazards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {hazards.map((hazard, i) => (
                        <div
                            key={i}
                            style={{
                                background: 'rgba(255, 50, 50, 0.1)',
                                border: '1px solid rgba(255, 50, 50, 0.3)',
                                padding: '10px',
                                borderRadius: '8px'
                            }}
                        >
                            <div style={{ fontWeight: 600, color: '#ff8888' }}>WARNING</div>
                            <div style={{ fontSize: '0.9rem' }}>Object: {hazard.debrisName}</div>
                            <div style={{ fontSize: '0.9rem' }}>Dist: {hazard.distance.toFixed(2)} km</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                T-{Math.round((new Date(hazard.time) - new Date()) / 1000 / 60)} min
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    padding: '20px',
                    background: 'rgba(50, 255, 50, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    No immediate hazards detected within 156h window.
                </div>
            )}
        </motion.div>
    );
};

export default BentoBox;
