import React, { useState } from 'react';

const DEFAULT_ORBIT = {
    name: 'Virtual Sat',
    altitude: 550,
    inclination: 53,
    raan: 0,
    collisionRadius: 10
};

export default function OrbitCreator({ onAddOrbit, scenario = [] }) {
    const [draft, setDraft] = useState(DEFAULT_ORBIT);

    const updateField = (field, value) => {
        setDraft((prev) => ({
            ...prev,
            [field]: Number.isFinite(value) ? Number(value) : value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!onAddOrbit) return;
        onAddOrbit({
            ...draft,
            id: `${draft.name}-${Date.now()}`
        });
        setDraft((prev) => ({ ...prev, name: `Virtual Sat ${scenario.length + 2}` }));
    };

    return (
        <div style={{ background: 'rgba(15,15,20,0.8)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Simulation Mode</p>
                    <h3 style={{ margin: 0 }}>Virtual Orbit Builder</h3>
                </div>
                <div style={{ fontSize: '2rem' }}>🛰️</div>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', gap: '4px' }}>
                    Name
                    <input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} required style={inputStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', gap: '4px' }}>
                    Altitude (km)
                    <input type="number" value={draft.altitude} onChange={(e) => updateField('altitude', parseFloat(e.target.value))} min="200" max="2000" required style={inputStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', gap: '4px' }}>
                    Inclination (°)
                    <input type="number" value={draft.inclination} onChange={(e) => updateField('inclination', parseFloat(e.target.value))} min="0" max="180" required style={inputStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', gap: '4px' }}>
                    RAAN (°)
                    <input type="number" value={draft.raan} onChange={(e) => updateField('raan', parseFloat(e.target.value))} min="0" max="360" required style={inputStyle} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', gap: '4px' }}>
                    Collision Radius (km)
                    <input type="number" value={draft.collisionRadius} onChange={(e) => updateField('collisionRadius', parseFloat(e.target.value))} min="1" max="50" required style={inputStyle} />
                </label>
                <button type="submit" style={{ gridColumn: 'span 2', marginTop: '8px', padding: '12px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563EB 0%, #9333EA 100%)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                    Add Satellite to Scenario
                </button>
            </form>
            <div style={{ marginTop: '16px', fontSize: '0.85rem', opacity: 0.7 }}>
                {scenario.length} objects configured · Keep under 10 objects to stay within rendering budget.
            </div>
        </div>
    );
}

const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '10px',
    color: '#fff'
};


