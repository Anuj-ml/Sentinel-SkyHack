import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const Globe = ({ customRotation }) => {
    const meshRef = useRef();

    // Load Textures (Using public URLs for demo, ideally local assets)
    // Blue Marble textures
    const [colorMap, bumpMap, specularMap] = useLoader(THREE.TextureLoader, [
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        'https://unpkg.com/three-globe/example/img/earth-topology.png',
        'https://unpkg.com/three-globe/example/img/earth-water.png'
    ]);

    const material = useMemo(() => {
        return new THREE.MeshPhongMaterial({
            map: colorMap,
            bumpMap: bumpMap,
            bumpScale: 0.05,
            specularMap: specularMap,
            specular: new THREE.Color('grey'),
            shininess: 10
        });
    }, [colorMap, bumpMap, specularMap]);

    useFrame(() => {
        if (meshRef.current && customRotation === undefined) {
            meshRef.current.rotation.y += 0.0005;
        }
        if (meshRef.current && customRotation !== undefined) {
            meshRef.current.rotation.y = customRotation;
        }
    });

    return (
        <mesh ref={meshRef} scale={[1, 1, 1]}>
            <sphereGeometry args={[5, 64, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
};

export default Globe;
