import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';

const Earth = () => {
    const meshRef = useRef();

    // Load only the main earth texture
    const colorMap = useTexture('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.0005;
        }
    });

    return (
        <group>
            {/* Earth Sphere */}
            <mesh ref={meshRef} scale={2.5}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={colorMap}
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>

            {/* Atmosphere Glow */}
            <mesh scale={2.58}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial
                    color="#4db2ff"
                    transparent
                    opacity={0.15}
                    side={2} // DoubleSide
                />
            </mesh>
        </group>
    );
};

const RealisticGlobe = () => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1.8} color="#ffffff" />
                <directionalLight position={[-5, 3, 5]} intensity={0.6} />

                <Suspense fallback={null}>
                    <Earth />
                </Suspense>

                <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={0.5} />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default RealisticGlobe;
