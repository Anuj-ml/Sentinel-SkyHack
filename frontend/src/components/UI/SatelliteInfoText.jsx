import React from 'react';
import { motion } from 'framer-motion';

const SatelliteInfoText = ({ selectedSat }) => {
    if (!selectedSat) return null;

    const getSatelliteDescription = (name, type) => {
        if (type === 'DEBRIS') return "Tracked fragment of space debris. Debris poses a collision risk to operational satellites and spacecraft.";
        const n = (name || "").toUpperCase();
        if (n.includes('GPS') || n.includes('GALILEO') || n.includes('GLONASS') || n.includes('BEIDOU')) return "Part of a global navigation satellite system (GNSS) providing geolocation and time information to a GPS receiver anywhere on or near the Earth.";
        if (n.includes('STARLINK') || n.includes('ONEWEB') || n.includes('IRIDIUM')) return "Part of a satellite constellation providing satellite internet access coverage to most of the Earth.";
        if (n.includes('GOES') || n.includes('NOAA') || n.includes('METOP')) return "Monitors Earth's weather and climate patterns. Crucial for meteorology and environmental monitoring.";
        if (n.includes('ISS') || n.includes('TIANGONG')) return "A modular space station in low Earth orbit. It is a multinational collaborative project involving five participating space agencies.";
        if (n.includes('HUBBLE') || n.includes('WEBB') || n.includes('CHANDRA')) return "An observatory located in outer space to observe distant planets, galaxies and other astronomical objects.";
        return "Operational satellite in Earth orbit. Tracking data provided by NORAD/Celestrak.";
    };

    return (
        <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '20px',
                marginTop: '12px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                maxWidth: '400px'
            }}
        >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--md-sys-color-primary)' }}>Mission Info</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--md-sys-color-on-surface-variant)' }}>
                {getSatelliteDescription(selectedSat.name, selectedSat.type)}
            </p>
        </motion.div>
    );
};

export default SatelliteInfoText;
