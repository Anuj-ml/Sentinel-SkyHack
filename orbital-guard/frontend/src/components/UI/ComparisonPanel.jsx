import React, { useState } from 'react';

const ComparisonPanel = ({ satellites, selectedSat }) => {
    const [sat1Id, setSat1Id] = useState(selectedSat ? selectedSat.id : '');
    const [sat2Id, setSat2Id] = useState('');

    // Update sat1 if selection changes externally
    React.useEffect(() => {
        if (selectedSat) setSat1Id(selectedSat.id);
    }, [selectedSat]);

    const sat1 = satellites.find(s => s.id === sat1Id);
    const sat2 = satellites.find(s => s.id === sat2Id);

    return (
        <div className="glass-panel" style={{ padding: '20px', marginTop: '12px', width: '360px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 500 }}>Compare Satellites</h3>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <select
                    value={sat1Id}
                    onChange={(e) => setSat1Id(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'var(--md-sys-color-surface-container)',
                        color: 'var(--md-sys-color-on-surface)',
                        border: '1px solid var(--glass-border)',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                >
                    <option value="">Select Sat A</option>
                    {satellites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                    value={sat2Id}
                    onChange={(e) => setSat2Id(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'var(--md-sys-color-surface-container)',
                        color: 'var(--md-sys-color-on-surface)',
                        border: '1px solid var(--glass-border)',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                >
                    <option value="">Select Sat B</option>
                    {satellites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {sat1 && sat2 && (
                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ paddingBottom: '8px', fontWeight: 500 }}>Metric</th>
                            <th style={{ paddingBottom: '8px', fontWeight: 500 }}>{sat1.name.substring(0, 8)}</th>
                            <th style={{ paddingBottom: '8px', fontWeight: 500 }}>{sat2.name.substring(0, 8)}</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontFamily: 'var(--font-mono)' }}>
                        <tr>
                            <td style={{ padding: '8px 0', color: 'var(--md-sys-color-on-surface-variant)' }}>Alt (km)</td>
                            <td style={{ padding: '8px 0', color: 'var(--md-sys-color-primary)' }}>{(sat1.radius - 6371).toFixed(0)}</td>
                            <td style={{ padding: '8px 0', color: 'var(--md-sys-color-secondary)' }}>{(sat2.radius - 6371).toFixed(0)}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px 0', color: 'var(--md-sys-color-on-surface-variant)' }}>Inc (°)</td>
                            <td style={{ padding: '8px 0' }}>{(sat1.inclination * 180 / Math.PI).toFixed(1)}</td>
                            <td style={{ padding: '8px 0' }}>{(sat2.inclination * 180 / Math.PI).toFixed(1)}</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ComparisonPanel;
