import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

const SCALE_FACTOR = 5 / 6371;

const OrbitPath = ({ points, color = '#ffffff' }) => {
    const scaledPoints = useMemo(() => {
        return points.map(p => new THREE.Vector3(
            p.x * SCALE_FACTOR,
            p.z * SCALE_FACTOR,
            -p.y * SCALE_FACTOR
        ));
    }, [points]);

    if (!points || points.length < 2) return null;

    // Split points into Past (first half) and Future (second half)
    // Assuming points are ordered chronologically and center is "now"
    // Actually, App.jsx generates -60 to +60 mins. So index 60 is "now".

    const midPoint = Math.floor(points.length / 2);
    const pastPoints = scaledPoints.slice(0, midPoint + 1);
    const futurePoints = scaledPoints.slice(midPoint);

    return (
        <group>
            {/* Past Trail - Cool Color */}
            <Line
                points={pastPoints}
                color="#00ccff" // Cyan
                lineWidth={2}
                transparent
                opacity={0.6}
            />
            {/* Future Trail - Warm Color */}
            <Line
                points={futurePoints}
                color="#ffaa00" // Orange
                lineWidth={2}
                transparent
                opacity={0.6}
            />
        </group>
    );
};

export default OrbitPath;
