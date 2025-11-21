import React from 'react';

const FilterDropdown = ({ filterBy, setFilterBy }) => {
    return (
        <div className="glass-panel" style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '200px',
            marginTop: '10px'
        }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>filter_alt</span>
            <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--md-sys-color-on-surface)',
                    fontSize: '0.9rem',
                    width: '100%',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                }}
            >
                <option value="ALL" style={{ background: '#1a1a1a' }}>All Types</option>
                <option value="STARLINK" style={{ background: '#1a1a1a' }}>Starlink</option>
                <option value="GPS" style={{ background: '#1a1a1a' }}>GPS/Navigation</option>
                <option value="COMMUNICATION" style={{ background: '#1a1a1a' }}>Communication</option>
                <option value="WEATHER" style={{ background: '#1a1a1a' }}>Weather</option>
                <option value="DEBRIS" style={{ background: '#1a1a1a' }}>Debris Only</option>
            </select>
        </div>
    );
};

export default FilterDropdown;
