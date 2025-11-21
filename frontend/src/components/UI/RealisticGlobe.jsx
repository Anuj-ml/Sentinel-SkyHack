import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const DebrisField = () => {
    const count = 200;
    const debrisData = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const r = 1.3 + Math.random() * 0.8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            const position = new THREE.Vector3(x, y, z);
            const randomVec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            const axis = new THREE.Vector3().crossVectors(position, randomVec).normalize();

            temp.push({
                initialPosition: position,
                axis,
                speed: 0.05 + Math.random() * 0.15,
                scale: 0.005 + Math.random() * 0.008,
                colorPhase: Math.random()
            });
        }
        return temp;
    }, []);

    const meshRef = useRef(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        debrisData.forEach((debris, i) => {
            const currentPos = debris.initialPosition.clone();
            currentPos.applyAxisAngle(debris.axis, t * debris.speed);

            dummy.position.copy(currentPos);
            dummy.rotation.x = t * 2 + debris.colorPhase;
            dummy.rotation.y = t * 3;

            dummy.scale.setScalar(debris.scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#FF2A6D" />
        </instancedMesh>
    );
};

const SatelliteModel = ({ color, isSelected }) => {
    const groupRef = useRef(null);
    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.01;
        }
    });

    const panelColor = '#1a237e';
    return (
        <group ref={groupRef} scale={isSelected ? 1.5 : 1}>
            <mesh>
                <boxGeometry args={[0.08, 0.1, 0.08]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.8}
                    emissive={color}
                    emissiveIntensity={isSelected ? 0.5 : 0.2}
                />
            </mesh>
            <group position={[-0.14, 0, 0]}>
                <mesh>
                    <boxGeometry args={[0.2, 0.08, 0.01]} />
                    <meshStandardMaterial color={panelColor} roughness={0.2} metalness={0.5} />
                </mesh>
                <mesh position={[0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
                    <meshStandardMaterial color="#888" />
                </mesh>
            </group>
            <group position={[0.14, 0, 0]}>
                <mesh>
                    <boxGeometry args={[0.2, 0.08, 0.01]} />
                    <meshStandardMaterial color={panelColor} roughness={0.2} metalness={0.5} />
                </mesh>
                <mesh position={[-0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
                    <meshStandardMaterial color="#888" />
                </mesh>
            </group>
            <mesh position={[0, 0.06, 0]}>
                <coneGeometry args={[0.02, 0.04, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
};

const SatelliteMarker = ({ satellite, isSelected }) => {
    const ref = useRef(null);
    const radius = 1.4 + ((satellite?.altitude || 0) / 12000);
    const speed = ((satellite?.velocity || 7.5) / 10) * 0.1;
    const inclinationRad = ((satellite?.inclination || 0) * Math.PI) / 180;
    const idComponent = satellite?.id ? parseInt((satellite.id.split('-')[1] || '0'), 10) : 0;
    const initialAngle = idComponent * (Math.PI / 2.5);

    let color = '#00F0FF';
    if (isSelected) {
        const isRisk = ['High', 'Critical', 'CRITICAL'].includes(satellite?.riskLevel);
        color = isRisk ? '#FF2A6D' : '#00FF9D';
    }

    const points = useMemo(() => {
        const pts = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = z * Math.sin(inclinationRad);
            const zRot = z * Math.cos(inclinationRad);
            pts.push(new THREE.Vector3(x, y, zRot));
        }
        return pts;
    }, [radius, inclinationRad]);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime();
        const angle = initialAngle + t * speed;
        const x = Math.cos(angle) * radius;
        const zRaw = Math.sin(angle) * radius;
        const y = zRaw * Math.sin(inclinationRad);
        const z = zRaw * Math.cos(inclinationRad);
        ref.current.position.set(x, y, z);
        ref.current.lookAt(0, 0, 0);
    });

    return (
        <group>
            <Line
                points={points}
                color={isSelected ? color : '#1C2237'}
                lineWidth={isSelected ? 2 : 1}
                transparent
                opacity={isSelected ? 0.8 : 0.3}
            />
            <group ref={ref}>
                <SatelliteModel color={color} isSelected={isSelected} />
            </group>
        </group>
    );
};

const TexturedEarth = () => {
    const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
    ]);

    const earthRef = useRef(null);
    const cloudsRef = useRef(null);

    useFrame(() => {
        if (earthRef.current) earthRef.current.rotation.y += 0.0005;
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0007;
    });

    return (
        <group>
            <mesh ref={earthRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    metalness={0.1}
                    roughness={0.35}
                    emissive={'#0c1b4d'}
                    emissiveIntensity={0.25}
                    envMapIntensity={0.8}
                />
            </mesh>
            <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent
                    opacity={0.55}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

const FallbackEarth = () => (
    <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
            color="#1C2237"
            emissive="#051a45"
            emissiveIntensity={0.8}
            roughness={0.6}
            metalness={0.3}
        />
    </mesh>
);

const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '320px',
    background: 'transparent',
    overflow: 'hidden',
    position: 'relative'
};

const RealisticGlobe = ({ satellites = [], selectedSatellite = null }) => {
    return (
        <div style={containerStyle}>
            <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }}>
                <ambientLight intensity={0.85} color="#cfe2ff" />
                <directionalLight position={[5, 8, 5]} intensity={1.4} color="#ffffff" />
                <directionalLight position={[-6, -4, -3]} intensity={0.6} color="#9cc0ff" />
                <pointLight position={[0, -5, 5]} intensity={0.4} color="#89a6ff" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <group rotation={[0.2, 0, 0]} scale={[1.5, 1.5, 1.5]}>
                    <Suspense fallback={<FallbackEarth />}>
                        <TexturedEarth />
                </Suspense>
                    <DebrisField />
                    {satellites.map((sat) => (
                        <SatelliteMarker
                            key={sat.id || sat.name}
                            satellite={sat}
                            isSelected={selectedSatellite?.id === sat.id}
                        />
                    ))}
                </group>

                <OrbitControls
                    enableZoom
                    enablePan={false}
                    autoRotate={!selectedSatellite}
                    autoRotateSpeed={0.5}
                    minDistance={1.5}
                    maxDistance={8}
                />
            </Canvas>
        </div>
    );
};

export default RealisticGlobe;
