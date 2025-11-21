import React, { useMemo } from 'react';
import * as THREE from 'three';

const OrbitPath = ({ points, color = "#ff007a" }) => {
    const geometry = useMemo(() => {
        try {
            if (!points || points.length < 2) return null;

            const positions = new Float32Array(points.length * 3);
            points.forEach((point, i) => {
                if (point && Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z)) {
                    positions[i * 3] = point.x;
                    positions[i * 3 + 1] = point.y;
                    positions[i * 3 + 2] = point.z;
                } else {
                    positions[i * 3] = 0;
                    positions[i * 3 + 1] = 0;
                    positions[i * 3 + 2] = 0;
                }
            });

            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            return geom;
        } catch (error) {
            console.error('OrbitPath geometry error:', error);
            return null;
        }
    }, [points]);

    if (!geometry) return null;

    try {
        return (
            <line geometry={geometry} renderOrder={999}>
                <lineBasicMaterial color={color} transparent opacity={1} linewidth={3} depthTest={false} />
            </line>
        );
    } catch (error) {
        console.error('OrbitPath render error:', error);
        return null;
    }
};

export default OrbitPath;

