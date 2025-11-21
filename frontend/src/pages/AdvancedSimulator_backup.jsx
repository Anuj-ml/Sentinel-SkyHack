import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Add Google Fonts for Orbitron and Roboto Mono
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;700&family=Orbitron:wght@400;700&display=swap';
fontLink.rel = 'stylesheet';
if (!document.querySelector('link[href*="Roboto+Mono"]')) {
    document.head.appendChild(fontLink);
}

export default function AdvancedSimulator({ onBack, onLaunchTracker }) {
    // 3D Scene Setup
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const labelsContainerRef = useRef(null);

    // State Management
    const [satellites, setSatellites] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [collisions, setCollisions] = useState([]);
    const [eventLog, setEventLog] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeMultiplier, setTimeMultiplier] = useState(1);
    const [animationId, setAnimationId] = useState(null);
    const [statistics, setStatistics] = useState({
        totalSatellites: 0,
        activeCollisions: 0,
        maneuversCompleted: 0,
        riskScore: 0
    });

    // Training data
    const [trainingData, setTrainingData] = useState([]);
    const [selectedSatellite, setSelectedSatellite] = useState(null);

    // Initialize 3D scene
    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 50000);
        camera.position.set(0, 0, 15000);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 30000;
        controls.minDistance = 6500;
        controlsRef.current = controls;

        // Earth
        const earthGeometry = new THREE.SphereGeometry(6371, 64, 64);
        const earthTexture = new THREE.TextureLoader().load('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDUxMiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiMxMzQ4N0YiLz48L3N2Zz4=');
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            transparent: true,
            opacity: 0.9
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);

        // Atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(6471, 32, 32);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-1, 0, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Stars background
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
        const starVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 50000;
            const y = (Math.random() - 0.5) * 50000;
            const z = (Math.random() - 0.5) * 50000;
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Handle resize
        const handleResize = () => {
            if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
            
            cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && rendererRef.current?.domElement) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current?.dispose();
        };
    }, []);

    // Update animation when running state changes
    useEffect(() => {
        if (isRunning) {
            const animate = () => {
                if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
                
                controlsRef.current.update();
                updateSatellitePositions();
                checkCollisions();
                updateLabels();
                rendererRef.current.render(sceneRef.current, cameraRef.current);
                
                if (isRunning) {
                    const id = requestAnimationFrame(animate);
                    setAnimationId(id);
                }
            };
            animate();
        } else if (animationId) {
            cancelAnimationFrame(animationId);
            setAnimationId(null);
        }
    }, [isRunning]);

    // Satellite management functions
    const addSatellite = (params = {}) => {
        const satellite = {
            id: Date.now() + Math.random(),
            name: params.name || `SAT-${satellites.length + 1}`,
            altitude: params.altitude || (400 + Math.random() * 1200),
            inclination: params.inclination || (Math.random() * 180),
            raan: params.raan || (Math.random() * 360),
            argPe: params.argPe || (Math.random() * 360),
            trueAnomaly: params.trueAnomaly || (Math.random() * 360),
            eccentricity: params.eccentricity || (Math.random() * 0.1),
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            mesh: null,
            orbitPath: null,
            label: null,
            riskLevel: 'low',
            collisionProbability: 0,
            lastManeuver: null
        };

        // Create satellite mesh
        const geometry = new THREE.SphereGeometry(20, 8, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x00ff88 });
        const mesh = new THREE.Mesh(geometry, material);
        satellite.mesh = mesh;
        sceneRef.current.add(mesh);

        // Create orbit path
        const orbitPoints = calculateOrbitPoints(satellite);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, opacity: 0.6, transparent: true });
        const orbitPath = new THREE.Line(orbitGeometry, orbitMaterial);
        satellite.orbitPath = orbitPath;
        sceneRef.current.add(orbitPath);

        setSatellites(prev => [...prev, satellite]);
        updateStatistics();
        logEvent(`Added satellite: ${satellite.name}`);
    };

    const removeSatellite = (satelliteId) => {
        setSatellites(prev => {
            const satellite = prev.find(s => s.id === satelliteId);
            if (satellite) {
                sceneRef.current.remove(satellite.mesh);
                sceneRef.current.remove(satellite.orbitPath);
                logEvent(`Removed satellite: ${satellite.name}`);
            }
            return prev.filter(s => s.id !== satelliteId);
        });
        updateStatistics();
    };

    const calculateOrbitPoints = (satellite) => {
        const points = [];
        const R = 6371 + satellite.altitude;
        
        for (let i = 0; i <= 360; i += 5) {
            const angle = (i * Math.PI) / 180;
            const x = R * Math.cos(angle);
            const y = 0;
            const z = R * Math.sin(angle);
            
            // Apply orbital elements transformations (simplified)
            const incRad = (satellite.inclination * Math.PI) / 180;
            const raanRad = (satellite.raan * Math.PI) / 180;
            
            const point = new THREE.Vector3(x, y, z);
            point.applyAxisAngle(new THREE.Vector3(1, 0, 0), incRad);
            point.applyAxisAngle(new THREE.Vector3(0, 1, 0), raanRad);
            
            points.push(point);
        }
        
        return points;
    };

    const updateSatellitePositions = () => {
        if (!isRunning) return;

        const time = Date.now() * 0.001 * timeMultiplier;
        
        setSatellites(prev => prev.map(satellite => {
            if (!satellite.mesh) return satellite;

            const R = 6371 + satellite.altitude;
            const angle = time * 0.001 + (satellite.trueAnomaly * Math.PI) / 180;
            
            const x = R * Math.cos(angle);
            const y = 0;
            const z = R * Math.sin(angle);
            
            // Apply orbital transformations
            const incRad = (satellite.inclination * Math.PI) / 180;
            const raanRad = (satellite.raan * Math.PI) / 180;
            
            const position = new THREE.Vector3(x, y, z);
            position.applyAxisAngle(new THREE.Vector3(1, 0, 0), incRad);
            position.applyAxisAngle(new THREE.Vector3(0, 1, 0), raanRad);
            
            satellite.position.copy(position);
            satellite.mesh.position.copy(position);
            
            return satellite;
        }));

        setCurrentTime(new Date(Date.now() + time * 1000));
    };

    const checkCollisions = () => {
        if (!isRunning) return;

        const newCollisions = [];
        
        for (let i = 0; i < satellites.length; i++) {
            for (let j = i + 1; j < satellites.length; j++) {
                const sat1 = satellites[i];
                const sat2 = satellites[j];
                
                if (!sat1.mesh || !sat2.mesh) continue;
                
                const distance = sat1.position.distanceTo(sat2.position);
                const collisionThreshold = 100; // km
                
                if (distance < collisionThreshold) {
                    const collision = {
                        id: `${sat1.id}-${sat2.id}`,
                        satellite1: sat1,
                        satellite2: sat2,
                        distance,
                        probability: Math.max(0, 1 - (distance / collisionThreshold)),
                        timestamp: new Date()
                    };
                    
                    newCollisions.push(collision);
                    
                    // Update satellite colors
                    sat1.mesh.material.color.setHex(0xff4444);
                    sat2.mesh.material.color.setHex(0xff4444);
                    
                    sat1.riskLevel = 'high';
                    sat2.riskLevel = 'high';
                    sat1.collisionProbability = collision.probability;
                    sat2.collisionProbability = collision.probability;
                }
            }
        }
        
        setCollisions(newCollisions);
        
        if (newCollisions.length > 0 && collisions.length === 0) {
            logEvent(`COLLISION ALERT: ${newCollisions.length} potential collision(s) detected!`);
        }
    };

    const updateLabels = () => {
        if (!labelsContainerRef.current) return;

        // Clear existing labels
        labelsContainerRef.current.innerHTML = '';

        satellites.forEach(satellite => {
            if (!satellite.mesh || !cameraRef.current || !rendererRef.current) return;

            // Project 3D position to screen coordinates
            const vector = satellite.position.clone();
            vector.project(cameraRef.current);

            const x = (vector.x * 0.5 + 0.5) * mountRef.current.clientWidth;
            const y = (vector.y * -0.5 + 0.5) * mountRef.current.clientHeight;

            // Create label element
            const label = document.createElement('div');
            label.className = 'satellite-label';
            label.style.position = 'absolute';
            label.style.left = x + 'px';
            label.style.top = y + 'px';
            label.style.color = '#fff';
            label.style.fontSize = '12px';
            label.style.padding = '2px 6px';
            label.style.background = 'rgba(0,0,0,0.7)';
            label.style.borderRadius = '4px';
            label.style.pointerEvents = 'none';
            label.style.transform = 'translate(-50%, -50%)';
            label.innerHTML = `${satellite.name}<br/>Alt: ${satellite.altitude.toFixed(0)}km`;

            if (satellite.riskLevel === 'high') {
                label.style.background = 'rgba(255,68,68,0.8)';
                label.innerHTML += `<br/>Risk: ${(satellite.collisionProbability * 100).toFixed(1)}%`;
            }

            labelsContainerRef.current.appendChild(label);
        });
    };

    const performManeuver = (satelliteId, maneuverType) => {
        setSatellites(prev => prev.map(satellite => {
            if (satellite.id !== satelliteId) return satellite;

            let deltaV = 0;
            let description = '';

            switch (maneuverType) {
                case 'altitude_increase':
                    satellite.altitude += 50;
                    deltaV = 2.5;
                    description = 'Altitude increase (+50km)';
                    break;
                case 'altitude_decrease':
                    satellite.altitude -= 50;
                    deltaV = 2.3;
                    description = 'Altitude decrease (-50km)';
                    break;
                case 'inclination_change':
                    satellite.inclination += 5;
                    deltaV = 15.2;
                    description = 'Inclination change (+5°)';
                    break;
                case 'phase_adjust':
                    satellite.trueAnomaly += 30;
                    deltaV = 1.8;
                    description = 'Phase adjustment (+30°)';
                    break;
            }

            satellite.lastManeuver = {
                type: maneuverType,
                description,
                deltaV,
                timestamp: new Date()
            };

            // Reset risk status
            satellite.riskLevel = 'low';
            satellite.collisionProbability = 0;
            if (satellite.mesh) {
                satellite.mesh.material.color.setHex(0x00ff88);
            }

            // Update orbit path
            if (satellite.orbitPath) {
                sceneRef.current.remove(satellite.orbitPath);
                const orbitPoints = calculateOrbitPoints(satellite);
                const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
                const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, opacity: 0.6, transparent: true });
                satellite.orbitPath = new THREE.Line(orbitGeometry, orbitMaterial);
                sceneRef.current.add(satellite.orbitPath);
            }

            logEvent(`Maneuver executed: ${satellite.name} - ${description} (ΔV: ${deltaV} m/s)`);
            
            // Add to training data
            setTrainingData(prev => [...prev, {
                timestamp: new Date(),
                satelliteId: satellite.id,
                satelliteName: satellite.name,
                maneuverType,
                description,
                deltaV,
                preManeuverRisk: satellite.collisionProbability,
                postManeuverRisk: 0,
                orbitalElements: {
                    altitude: satellite.altitude,
                    inclination: satellite.inclination,
                    raan: satellite.raan,
                    argPe: satellite.argPe,
                    trueAnomaly: satellite.trueAnomaly,
                    eccentricity: satellite.eccentricity
                }
            }]);

            setStatistics(prev => ({
                ...prev,
                maneuversCompleted: prev.maneuversCompleted + 1
            }));

            return satellite;
        }));
    };

    const logEvent = (message) => {
        const event = {
            id: Date.now(),
            timestamp: new Date(),
            message
        };
        setEventLog(prev => [event, ...prev.slice(0, 99)]);
    };

    const updateStatistics = () => {
        setStatistics(prev => ({
            ...prev,
            totalSatellites: satellites.length,
            activeCollisions: collisions.length,
            riskScore: collisions.length > 0 ? Math.max(...collisions.map(c => c.probability)) * 100 : 0
        }));
    };

    const loadFromCelesTrak = async () => {
        try {
            // Simulate CelesTrak data loading
            logEvent('Loading data from CelesTrak...');
            
            const mockSatellites = [
                { name: 'ISS', altitude: 408, inclination: 51.6, raan: 45, argPe: 0, trueAnomaly: 0, eccentricity: 0.0003 },
                { name: 'HUBBLE', altitude: 547, inclination: 28.5, raan: 120, argPe: 0, trueAnomaly: 90, eccentricity: 0.0002 },
                { name: 'GPS-IIF-1', altitude: 20200, inclination: 55, raan: 200, argPe: 0, trueAnomaly: 180, eccentricity: 0.01 },
                { name: 'STARLINK-1007', altitude: 550, inclination: 53, raan: 300, argPe: 0, trueAnomaly: 270, eccentricity: 0.0001 }
            ];
            
            mockSatellites.forEach(sat => addSatellite(sat));
            logEvent(`Loaded ${mockSatellites.length} satellites from CelesTrak`);
        } catch (error) {
            logEvent(`Error loading CelesTrak data: ${error.message}`);
        }
    };

    const exportTrainingData = () => {
        const data = {
            exportTime: new Date().toISOString(),
            statistics,
            trainingData,
            eventLog: eventLog.slice(0, 50),
            satellites: satellites.map(sat => ({
                name: sat.name,
                orbitalElements: {
                    altitude: sat.altitude,
                    inclination: sat.inclination,
                    raan: sat.raan,
                    argPe: sat.argPe,
                    trueAnomaly: sat.trueAnomaly,
                    eccentricity: sat.eccentricity
                },
                riskLevel: sat.riskLevel,
                collisionProbability: sat.collisionProbability,
                lastManeuver: sat.lastManeuver
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orbital_training_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        logEvent('Training data exported successfully');
    };

    const resetSimulation = () => {
        satellites.forEach(satellite => {
            if (satellite.mesh) sceneRef.current.remove(satellite.mesh);
            if (satellite.orbitPath) sceneRef.current.remove(satellite.orbitPath);
        });
        
        setSatellites([]);
        setCollisions([]);
        setEventLog([]);
        setTrainingData([]);
        setIsRunning(false);
        setStatistics({
            totalSatellites: 0,
            activeCollisions: 0,
            maneuversCompleted: 0,
            riskScore: 0
        });
        
        logEvent('Simulation reset');
    };

    // Styles matching the HTML design
    const primaryColor = '#00d8ff';
    const dangerColor = '#ff5252';
    const successColor = '#00ff7f';
    const warningColor = '#ffeb3b';
    const bgColor = '#03050a';
    const panelBg = 'rgba(10, 20, 35, 0.85)';
    const borderColor = 'rgba(0, 216, 255, 0.2)';
    const borderGlow = 'rgba(0, 216, 255, 0.5)';

    const buttonStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'transparent',
        border: `1px solid ${primaryColor}`,
        color: primaryColor,
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '12px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '8px',
        position: 'relative',
    };

    const buttonHoverStyle = {
        background: borderGlow,
        color: bgColor,
        boxShadow: `0 0 15px ${borderGlow}`,
    };

    const panelStyle = {
        position: 'relative',
        background: panelBg,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 25px rgba(0, 0, 0, 0.7)',
        borderRadius: '0',
    };

    const cornerDecoration = (position) => ({
        content: '""',
        position: 'absolute',
        width: '15px',
        height: '15px',
        borderColor: primaryColor,
        borderStyle: 'solid',
        ...(position === 'tl' && { top: '-2px', left: '-2px', borderWidth: '2px 0 0 2px' }),
        ...(position === 'tr' && { top: '-2px', right: '-2px', borderWidth: '2px 2px 0 0' }),
        ...(position === 'bl' && { bottom: '-2px', left: '-2px', borderWidth: '0 0 2px 2px' }),
        ...(position === 'br' && { bottom: '-2px', right: '-2px', borderWidth: '0 2px 2px 0' }),
    });

    const sectionTitleStyle = {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '14px',
        fontWeight: '400',
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '15px',
        paddingBottom: '8px',
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: `1px solid ${borderColor}`,
        color: '#e0e0e0',
        fontSize: '14px',
        fontFamily: "'Roboto Mono', monospace",
        transition: 'all 0.3s ease',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        color: '#b0b0b0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '6px',
        fontFamily: "'Roboto Mono', monospace",
    };

    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            overflow: 'hidden',
            fontFamily: "'Roboto Mono', monospace", 
            background: bgColor, 
            color: '#e0e0e0',
            position: 'relative'
        }}>
            {/* Scanline overlay effect */}
            <div style={{
                content: '',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
                pointerEvents: 'none',
                zIndex: 9999,
            }}></div>

            {/* Header */}
            <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(to right, rgba(3, 5, 10, 0.9), rgba(15, 25, 45, 0.9))',
                borderBottom: `1px solid ${borderColor}`,
                boxShadow: `0 2px 10px ${borderGlow}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 30px',
                zIndex: 1000,
            }}>
                <h1 style={{ 
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '20px',
                    fontWeight: '700',
                    letterSpacing: '2px',
                    color: primaryColor,
                    textShadow: `0 0 8px ${borderGlow}`,
                    margin: 0,
                }}>
                    ORBITAL COLLISION AVOIDANCE TRAINING SYSTEM
                </h1>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '30px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: successColor,
                            boxShadow: `0 0 10px ${successColor}`,
                            animation: 'pulse 1.5s infinite',
                        }}></div>
                        <span>SYSTEM NOMINAL</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{currentTime.toLocaleTimeString()} UTC</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', height: 'calc(100vh - 60px)', marginTop: '60px' }}>
                {/* Left Panel */}
                <div style={{ 
                    ...panelStyle,
                    position: 'absolute',
                    top: '80px',
                    left: '20px',
                    width: '350px',
                    maxHeight: 'calc(100vh - 100px)',
                    overflow: 'auto',
                    padding: '20px',
                }}>
                    {/* Corner decorations */}
                    <div style={{...cornerDecoration('tl'), position: 'absolute'}}></div>
                    <div style={{...cornerDecoration('tr'), position: 'absolute'}}></div>
                    <div style={{...cornerDecoration('bl'), position: 'absolute'}}></div>
                    <div style={{...cornerDecoration('br'), position: 'absolute'}}></div>

                    {/* Control Panel */}
                    <div style={{ marginBottom: '25px' }}>
                        <div style={sectionTitleStyle}>
                            <div style={{ width: '4px', height: '16px', background: primaryColor, marginRight: '10px', boxShadow: `0 0 5px ${primaryColor}` }}></div>
                            TIME CONTROL
                        </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <button 
                                    onClick={() => setIsRunning(!isRunning)} 
                                    style={{
                                        ...buttonStyle,
                                        background: isRunning ? 'linear-gradient(45deg, #ff4444, #cc0000)' : 'linear-gradient(45deg, #4ade80, #16a34a)',
                                        flex: 1
                                    }}
                                >
                                    {isRunning ? '⏸️ Pause' : '▶️ Start'}
                                </button>
                                <button onClick={resetSimulation} style={{...buttonStyle, background: 'linear-gradient(45deg, #f59e0b, #d97706)'}}>
                                    🔄 Reset
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button onClick={() => addSatellite()} style={{...buttonStyle, background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)'}}>
                                    ➕ Add Satellite
                                </button>
                                <button onClick={loadFromCelesTrak} style={{...buttonStyle, background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)'}}>
                                    📡 CelesTrak
                                </button>
                            </div>
                        </div>

                        {/* Time Controls */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#64ffda' }}>⏰ Time Control</h3>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Time Multiplier: {timeMultiplier}x</label>
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="10" 
                                    step="0.1" 
                                    value={timeMultiplier} 
                                    onChange={(e) => setTimeMultiplier(parseFloat(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                Current Time: {currentTime.toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Statistics */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#64ffda' }}>📊 Mission Stats</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                <div style={statCardStyle}>
                                    <div style={{ opacity: 0.7 }}>Satellites</div>
                                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{statistics.totalSatellites}</div>
                                </div>
                                <div style={statCardStyle}>
                                    <div style={{ opacity: 0.7 }}>Collisions</div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: statistics.activeCollisions > 0 ? '#ff4444' : '#4ade80' }}>
                                        {statistics.activeCollisions}
                                    </div>
                                </div>
                                <div style={statCardStyle}>
                                    <div style={{ opacity: 0.7 }}>Maneuvers</div>
                                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{statistics.maneuversCompleted}</div>
                                </div>
                                <div style={statCardStyle}>
                                    <div style={{ opacity: 0.7 }}>Risk Score</div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: statistics.riskScore > 50 ? '#ff4444' : '#4ade80' }}>
                                        {statistics.riskScore.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Satellite List */}
                        <div>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#64ffda' }}>🛰️ Active Satellites</h3>
                            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                {satellites.map(satellite => (
                                    <div key={satellite.id} style={{
                                        padding: '12px',
                                        background: satellite.riskLevel === 'high' ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                                        border: satellite.riskLevel === 'high' ? '1px solid rgba(255, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        fontSize: '12px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '600' }}>{satellite.name}</span>
                                            <button 
                                                onClick={() => removeSatellite(satellite.id)} 
                                                style={{ background: 'rgba(255,68,68,0.3)', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div style={{ opacity: 0.7, marginBottom: '8px' }}>
                                            Alt: {satellite.altitude.toFixed(0)}km | Inc: {satellite.inclination.toFixed(1)}°
                                        </div>
                                        {satellite.riskLevel === 'high' && (
                                            <div style={{ color: '#ff4444', fontWeight: '600', marginBottom: '8px' }}>
                                                ⚠️ COLLISION RISK: {(satellite.collisionProbability * 100).toFixed(1)}%
                                            </div>
                                        )}
                                        {satellite.riskLevel === 'high' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                                <button onClick={() => performManeuver(satellite.id, 'altitude_increase')} style={maneuverButtonStyle}>
                                                    ⬆️ Alt+
                                                </button>
                                                <button onClick={() => performManeuver(satellite.id, 'altitude_decrease')} style={maneuverButtonStyle}>
                                                    ⬇️ Alt-
                                                </button>
                                                <button onClick={() => performManeuver(satellite.id, 'inclination_change')} style={maneuverButtonStyle}>
                                                    📐 Inc+
                                                </button>
                                                <button onClick={() => performManeuver(satellite.id, 'phase_adjust')} style={maneuverButtonStyle}>
                                                    🔄 Phase
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3D Visualization */}
                <div style={{ flex: 1, position: 'relative', background: '#000011' }}>
                    <div ref={mountRef} style={{ width: '100%', height: '100%' }}></div>
                    <div ref={labelsContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}></div>
                    
                    {/* Overlay Controls */}
                    <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px' }}>
                        <div style={{
                            background: 'rgba(0,0,0,0.8)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ color: '#64ffda', fontWeight: '600', marginBottom: '4px' }}>🎯 View Controls</div>
                            <div style={{ opacity: 0.8 }}>Mouse: Orbit | Wheel: Zoom</div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div style={{ width: '300px', background: 'rgba(0,0,0,0.4)', borderLeft: '1px solid rgba(255,255,255,0.1)', overflow: 'auto' }}>
                    <div style={{ padding: '20px' }}>
                        {/* Collision Alerts */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#ff4444' }}>⚠️ Collision Alerts</h3>
                            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                                {collisions.length === 0 ? (
                                    <div style={{ padding: '16px', textAlign: 'center', opacity: 0.6, fontSize: '12px' }}>
                                        ✅ No active collision threats
                                    </div>
                                ) : (
                                    collisions.map(collision => (
                                        <div key={collision.id} style={{
                                            padding: '12px',
                                            background: 'rgba(255, 68, 68, 0.2)',
                                            border: '1px solid rgba(255, 68, 68, 0.5)',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            fontSize: '12px'
                                        }}>
                                            <div style={{ fontWeight: '600', color: '#ff4444', marginBottom: '4px' }}>
                                                🚨 HIGH RISK
                                            </div>
                                            <div style={{ marginBottom: '4px' }}>
                                                {collision.satellite1.name} ↔ {collision.satellite2.name}
                                            </div>
                                            <div style={{ opacity: 0.8 }}>
                                                Distance: {collision.distance.toFixed(1)}km
                                            </div>
                                            <div style={{ opacity: 0.8 }}>
                                                Risk: {(collision.probability * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Event Log */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#64ffda' }}>📋 Event Log</h3>
                            <div style={{ maxHeight: '250px', overflow: 'auto', fontSize: '11px' }}>
                                {eventLog.map(event => (
                                    <div key={event.id} style={{
                                        padding: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        marginBottom: '4px',
                                        borderLeft: event.message.includes('COLLISION') ? '3px solid #ff4444' : event.message.includes('Maneuver') ? '3px solid #4ade80' : '3px solid #64ffda'
                                    }}>
                                        <div style={{ opacity: 0.6, fontSize: '10px', marginBottom: '2px' }}>
                                            {event.timestamp.toLocaleTimeString()}
                                        </div>
                                        <div>{event.message}</div>
                                    </div>
                                ))}
                                {eventLog.length === 0 && (
                                    <div style={{ padding: '16px', textAlign: 'center', opacity: 0.6 }}>
                                        No events recorded
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Training Data Export */}
                        <div>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#64ffda' }}>📊 Training Data</h3>
                            <div style={{ marginBottom: '12px', fontSize: '12px', opacity: 0.8 }}>
                                {trainingData.length} maneuver records collected
                            </div>
                            <button onClick={exportTrainingData} style={{
                                ...buttonStyle,
                                background: 'linear-gradient(45deg, #64ffda, #1de9b6)',
                                color: '#000',
                                width: '100%'
                            }}>
                                💾 Export Training Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}