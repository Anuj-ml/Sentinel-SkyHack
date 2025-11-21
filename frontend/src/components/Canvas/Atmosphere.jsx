import React from 'react';
import * as THREE from 'three';

const Atmosphere = () => {
    return (
        <mesh scale={[1.1, 1.1, 1.1]}>
            <sphereGeometry args={[5, 64, 64]} />
            <meshBasicMaterial
                color="#4488ff"
                transparent
                opacity={0.1}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

export default Atmosphere;
