import React from 'react';
import { motion } from 'framer-motion';

const ComparisonPanel = ({ satellites, selectedSat }) => {
    if (!selectedSat || !satellites || satellites.length === 0) return null;

    // Find similar satellites (same altitude range)
    const similarSats = satellites
        .filter(sat => 
            sat.id !== selectedSat.id && 
            Math.abs((sat.radius || 0) - (selectedSat.radius || 0)) < 100
        )
        .slice(0, 3);

    if (similarSats.length === 0) return null;

    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '15px',
                minWidth: '300px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
            }}
        >
            <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '0.9rem', 
                fontWeight: 600,
                color: 'var(--accent-color)',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '8px'
            }}>
                Similar Orbit Altitude
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {similarSats.map(sat => (
                    <div 
                        key={sat.id}
                        style={{
                            fontSize: '0.85rem',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            fontFamily: 'var(--font-mono)'
                        }}
                    >
                        {sat.name || `Satellite ${sat.id}`}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ComparisonPanel;

