import React from 'react';
import { motion } from 'framer-motion';

const TimeSlider = ({ currentTime, onTimeChange, isPlaying, onTogglePlay }) => {
    // Range: -24 hours to +24 hours from NOW
    const now = new Date().getTime();
    const minTime = now - 24 * 60 * 60 * 1000;
    const maxTime = now + 24 * 60 * 60 * 1000;

    const handleChange = (e) => {
        const newTime = new Date(parseInt(e.target.value));
        onTimeChange(newTime);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString();
    };

    return (
        <motion.div
            className="glass-panel"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '600px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                zIndex: 20
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                <button
                    onClick={onTogglePlay}
                    style={{
                        background: 'transparent',
                        border: '1px solid white',
                        color: 'white',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <input
                        type="range"
                        min={minTime}
                        max={maxTime}
                        value={currentTime.getTime()}
                        onChange={handleChange}
                        style={{ width: '100%', accentColor: '#ff007a' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.7 }}>
                        <span>-24h</span>
                        <span>NOW</span>
                        <span>+24h</span>
                    </div>
                </div>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {formatDate(currentTime)} <span style={{ color: '#ff007a' }}>{formatTime(currentTime)}</span>
            </div>
        </motion.div>
    );
};

export default TimeSlider;
