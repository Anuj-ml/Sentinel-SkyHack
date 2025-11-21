import React from 'react';
import { motion } from 'framer-motion';

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const HazardList = ({ hazards }) => {
    if (!hazards || hazards.length === 0) return null;

    // Sort hazards: SATELLITE first, then CRITICAL, then MODERATE
    const sortedHazards = [...hazards].sort((a, b) => {
        if (a.type === 'SATELLITE' && b.type !== 'SATELLITE') return -1;
        if (a.type !== 'SATELLITE' && b.type === 'SATELLITE') return 1;
        if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
        if (a.severity !== 'CRITICAL' && b.severity === 'CRITICAL') return 1;
        return a.distance - b.distance;
    });

    const satelliteCount = hazards.filter(h => h.type === 'SATELLITE').length;
    const criticalCount = hazards.filter(h => h.severity === 'CRITICAL' && h.type !== 'SATELLITE').length;
    const moderateCount = hazards.filter(h => h.severity === 'MODERATE').length;

    return (
        <div className="glass-panel" style={{
            padding: '16px',
            marginTop: '10px',
            maxHeight: '200px', // Scrollable!
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            <div style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'space-between'
            }}>
                <span style={{ color: '#ef4444' }}>🛡️ PROXIMITY ALERTS ({hazards.length})</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {satelliteCount > 0 && (
                        <span style={{ background: '#9333ea', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                            {satelliteCount} SAT
                        </span>
                    )}
                    {criticalCount > 0 && (
                        <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                            {criticalCount} CRIT
                        </span>
                    )}
                    {moderateCount > 0 && (
                        <span style={{ background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                            {moderateCount} MOD
                        </span>
                    )}
                </div>
            </div>

            {sortedHazards.map((h, i) => {
                const isSatellite = h.type === 'SATELLITE';
                const isCritical = h.severity === 'CRITICAL';

                let bgColor, borderColor, icon;
                if (isSatellite) {
                    bgColor = 'rgba(147, 51, 234, 0.15)';
                    borderColor = '#9333ea';
                    icon = '🛰️';
                } else if (isCritical) {
                    bgColor = 'rgba(239, 68, 68, 0.15)';
                    borderColor = '#ef4444';
                    icon = '🛡️';
                } else {
                    bgColor = 'rgba(245, 158, 11, 0.15)';
                    borderColor = '#f59e0b';
                    icon = '⚠️';
                }

                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                            background: isSatellite
                                ? 'linear-gradient(90deg, rgba(147, 51, 234, 0.2), rgba(239, 68, 68, 0.15))'
                                : bgColor,
                            borderLeft: `3px solid ${borderColor}`,
                            padding: '8px 12px',
                            borderRadius: '0 4px 4px 0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1rem' }}>{icon}</span>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                                {h.debrisName}
                            </div>
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: borderColor,
                                color: 'white',
                                fontWeight: 700
                            }}>
                                {isSatellite ? 'SAT-COLLISION' : h.severity}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                            <span>Dist: <span style={{ color: borderColor, fontWeight: 600 }}>{(h.distance).toFixed(2)} km</span></span>
                            {h.distance < 1 && <span style={{ color: '#ff0000', fontWeight: 900, animation: 'blink 1s infinite' }}>⚠️ COLLISION</span>}
                            <span>T-{h.timeToCollision ? formatTime(h.timeToCollision) : '??:??'}</span>
                            <style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default HazardList;
