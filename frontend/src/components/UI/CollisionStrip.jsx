import React from 'react';

const CollisionStrip = ({ hazards }) => {
    const isSafe = !hazards || hazards.length === 0;

    if (isSafe) return null; // Don't show if safe

    // Categorize hazards
    const sortedHazards = [...hazards].sort((a, b) => {
        if (a.type === 'SATELLITE' && b.type !== 'SATELLITE') return -1;
        if (a.type !== 'SATELLITE' && b.type === 'SATELLITE') return 1;
        if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
        if (a.severity !== 'CRITICAL' && b.severity === 'CRITICAL') return 1;
        return a.distance - b.distance;
    });

    const satelliteCount = hazards.filter(h => h.type === 'SATELLITE').length;
    const debrisCount = hazards.filter(h => h.type === 'DEBRIS').length;
    const hasCritical = hazards.some(h => h.severity === 'CRITICAL');

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            width: '100%',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            borderTop: hasCritical ? '2px solid #ef4444' : '1px solid #f59e0b',
            background: hasCritical
                ? 'linear-gradient(to right, rgba(65, 14, 11, 0.95), rgba(30, 10, 10, 0.95))'
                : 'linear-gradient(to right, rgba(120, 53, 15, 0.95), rgba(45, 25, 10, 0.95))',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)'
        }}>
            {/* Left: Warning Icon + Total Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                    fontSize: '1.5rem',
                    animation: 'pulse 1s infinite',
                    color: hasCritical ? '#ef4444' : '#f59e0b'
                }}>
                    {hasCritical ? '🛡️' : '⚠️'}
                </span>
                <div>
                    <div style={{ color: hasCritical ? '#ef4444' : '#f59e0b', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                        {hasCritical ? 'CRITICAL WARNING' : 'PROXIMITY ALERT'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'var(--font-mono)' }}>
                        Total Threats: {hazards.length}
                    </div>
                </div>
            </div>

            {/* Center: Summary */}
            <div style={{
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                color: 'white',
                fontWeight: 600,
                textAlign: 'center',
                flex: 1
            }}>
                INTERCEPT DETECTED: {satelliteCount > 0 && `${satelliteCount} SATELLITE${satelliteCount > 1 ? 'S' : ''}`}
                {satelliteCount > 0 && debrisCount > 0 && ', '}
                {debrisCount > 0 && `${debrisCount} DEBRIS FRAGMENT${debrisCount > 1 ? 'S' : ''}`}
            </div>

            {/* Right: Top 5 Hazards (INCREASED!) */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                {sortedHazards.slice(0, 5).map((h, i) => {
                    const color = h.type === 'SATELLITE' ? '#9333ea' : h.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';
                    return (
                        <div key={i} style={{ color: '#ccc' }}>
                            <span style={{ color }}>●</span> {h.debrisName.substring(0, 15)}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default CollisionStrip;
