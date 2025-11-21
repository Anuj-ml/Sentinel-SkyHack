import React from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

const SatelliteSwarm = ({ positions, selectedSat, hazards, onSelect, showDebris }) => {
    if (!positions || positions.length === 0) {
        return null;
    }

    try {
        return (
            <group>
                {positions.map((pos, index) => {
                    if (!pos || typeof pos !== 'object') return null;
                    
                    const isDebris = pos.type === 'debris';
                    if (!showDebris && isDebris) return null;

                    // Scale positions from km to Globe coordinate system (Globe radius = 5, Earth radius = 6371 km)
                    const scale = 5 / 6371;
                    const x = (Number.isFinite(pos.x) ? pos.x : 0) * scale;
                    const y = (Number.isFinite(pos.z) ? pos.z : 0) * scale;
                    const z = -(Number.isFinite(pos.y) ? pos.y : 0) * scale;

                    // Validate positions are finite
                    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
                        return null;
                    }

                    const isSelected = selectedSat?.name === pos.name;

                    // Focus/Blur Logic
                    let opacity = 0.8;
                    let isBlurred = false;

                    if (selectedSat) {
                        const isHazard = hazards && hazards.some ? hazards.some(h => h.debrisName === pos.name) : false;
                        if (isSelected || isHazard) {
                            opacity = 1.0;
                        } else {
                            opacity = 0.1; // Blur effect
                            isBlurred = true;
                        }
                    }

                    // Color Coding
                    let color = '#ffffff';
                    if (isDebris) {
                        color = '#888888'; // Grey for passive debris
                        if (selectedSat && hazards && hazards.some && hazards.some(h => h.debrisName === pos.name)) {
                            color = '#ff0000'; // Red for HAZARD
                        }
                    } else {
                        // Satellite Color Coding
                        const name = pos.name || '';
                        if (name.includes('GPS') || name.includes('NAV')) color = '#ffff00'; // Yellow
                        else if (name.includes('STARLINK') || name.includes('IRIDIUM')) color = '#00ff00'; // Green
                        else if (name.includes('GOES') || name.includes('NOAA') || name.includes('SENTINEL')) color = '#a020f0'; // Purple
                    }

                    if (isSelected) color = '#ff007a'; // Override for selected

                    return (
                        <Billboard
                            key={pos.id || pos.name || `obj-${index}`}
                            position={[x, y, z]}
                            follow={true}
                            lockX={false}
                            lockY={false}
                            lockZ={false}
                        >
                            <mesh onClick={(e) => {
                                e.stopPropagation();
                                if (onSelect && typeof onSelect === 'function') {
                                    onSelect(pos);
                                }
                            }}>
                                {isDebris ? (
                                    <planeGeometry args={[0.05, 0.05]} />
                                ) : (
                                    <planeGeometry args={[0.15, 0.15]} />
                                )}
                                <meshBasicMaterial
                                    color={color}
                                    transparent
                                    opacity={opacity}
                                    side={THREE.DoubleSide}
                                    depthWrite={!isBlurred}
                                    toneMapped={false}
                                />
                            </mesh>
                        </Billboard>
                    );
                }).filter(Boolean)}
            </group>
        );
    } catch (error) {
        console.error('SatelliteSwarm render error:', error);
        return null;
    }
};

export default SatelliteSwarm;
