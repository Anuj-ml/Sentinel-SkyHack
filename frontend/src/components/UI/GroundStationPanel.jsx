import React, { useMemo } from 'react';
import { groundStations } from '../../data/groundStations';

const GroundStationPanel = ({ selectedSat, currentTime }) => {
    if (!selectedSat) return null;

    // Randomize 5-7 stations for this satellite pass
    const activeStations = useMemo(() => {
        const count = Math.floor(Math.random() * 3) + 5; // 5 to 7
        const shuffled = [...groundStations].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }, [selectedSat]); // Re-roll when satellite changes

    // Mock ETA generation based on time
    const getETA = (index) => {
        const baseTime = currentTime.getTime();
        const offset = (index + 1) * 45 * 60 * 1000; // 45 mins apart
        const passTime = new Date(baseTime + offset);
        return passTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', marginTop: '12px', maxHeight: '240px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
                Ground Station Passes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeStations.map((station, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
                        <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{station.name}</span>
                        <span style={{ color: 'var(--md-sys-color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                            {getETA(i)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroundStationPanel;
