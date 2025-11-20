import React from 'react';
import { motion } from 'framer-motion';

const GlassMenu = ({ satellites, onSelect, selectedSat }) => {
    return (
        <motion.div
            className="glass-panel"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '280px',
                height: 'calc(100% - 40px)',
                padding: '20px',
                overflowY: 'auto',
                zIndex: 10
            }}
        >
            <h2 style={{ marginTop: 0, fontSize: '1.2rem', fontWeight: 600 }}>Satellites</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {satellites.map(sat => (
                    <button
                        key={sat.name}
                        onClick={() => onSelect(sat)}
                        style={{
                            background: selectedSat?.name === sat.name ? 'rgba(255,255,255,0.2)' : 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '10px',
                            borderRadius: '8px',
                            color: 'white',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {sat.name}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default GlassMenu;
