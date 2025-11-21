import React, { useState, useMemo, useEffect, useRef, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { safePropagate } from './utils/orbitalUtils';
import Globe from './components/Canvas/Globe';
import Atmosphere from './components/Canvas/Atmosphere';
import OrbitPath from './components/Canvas/OrbitPath';
import SatelliteSwarm from './components/Canvas/SatelliteSwarm';
import SearchBar from './components/UI/SearchBar';
import LeftPanel from './components/UI/LeftPanel';
import RightPanel from './components/UI/RightPanel';
import ComparisonPanel from './components/UI/ComparisonPanel';
import HazardList from './components/UI/HazardList';
import ManeuverSuggestion from './components/UI/ManeuverSuggestion';
import CollisionStrip from './components/UI/CollisionStrip';
import Landing from './components/UI/Landing';
import AdvancedSimulator from './pages/AdvancedSimulator';
import TimeSlider from './components/UI/TimeSlider';
import { useSatelliteData } from './hooks/useSatelliteData';
import SortDropdown from './components/UI/SortDropdown';
import FilterDropdown from './components/UI/FilterDropdown';

// Safe PostProcessing Wrapper - Handles errors gracefully
const SafeEffectComposer = React.memo(({ children }) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        const errorHandler = (error) => {
            console.error('PostProcessing error:', error);
            setHasError(true);
        };
        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
    }, []);

    if (hasError) return null;

    return <EffectComposer multisampling={0} disableNormalPass={true}>{children}</EffectComposer>;
});

// Error Boundary Component
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'black',
                    color: 'white',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>Render Error</h2>
                    <p style={{ marginBottom: '10px' }}>{this.state.error?.message || 'Unknown error'}</p>
                    <pre style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '20px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        maxWidth: '800px',
                        overflow: 'auto'
                    }}>
                        {this.state.error?.stack}
                    </pre>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            background: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    const [view, setView] = useState('landing');
    const [showDebris, setShowDebris] = useState(false);
    const [selectedSat, setSelectedSat] = useState(null);
    const [hazards, setHazards] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [filterBy, setFilterBy] = useState('ALL'); // New Filter State
    const [timeScale, setTimeScale] = useState(0.0005);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isPlaying, setIsPlaying] = useState(true);
    const [postProcessingEnabled, setPostProcessingEnabled] = useState(false);

    const { satellites, debris, getHazards, loading } = useSatelliteData();

    // Throttle position updates for performance
    const POSITION_UPDATE_INTERVAL = 2000; // Update every 2 seconds
    const lastUpdateRef = useRef(0);
    const [positionUpdateTrigger, setPositionUpdateTrigger] = useState(0);

    // Animation Loop for Time
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                const now = Date.now();

                // Update time every 100ms for smooth display
                setCurrentTime(prev => new Date(prev.getTime() + 100 * timeScale));

                // Trigger position recalculation only every POSITION_UPDATE_INTERVAL
                if (now - lastUpdateRef.current > POSITION_UPDATE_INTERVAL) {
                    setPositionUpdateTrigger(prev => prev + 1);
                    lastUpdateRef.current = now;
                }
            }, 100); // Update every 100ms
        }
        return () => clearInterval(interval);
    }, [isPlaying, timeScale]);

    const handleSelectSat = async (sat) => {
        setSelectedSat(sat);
        const hazardData = await getHazards(sat.name);
        setHazards(hazardData);
    };

    const handleTimeChange = (newTime) => {
        setCurrentTime(newTime);
    };

    // Helper to determine satellite type
    const getSatelliteType = (sat) => {
        if (sat.type === 'DEBRIS') return 'DEBRIS';
        const name = (sat.name || "").toUpperCase();
        if (name.includes('GPS') || name.includes('GALILEO') || name.includes('GLONASS') || name.includes('BEIDOU')) return 'GPS';
        if (name.includes('STARLINK') || name.includes('ONEWEB') || name.includes('IRIDIUM')) return 'STARLINK'; // Or COMMUNICATION
        if (name.includes('GOES') || name.includes('NOAA') || name.includes('METOP')) return 'WEATHER';
        return 'COMMUNICATION'; // Default fallback
    };

    // Calculate Positions & Update Hazards (throttled for performance)
    const currentPositions = useMemo(() => {
        if (!satellites || !debris || satellites.length === 0) {
            return [];
        }

        let allObjects = [...satellites, ...debris];

        // Apply Filtering
        if (filterBy !== 'ALL') {
            allObjects = allObjects.filter(obj => {
                const type = getSatelliteType(obj);
                if (filterBy === 'DEBRIS') return obj.type === 'DEBRIS'; // Explicit debris check
                if (filterBy === 'STARLINK') return type === 'STARLINK';
                if (filterBy === 'GPS') return type === 'GPS';
                if (filterBy === 'COMMUNICATION') return type === 'COMMUNICATION' || type === 'STARLINK'; // Starlink is comms too
                if (filterBy === 'WEATHER') return type === 'WEATHER';
                return true;
            });
        }

        // Update Hazard Distances if selected
        if (selectedSat && hazards.length > 0) {
            const satPos = safePropagate(selectedSat, currentTime);
        }

        return allObjects
            .filter(obj => obj && obj.radius) // Filter out invalid objects
            .map(obj => {
                const pos = safePropagate(obj, currentTime);
                // Validate positions
                if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y) || !Number.isFinite(pos.z)) {
                    return null;
                }
                return { ...obj, x: pos.x, y: pos.y, z: pos.z };
            })
            .filter(pos => pos !== null); // Remove invalid positions
    }, [satellites, debris, positionUpdateTrigger, currentTime, selectedSat, hazards, filterBy]);

    // Effect to update hazard distances periodically (e.g. every 100ms) for UI
    useEffect(() => {
        if (!selectedSat || hazards.length === 0) return;

        const timer = setInterval(() => {
            setHazards(prevHazards => {
                const satPos = safePropagate(selectedSat, currentTime);
                return prevHazards.map(h => {
                    const debrisObj = debris.find(d => d.name === h.debrisName);
                    if (!debrisObj) return h;
                    const debPos = safePropagate(debrisObj, currentTime);
                    const dist = Math.sqrt(
                        Math.pow(satPos.x - debPos.x, 2) +
                        Math.pow(satPos.y - debPos.y, 2) +
                        Math.pow(satPos.z - debPos.z, 2)
                    );
                    return { ...h, distance: dist };
                }).sort((a, b) => a.distance - b.distance);
            });
        }, 200); // 5fps update for UI text
        return () => clearInterval(timer);
    }, [currentTime, selectedSat]);

    // Calculate Earth Rotation (Simple approximation for Keplerian mode)
    const earthRotation = useMemo(() => {
        const t = currentTime.getTime() / 1000;
        const rotation = (t / 86400) * 2 * Math.PI;

        // Theme Logic
        const hour = currentTime.getUTCHours();
        const isNight = hour < 6 || hour > 18;
        document.documentElement.className = isNight ? 'dark' : 'light';

        return rotation;
    }, [currentTime]);

    // Calculate Orbit Path (Keplerian)
    const orbitPathPoints = useMemo(() => {
        if (!selectedSat) return [];
        const points = [];
        const mu = 398600;
        const a = selectedSat.radius;
        const period = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu); // seconds

        // Generate 200 points for smoother orbit
        const startTime = currentTime.getTime();
        const scale = 5 / 6371; // Match Globe scale
        for (let i = 0; i <= 200; i++) {
            const t = startTime + (i / 200) * period * 1000; // ms
            const timeObj = new Date(t);
            const pos = safePropagate(selectedSat, timeObj);

            // Apply same coordinate transformation as SatelliteSwarm
            const x = pos.x * scale;
            const y = pos.z * scale; // Swap Y and Z for visual orientation
            const z = -pos.y * scale;

            points.push(new THREE.Vector3(x, y, z));
        }
        return points;
    }, [selectedSat, currentTime]);

    useEffect(() => {
        if (view === 'landing') {
            document.body.classList.add('landing-active');
            document.body.classList.remove('tracker-active');
        } else if (view === 'tracker') {
            document.body.classList.add('tracker-active');
            document.body.classList.remove('landing-active');
        } else {
            document.body.classList.remove('landing-active');
            document.body.classList.remove('tracker-active');
        }
    }, [view]);

    return (
        <ErrorBoundary>
            {view === 'landing' ? (
                <Landing
                    onInitialize={() => setView('tracker')}
                    onToggleDebris={setShowDebris}
                    showDebris={showDebris}
                    onOpenSimulator={() => setView('simulator')}
                />
            ) : view === 'simulator' ? (
                <AdvancedSimulator
                    onBack={() => setView('landing')}
                    onLaunchTracker={() => setView('tracker')}
                />
            ) : (loading) ? (
                <div style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '20px',
                    color: 'white',
                    background: 'black'
                }}>
                    <div style={{ fontSize: '1.5rem' }}>Loading orbital data...</div>
                    <div style={{ width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : (satellites.length === 0) ? (
                <div style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '20px',
                    color: 'white',
                    background: 'black',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.5rem', color: '#ff4444' }}>Failed to load orbital data</div>
                    <p style={{ color: '#9aa0a6' }}>Please check if the backend server is running.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
                    {/* UI Overlay - Z-Index 50 to force on top */}
                    <div
                        className="ui-layer"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 50,
                            pointerEvents: 'none', // Let clicks pass through to canvas where no UI exists
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        {/* Top Bar */}
                        <div style={{ padding: '20px', pointerEvents: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {/* Left Side: Search + Comparison */}
                            <LeftPanel
                                currentPositions={currentPositions}
                                handleSelectSat={handleSelectSat}
                                showDebris={showDebris}
                                setShowDebris={setShowDebris}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                filterBy={filterBy}
                                setFilterBy={setFilterBy}
                                satellites={satellites}
                                selectedSat={selectedSat}
                                hazards={hazards}
                                onBack={() => setView('landing')}
                            />

                            {/* Right Side: Info + Education + Ground Stations */}
                            <RightPanel selectedSat={selectedSat} currentTime={currentTime} />
                        </div>

                        {/* Bottom Bar */}
                        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', width: '100%' }}>
                            {/* Time Slider - Positioned Bottom RIGHT (left of ground stations) */}
                            <div style={{
                                position: 'fixed',
                                bottom: hazards && hazards.length > 0 ? '80px' : '20px', // Above bar when hazards exist
                                right: '820px', // 720px + 100px more
                                width: '320px',
                                maxWidth: '90vw',
                                zIndex: 60 // Above hazard bar
                            }}>
                                <TimeSlider
                                    currentTime={currentTime}
                                    onTimeChange={handleTimeChange}
                                    isPlaying={isPlaying}
                                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                                />
                            </div>

                            {/* Collision Strip (Full Width) */}
                            <CollisionStrip hazards={hazards} />
                            
                            {/* Advanced Simulator Button - Bottom Right */}
                            <div style={{
                                position: 'fixed',
                                bottom: '20px',
                                right: '20px',
                                zIndex: 60
                            }}>
                                <button
                                    onClick={() => window.location.href = '/AdvancedSimulator.html'}
                                    title="Advanced Collision Simulator"
                                    style={{
                                        padding: '12px 20px',
                                        background: 'rgba(37,99,235,0.9)',
                                        color: '#fff',
                                        border: '1px solid rgba(37,99,235,0.3)',
                                        borderRadius: '999px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        pointerEvents: 'auto',
                                        boxShadow: '0 4px 15px rgba(37,99,235,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>science</span>
                                    Advanced Simulator
                                </button>
                            </div>
                        </div>
                    </div>
                    <Canvas
                        camera={{ position: [0, 0, 18], fov: 45 }}
                        onPointerMissed={() => setSelectedSat(null)}
                        gl={{ toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
                        onCreated={(state) => {
                            // Disable postprocessing if WebGL context is lost
                            if (state.gl && state.gl.getContext().isContextLost) {
                                setPostProcessingEnabled(false);
                            }
                        }}
                    >
                        <ambientLight intensity={0.1} />
                        <pointLight position={[50, 0, 20]} intensity={1.5} />
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                        <group>
                            <Globe customRotation={earthRotation} />
                            <Atmosphere />

                            <SatelliteSwarm
                                positions={currentPositions}
                                selectedSat={selectedSat}
                                hazards={hazards || []}
                                onSelect={handleSelectSat}
                                showDebris={showDebris}
                            />

                            {selectedSat && selectedSat.type !== 'DEBRIS' && orbitPathPoints.length > 0 && (
                                <OrbitPath
                                    points={orbitPathPoints}
                                    color={selectedSat.type === 'DEBRIS' ? '#ff0000' : '#ffff00'}
                                />
                            )}
                        </group>

                        <OrbitControls enablePan={false} minDistance={7} maxDistance={30} enabled={true} />

                        {postProcessingEnabled && (
                            <SafeEffectComposer>
                                <Bloom
                                    luminanceThreshold={0.2}
                                    luminanceSmoothing={0.9}
                                    height={300}
                                    intensity={1.5}
                                />
                                <Vignette eskil={false} offset={0.1} darkness={1.1} />
                            </SafeEffectComposer>
                        )}
                    </Canvas>
                </div>
            )}
        </ErrorBoundary>
    );
}

export default App;
