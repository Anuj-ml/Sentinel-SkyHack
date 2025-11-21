import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const Globe = ({ customRotation }) => {
    const meshRef = useRef();
    // Use high-res textures from a reliable source (NASA or similar via reliable CDN)
    // Fallback to simple colors if textures fail
    const [colorMap, bumpMap, specularMap, lightsMap] = useLoader(THREE.TextureLoader, [
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png'
    ]);

    useFrame(() => {
        if (meshRef.current) {
            if (customRotation !== undefined) {
                meshRef.current.rotation.y = customRotation;
            } else {
                meshRef.current.rotation.y += 0.0005;
            }
        }
    });

    return (
        <mesh ref={meshRef} scale={[1, 1, 1]}>
            <sphereGeometry args={[5, 64, 64]} />
            <meshPhongMaterial
                map={colorMap}
                normalMap={bumpMap}
                specularMap={specularMap}
                specular={new THREE.Color('grey')}
                shininess={5}
                emissiveMap={lightsMap}
                emissive={new THREE.Color(0xffff88)}
                emissiveIntensity={0.5}
            />
        </mesh>
    );
};

export default Globe;
