import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Globe from '../Canvas/Globe';
import Atmosphere from '../Canvas/Atmosphere';

const LandingGlobe = () => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} />

                <Suspense fallback={null}>
                    <group position={[0, 0, 0]} rotation={[0, 0, 0.2]}> {/* Centered with tilt */}
                        <mesh scale={[2, 2, 2]}> {/* Adjusted scale */}
                            <sphereGeometry args={[4.5, 48, 48]} />
                            <meshStandardMaterial
                                color="#ffffff"
                                emissive="#ffffff"
                                emissiveIntensity={0.1}
                                wireframe
                                transparent
                                opacity={0.2}
                            />
                        </mesh>
                        {/* Inner solid core for contrast */}
                        <mesh scale={[1.95, 1.95, 1.95]}>
                            <sphereGeometry args={[4.5, 64, 64]} />
                            <meshBasicMaterial color="#050505" />
                        </mesh>
                    </group>
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    enablePan={false}
                    enableDamping
                />
            </Canvas>
        </div>
    );
};

export default LandingGlobe;
