import React from 'react';
import { motion } from 'framer-motion';
import { propagateKeplerian } from '../../physics/keplerian';

const InfoPanel = ({ selectedSat, currentTime }) => {
    // Calculate Lat/Lon/Alt and Velocity
    let lat = 0, lon = 0, alt = 0, velocity = 0;
    let satName = "NO SATELLITE SELECTED";
    let satType = "Unknown";

    if (selectedSat) {
        satName = selectedSat.name || "Unknown Satellite";

        // Determine satellite type based on name
        const name = selectedSat.name || "";
        if (name.includes('GPS') || name.includes('GALILEO') || name.includes('GLONASS') || name.includes('BEIDOU')) {
            satType = "Navigation/GPS";
        } else if (name.includes('STARLINK') || name.includes('ONEWEB') || name.includes('IRIDIUM')) {
            satType = "Communication Network";
        } else if (name.includes('GOES') || name.includes('NOAA') || name.includes('METOP')) {
            satType = "Weather/Climate";
        } else if (name.includes('SENTINEL') || name.includes('LANDSAT') || name.includes('TERRA') || name.includes('AQUA')) {
            satType = "Earth Observation";
        } else if (name.includes('ISS') || name.includes('TIANGONG')) {
            satType = "Space Station";
        } else if (name.includes('HUBBLE') || name.includes('WEBB') || name.includes('CHANDRA')) {
            satType = "Space Telescope";
        } else if (selectedSat.type === 'debris') {
            satType = "Space Debris";
        } else {
            satType = "Scientific Satellite";
        }

        // Calculate velocity from orbital parameters
        const MU = 398600; // km^3/s^2
        const radius = selectedSat.radius || 7000;
        velocity = selectedSat.speed || Math.sqrt(MU / radius);

        // Calculate altitude (radius - Earth radius)
        alt = radius - 6371;
    }

    return (
        <motion.div
            className="glass-panel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                padding: '15px 30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                minWidth: '400px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
            }}
        >
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--accent-color)',
                letterSpacing: '1px'
            }}>
                {satName}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                {satType}
            </div>

            <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>ALTITUDE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{alt.toFixed(2)} km</div>
                </div>
                <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>VELOCITY</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{velocity.toFixed(2)} km/s</div>
                </div>
                <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>PERIOD</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {selectedSat && selectedSat.radius ? ((2 * Math.PI * selectedSat.radius) / (velocity * 60)).toFixed(0) : '0'} min
                    </div>
                </div>
            </div>

            {/* Satellite Description */}


            <div style={{ fontSize: '0.8rem', opacity: 0.5, fontFamily: 'var(--font-mono)', marginTop: '5px' }}>
                UTC: {currentTime ? currentTime.toISOString().replace('T', ' ').split('.')[0] : 'Loading...'}
            </div>
        </motion.div>
    );
};

// Helper to generate description


export default InfoPanel;
