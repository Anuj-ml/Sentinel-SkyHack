import React from 'react';
import { motion } from 'framer-motion';

const ManeuverSuggestion = ({ hazards, selectedSat }) => {
    if (!hazards || hazards.length === 0) {
        // SAFE SIGNAL
        return (
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    padding: '16px',
                    marginTop: '10px',
                    background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.15), rgba(27, 94, 32, 0.15))',
                    border: '1px solid #4caf50',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}
            >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✓</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4caf50', marginBottom: '4px' }}>
                    ALL CLEAR
                </div>
                <div style={{ fontSize: '0.75rem', color: '#81c784', fontFamily: 'var(--font-mono)' }}>
                    No collision threats detected. Orbit nominal.
                </div>
            </motion.div>
        );
    }

    // Calculate maneuver based on most critical threat
    const criticalThreat = hazards.sort((a, b) => a.distance - b.distance)[0];
    const isUrgent = criticalThreat.distance < 5; // Less than 5km

    // Determine maneuver type based on distance
    let maneuverType, deltaV, alertLevel, nearbySats;
    if (isUrgent) {
        maneuverType = "EMERGENCY EVASIVE";
        deltaV = (Math.random() * 5 + 15).toFixed(2); // 15-20 m/s
        alertLevel = "CRITICAL";
        nearbySats = ["AQUA", "TERRA", "NOAA-20"];
    } else {
        maneuverType = "PREVENTIVE ADJUSTMENT";
        deltaV = (Math.random() * 3 + 2).toFixed(2); // 2-5 m/s
        alertLevel = "ADVISORY";
        nearbySats = ["LANDSAT-9", "SENTINEL-6"];
    }

    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '16px',
                marginTop: '10px',
                background: isUrgent
                    ? 'linear-gradient(135deg, rgba(211, 47, 47, 0.15), rgba(183, 28, 28, 0.15))'
                    : 'linear-gradient(135deg, rgba(245, 124, 0, 0.15), rgba(230, 81, 0, 0.15))',
                border: `1px solid ${isUrgent ? '#ef4444' : '#f59e0b'}`,
                borderRadius: '8px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🛸</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isUrgent ? '#ef4444' : '#f59e0b' }}>
                    MANEUVER RECOMMENDATION
                </div>
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: isUrgent ? '#ef4444' : '#f59e0b',
                    color: 'white',
                    fontWeight: 700
                }}>
                    {alertLevel}
                </span>
            </div>

            <div style={{
                fontSize: '0.75rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Type:</span>
                    <span style={{ fontWeight: 600 }}>{maneuverType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delta-V Required:</span>
                    <span style={{ fontWeight: 600, color: isUrgent ? '#ef4444' : '#f59e0b' }}>{deltaV} m/s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Burn Duration:</span>
                    <span style={{ fontWeight: 600 }}>{(parseFloat(deltaV) * 2.5).toFixed(1)} sec</span>
                </div>
            </div>

            <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>
                    📡 Alert Broadcast to Nearby Assets:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {nearbySats.map((sat, i) => (
                        <span key={i} style={{
                            fontSize: '0.65rem',
                            padding: '3px 8px',
                            background: 'rgba(100, 100, 255, 0.2)',
                            border: '1px solid rgba(100, 100, 255, 0.4)',
                            borderRadius: '4px',
                            color: '#aaf'
                        }}>
                            {sat}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ManeuverSuggestion;
