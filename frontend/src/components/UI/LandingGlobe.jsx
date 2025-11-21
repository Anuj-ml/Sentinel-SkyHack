import React from 'react';

const LandingGlobe = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.4,
            pointerEvents: 'none'
        }}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}</style>

            {/* Outer Glow Ring */}
            <div style={{
                width: '100%',
                height: '100%',
                maxWidth: '600px',
                maxHeight: '600px',
                border: '1px solid rgba(59, 130, 246, 0.3)', // blue-500/30
                borderRadius: '50%',
                position: 'absolute',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />

            {/* Inner Blue Orb */}
            <div style={{
                width: '70%',
                height: '70%',
                maxWidth: '400px',
                maxHeight: '400px',
                borderRadius: '50%',
                background: 'linear-gradient(to top right, #1e3a8a, #3b82f6)', // blue-900 to blue-500
                filter: 'blur(80px)'
            }} />

            {/* Grid Pattern Overlay */}
            <div style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                background: 'radial-gradient(circle at center, transparent 0%, black 100%)',
                mixBlendMode: 'overlay'
            }} />
        </div>
    );
};

export default LandingGlobe;
