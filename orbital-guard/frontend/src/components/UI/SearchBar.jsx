import React, { useState } from 'react';

const SearchBar = ({ satellites, onSelect, showDebris, setShowDebris }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Filter satellites based on search
    const filteredSatellites = satellites.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            <div className="glass-panel" style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '320px'
            }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>search</span>
                <input
                    type="text"
                    placeholder="Search satellites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--md-sys-color-on-surface)',
                        fontSize: '1rem',
                        width: '100%',
                        outline: 'none'
                    }}
                />

                {/* Debris Toggle */}
                <button
                    onClick={() => setShowDebris(!showDebris)}
                    title={showDebris ? "Hide Debris" : "Show Debris"}
                    style={{
                        background: showDebris ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
                        border: showDebris ? '1px solid var(--md-sys-color-error)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        padding: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span className="material-symbols-outlined" style={{
                        color: showDebris ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)',
                        fontSize: '20px'
                    }}>
                        {showDebris ? 'visibility' : 'visibility_off'}
                    </span>
                </button>
            </div>

            {/* Dropdown List */}
            {showDropdown && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: 0,
                    left: '340px', // Position to the right of search box
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '8px 0',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}>
                    {filteredSatellites.slice(0, 50).map(sat => (
                        <div
                            key={sat.id}
                            onClick={() => {
                                onSelect(sat);
                                setSearchTerm(sat.name);
                                setShowDropdown(false);
                            }}
                            style={{
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: 'var(--md-sys-color-on-surface)',
                                transition: 'background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}>satellite_alt</span>
                            {sat.name}
                        </div>
                    ))}
                    {filteredSatellites.length === 0 && (
                        <div style={{ padding: '8px 16px', color: '#888', fontSize: '0.9rem' }}>No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
