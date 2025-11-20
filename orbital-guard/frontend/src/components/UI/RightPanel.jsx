import React from 'react';
import { motion } from 'framer-motion';
import GroundStationPanel from './GroundStationPanel';

const RightPanel = ({ selectedSat, currentTime }) => {
    if (!selectedSat) return null;

    const getEducationText = (sat) => {
        const alt = (sat.radius - 6371).toFixed(0);
        const inc = (sat.inclination * 180 / Math.PI).toFixed(1);
        const period = (2 * Math.PI * Math.sqrt(Math.pow(sat.radius, 3) / 398600) / 60).toFixed(0);

        const templates = [
            `Operating at an altitude of ${alt}km, ${sat.name} completes an orbit every ${period} minutes. Its inclination of ${inc}° allows for specific ground coverage patterns essential for its mission.`,
            `This ${sat.type} unit (ID: ${sat.id}) is part of a larger constellation. Maintaining a stable orbit at ${alt}km requires precise station-keeping to avoid orbital decay and collision hazards.`,
            `Detected in a ${inc}° inclination orbit, this object travels at approximately 7.5 km/s. Data indicates stable telemetry consistent with ${sat.type} operations in the LEO regime.`
        ];

        if (sat.name.includes('GPS')) return `Navstar GPS satellite providing critical positioning, navigation, and timing (PNT) services. Orbiting at ${alt}km (MEO), it repeats its ground track every sidereal day.`;
        if (sat.name.includes('STARLINK')) return `Part of the Starlink mega-constellation by SpaceX. Orbiting at ${alt}km, it provides low-latency broadband internet. High density in this shell requires automated collision avoidance.`;
        if (sat.name.includes('DEBRIS') || sat.type === 'debris') return `Tracked space debris fragment. Originating from a collision or breakup event. At ${alt}km, atmospheric drag will eventually cause reentry, but it poses a kinetic threat to active assets until then.`;

        // Randomize generic text based on ID hash or similar to keep it consistent per sat
        const index = sat.id.charCodeAt(sat.id.length - 1) % templates.length;
        return templates[index];
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '360px' }}>
            {/* Satellite Info (Top) */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="glass-panel"
                style={{ padding: '24px' }}
            >
                <div style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--md-sys-color-primary)', marginBottom: '4px' }}>
                    ACTIVE SATELLITE
                </div>
                <h2 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>
                    {selectedSat.name}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7 }}>NORAD ID</span>
                        {selectedSat.id}
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7 }}>TYPE</span>
                        {selectedSat.type.toUpperCase()}
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7 }}>INCLINATION</span>
                        {(selectedSat.inclination * 180 / Math.PI).toFixed(2)}°
                    </div>
                </div>
            </motion.div>

            {/* Education (Middle) */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ padding: '24px' }}
            >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
                    Mission Brief
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {getEducationText(selectedSat)}
                </p>
            </motion.div>

            {/* Ground Stations (Bottom) */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <GroundStationPanel selectedSat={selectedSat} currentTime={currentTime} />
            </motion.div>
        </div>
    );
};

export default RightPanel;
