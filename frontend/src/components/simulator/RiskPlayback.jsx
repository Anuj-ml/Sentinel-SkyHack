import React, { useMemo } from 'react';

export default function RiskPlayback({ events = [], summary, frameIndex = 0, onFrameChange, totalFrames = 0 }) {
    const topEvents = useMemo(() => {
        return [...events]
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 4);
    }, [events]);

    return (
        <div style={{ background: 'rgba(5,5,10,0.85)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Risk Timeline</p>
                    <h3 style={{ margin: 0 }}>Conjunction Playback</h3>
                </div>
                {summary && (
                    <div style={{ textAlign: 'right', fontSize: '0.85rem', opacity: 0.8 }}>
                        <div>{summary.durationMinutes} min window</div>
                        <div>{summary.conjunctions} conjunctions</div>
                    </div>
                )}
            </div>
            <input
                type="range"
                min={0}
                max={Math.max(totalFrames - 1, 0)}
                value={frameIndex}
                onChange={(e) => onFrameChange?.(parseInt(e.target.value, 10))}
                style={{ width: '100%' }}
            />
            <div style={{ marginTop: '16px', fontSize: '0.85rem', opacity: 0.8 }}>
                Frame {frameIndex + 1} / {Math.max(totalFrames, 1)}
            </div>
            <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
                {topEvents.length === 0 && <div style={{ opacity: 0.6 }}>No conjunctions detected in the current window.</div>}
                {topEvents.map((event) => (
                    <div key={`${event.actors.join('-')}-${event.time}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <strong>{event.actors.join(' vs ')}</strong>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{(event.time / 60).toFixed(1)} min</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div>{event.distance} km</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Conjunction</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


