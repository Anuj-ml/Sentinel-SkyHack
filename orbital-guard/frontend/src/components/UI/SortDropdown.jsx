import React from 'react';

const SortDropdown = ({ sortBy, setSortBy }) => {
    return (
        <div className="glass-panel" style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '320px',
            marginTop: '10px'
        }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>sort</span>
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
                <option value="name" style={{ background: '#1a1a1a' }}>Sort by Name</option>
                <option value="hazards" style={{ background: '#1a1a1a' }}>Sort by Hazards (High to Low)</option>
                <option value="altitude" style={{ background: '#1a1a1a' }}>Sort by Altitude</option>
            </select>
        </div>
    );
};

export default SortDropdown;
