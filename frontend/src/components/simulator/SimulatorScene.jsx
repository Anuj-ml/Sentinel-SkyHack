import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const GRID_COLOR = '#24c4ff';

function HologramGlobe() {
    const [dayMap, normalMap] = useTexture([
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
    ]);
    const earthRef = useRef(null);
    useFrame(() => {
        if (earthRef.current) earthRef.current.rotation.y += 0.0006;
    });

    return (
        <group>
            <mesh ref={earthRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={dayMap}
                    normalMap={normalMap}
                    metalness={0.15}
                    roughness={0.3}
                    emissive="#031d3f"
                    emissiveIntensity={0.2}
                />
            </mesh>
            <mesh scale={[1.03, 1.03, 1.03]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial color="#13b7ff" transparent opacity={0.12} />
            </mesh>
        </group>
    );
}

function Satellite({ position, color = '#ffcc00', size = 0.02 }) {
    if (!position) return null;
    return (
        <mesh position={position}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
    );
}

export default function SimulatorScene({ frames = [], frameIndex = 0, mode = 'SIMULATION', objects = [], height = 420 }) {
    const activeFrame = frames[frameIndex] || { positions: [] };

    const renderedObjects = useMemo(() => {
        if (mode === 'TRACKING' && objects.length) {
            return objects.slice(0, 50).map((obj) => ({
                id: obj.id || obj.name,
                position: obj.positionVector || [0, 0, 0],
                color: '#89d4ff'
            }));
        }
        return activeFrame.positions.map((pos, idx) => ({
            id: pos.id || idx,
            position: [
                pos.position.x / 7000,
                pos.position.z / 7000,
                -pos.position.y / 7000
            ],
            color: '#ff7b72'
        }));
    }, [mode, objects, activeFrame]);

    return (
        <div
            style={{
                width: '100%',
                height,
                background: 'radial-gradient(circle at 20% 20%, rgba(21,57,99,0.55), #01020a)',
                borderRadius: '16px',
                overflow: 'hidden'
            }}
        >
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1.2} color="#c4eaff" />
                <pointLight position={[-6, -8, -4]} intensity={0.6} color="#1f6aff" />
                <Stars radius={60} depth={25} count={2500} factor={3} saturation={0} fade />
                <group scale={[1.25, 1.25, 1.25]}>
                    <HologramGlobe />
                </group>
                {renderedObjects.map((obj) => (
                    <Satellite key={obj.id} position={obj.position} color={obj.color} />
                ))}
                <OrbitControls enablePan={false} minDistance={1.3} maxDistance={10} />
            </Canvas>
        </div>
    );
}


