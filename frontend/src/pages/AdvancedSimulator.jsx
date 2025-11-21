import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Add Google Fonts for Orbitron and Roboto Mono
if (typeof document !== 'undefined') {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;700&family=Orbitron:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    if (!document.querySelector('link[href*="Roboto+Mono"]')) {
        document.head.appendChild(fontLink);
    }

    // Add animations CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.8); opacity: 0.7; }
        }
        @keyframes blink {
            50% { opacity: 0.5; }
        }
    `;
    if (!document.querySelector('style[data-simulator-animations]')) {
        style.setAttribute('data-simulator-animations', 'true');
        document.head.appendChild(style);
    }
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
    const [isPaused, setIsPaused] = useState(false);
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
    const [trainingData, setTrainingData] = useState([]);
    const [currentCollision, setCurrentCollision] = useState(null);
    const [objectName, setObjectName] = useState('');
    const [objectType, setObjectType] = useState('satellite');
    const [orbitPreset, setOrbitPreset] = useState('leo');
    const [celestrakCatalog, setCelestrakCatalog] = useState('');
    const [numCatalogObjects, setNumCatalogObjects] = useState(5);
    const [semiMajorAxis, setSemiMajorAxis] = useState(7000);
    const [inclination, setInclination] = useState(51.6);

    // Design tokens matching HTML
    const colors = {
        primary: '#00d8ff',
        danger: '#ff5252',
        success: '#00ff7f',
        warning: '#ffeb3b',
        bg: '#03050a',
        panelBg: 'rgba(10, 20, 35, 0.85)',
        borderColor: 'rgba(0, 216, 255, 0.2)',
        borderGlow: 'rgba(0, 216, 255, 0.5)',
    };

    const EARTH_RADIUS_3D = 100;

    // Initialize 3D scene
    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 1, 5000);
        camera.position.z = 400;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 150;
        controls.maxDistance = 1000;
        controlsRef.current = controls;

        scene.add(new THREE.AmbientLight(0x404040, 1.5));
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        sunLight.position.set(-2, 0.5, 1.5);
        scene.add(sunLight);

        const textureLoader = new THREE.TextureLoader();
        const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS_3D, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'),
            bumpMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'),
            bumpScale: 0.5,
            specularMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'),
            specular: new THREE.Color('grey')
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);

        const cloudsGeometry = new THREE.SphereGeometry(EARTH_RADIUS_3D + 1, 64, 64);
        const cloudsMaterial = new THREE.MeshPhongMaterial({
            map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'),
            transparent: true,
            opacity: 0.4
        });
        const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        scene.add(cloudsMesh);

        const starVertices = [];
        for (let i = 0; i < 10000; i++) starVertices.push(THREE.MathUtils.randFloatSpread(4000));
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
        scene.add(new THREE.Points(starGeometry, starMaterial));

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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Animation loop - runs continuously like HTML version
    useEffect(() => {
        const earthMeshRef = { current: null };
        const cloudsMeshRef = { current: null };
        
        const animate = () => {
            if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) {
                requestAnimationFrame(animate);
                return;
            }
            
            controlsRef.current.update();
            
            // Rotate earth and clouds
            if (!earthMeshRef.current) {
                earthMeshRef.current = sceneRef.current.children.find(obj => obj.type === 'Mesh' && obj.geometry.type === 'SphereGeometry' && !obj.material.transparent);
            }
            if (!cloudsMeshRef.current) {
                cloudsMeshRef.current = sceneRef.current.children.find(obj => obj.type === 'Mesh' && obj.geometry.type === 'SphereGeometry' && obj.material.transparent);
            }
            
            if (earthMeshRef.current) earthMeshRef.current.rotation.y += 0.0001 * timeMultiplier;
            if (cloudsMeshRef.current) cloudsMeshRef.current.rotation.y += 0.0002 * timeMultiplier;
            
            updateSatellitesAndCheckCollisions();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            requestAnimationFrame(animate);
        };
        
        const animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, [timeMultiplier]);

    const addSatellite = (name, type = 'satellite') => {
        const orbitRadius = EARTH_RADIUS_3D + 20 + Math.random() * 80;
        const angle = Math.random() * Math.PI * 2;

        const satMaterial = new THREE.SpriteMaterial({ color: type === 'satellite' ? 0x00ff7f : 0xff5252, depthTest: false });
        const satSprite = new THREE.Sprite(satMaterial);
        satSprite.scale.set(5, 5, 1);

        const curve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius, 0, 2 * Math.PI, false, 0);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(128));
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00d8ff, transparent: true, opacity: 0.3 });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

        const randomRotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI * 2, 0, 'XYZ');
        orbitLine.setRotationFromEuler(randomRotation);

        const satGroup = new THREE.Group();
        satGroup.add(satSprite);
        sceneRef.current.add(satGroup);
        sceneRef.current.add(orbitLine);

        const labelElement = document.createElement('div');
        labelElement.className = 'satellite-label';
        labelElement.textContent = name;
        labelElement.style.position = 'absolute';
        labelElement.style.color = 'white';
        labelElement.style.fontFamily = "'Roboto Mono', monospace";
        labelElement.style.fontSize = '12px';
        labelElement.style.padding = '2px 5px';
        labelElement.style.background = 'rgba(0,0,0,0.6)';
        labelElement.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        labelElement.style.borderRadius = '3px';
        labelElement.style.whiteSpace = 'nowrap';
        labelElement.style.pointerEvents = 'none';
        labelElement.style.willChange = 'transform';
        labelElement.style.transition = 'opacity 0.2s';
        labelsContainerRef.current.appendChild(labelElement);

        const sat = {
            name,
            type,
            angle,
            angularVelocity: 0.005 / (orbitRadius / 100),
            orbitRadius,
            orbitRotation: randomRotation,
            object3d: satGroup,
            orbitLine3d: orbitLine,
            sprite: satSprite,
            color: type === 'satellite' ? '#00ff7f' : '#ff5252',
            labelElement
        };

        setSatellites(prev => [...prev, sat]);
        log(`Added ${name} to orbit`, 'success');
    };

    const updateSatellitesAndCheckCollisions = () => {
        if (!cameraRef.current || !mountRef.current) return;
        
        const screenPositions = [];

        satellites.forEach(sat => {
            if (!isPaused) sat.angle += sat.angularVelocity * timeMultiplier;
            
            const pos = new THREE.Vector3(
                Math.cos(sat.angle) * sat.orbitRadius,
                Math.sin(sat.angle) * sat.orbitRadius,
                0
            ).applyEuler(sat.orbitRotation);
            
            sat.object3d.position.copy(pos);
            sat.sprite.material.color.set(sat.color === '#ffff00' ? 0xffff00 : (sat.type === 'satellite' ? 0x00ff7f : 0xff5252));
            
            const screenPos = pos.clone().project(cameraRef.current);
            screenPositions.push({
                x: (screenPos.x + 1) * mountRef.current.clientWidth / 2,
                y: (-screenPos.y + 1) * mountRef.current.clientHeight / 2,
                z: screenPos.z,
                sat: sat
            });
        });

        // Check collisions using screen-space distance
        for (let i = 0; i < screenPositions.length; i++) {
            for (let j = i + 1; j < screenPositions.length; j++) {
                const pos1 = screenPositions[i];
                const pos2 = screenPositions[j];
                const distance = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));

                if (distance < 15 && !currentCollision && (pos1.sat.type === 'satellite' || pos2.sat.type === 'satellite')) {
                    const sat1 = pos1.sat.type === 'satellite' ? pos1.sat : pos2.sat;
                    const sat2 = pos1.sat.type === 'satellite' ? pos2.sat : pos1.sat;
                    setCurrentCollision({ sat1, sat2, distance: distance.toFixed(1) });
                    log(`COLLISION ALERT: ${sat1.name} vs ${sat2.name}`, 'danger');
                    break;
                }
            }
            if (currentCollision) break;
        }

        // Update labels
        screenPositions.forEach(pos => {
            if (pos.z > 1) {
                pos.sat.labelElement.style.opacity = '0';
            } else {
                pos.sat.labelElement.style.opacity = '1';
                pos.sat.labelElement.style.left = pos.x + 'px';
                pos.sat.labelElement.style.top = pos.y + 'px';
                pos.sat.labelElement.style.transform = 'translate(-50%, 10px)';
            }
        });
    };

    const removeSatellite = (sat) => {
        sceneRef.current.remove(sat.object3d);
        sceneRef.current.remove(sat.orbitLine3d);
        if (sat.labelElement && sat.labelElement.parentNode) {
            labelsContainerRef.current.removeChild(sat.labelElement);
        }
        setSatellites(prev => prev.filter(s => s !== sat));
    };

    const executeAction = (actionId) => {
        if (!currentCollision) return;

        const actions = {
            1: { name: 'Prograde Burn', success: Math.random() > 0.05 },
            2: { name: 'Retrograde Burn', success: Math.random() > 0.10 },
            3: { name: 'Normal Burn', success: Math.random() > 0.15 },
            4: { name: 'Radial Burn', success: Math.random() > 0.20 },
            5: { name: 'Monitor Only', success: Math.random() < 0.1 },
            6: { name: 'Simulate Impact', success: false },
        };

        const action = actions[actionId];
        const outcome = action.success ? 'avoided' : 'collision';
        const reward = action.success ? 100 : -100;

        setTrainingData(prev => [...prev, {
            episode: statistics.maneuversCompleted,
            timestamp: new Date().toISOString(),
            action_name: action.name,
            outcome,
            reward
        }]);

        if (outcome === 'collision') {
            removeSatellite(currentCollision.sat1);
            removeSatellite(currentCollision.sat2);
            setStatistics(prev => ({ ...prev, activeCollisions: prev.activeCollisions + 1 }));
            log(`ACTION: ${action.name} -> COLLISION OCCURRED`, 'danger');
        } else {
            currentCollision.sat1.color = '#ffff00';
            setStatistics(prev => ({ ...prev, maneuversCompleted: prev.maneuversCompleted + 1 }));
            log(`ACTION: ${action.name} -> Collision avoided`, 'success');
        }

        setCurrentCollision(null);
    };

    const log = (message, type = 'info') => {
        const event = { id: Date.now(), timestamp: new Date(), message, type };
        setEventLog(prev => [event, ...prev.slice(0, 99)]);
    };

    const resetSimulation = () => {
        if (window.confirm('Are you sure you want to reset the simulation? This will clear all orbital objects.')) {
            satellites.forEach(removeSatellite);
            setSatellites([]);
            setCurrentCollision(null);
            setStatistics({ totalSatellites: 0, activeCollisions: 0, maneuversCompleted: 0, riskScore: 0 });
            log('Simulation reset', 'warning');
        }
    };

    const loadCelesTrak = async () => {
        if (!celestrakCatalog) {
            log('Please select a catalog', 'warning');
            return;
        }
        log(`Loading ${numCatalogObjects} objects from ${celestrakCatalog}...`, 'info');
        
        // Simulate loading with mock data
        const catalogTypes = {
            'stations': { prefix: 'STATION', type: 'satellite' },
            'active': { prefix: 'SAT', type: 'satellite' },
            'starlink': { prefix: 'STARLINK', type: 'satellite' },
            'debris': { prefix: 'DEBRIS', type: 'debris' }
        };
        
        const config = catalogTypes[celestrakCatalog] || { prefix: 'OBJ', type: 'satellite' };
        
        for (let i = 0; i < numCatalogObjects; i++) {
            const name = `${config.prefix}-${String(i + 1).padStart(3, '0')}`;
            addSatellite(name, config.type);
        }
        
        log(`Successfully loaded ${numCatalogObjects} objects from ${celestrakCatalog}`, 'success');
    };

    const analyzeConjunctions = () => {
        if (satellites.length < 2) {
            log('At least two objects required for analysis', 'warning');
            return;
        }
        log('Analyzing for high-risk conjunctions...', 'info');
        checkCollisions();
        if (!currentCollision) {
            log('No high-risk conjunctions found', 'success');
        }
    };

    const exportJSON = () => {
        const data = JSON.stringify(trainingData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `training_data_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        log('Exported training data as JSON', 'info');
    };

    const exportCSV = () => {
        if (trainingData.length === 0) { log('No data to export', 'warning'); return; }
        const headers = 'episode,timestamp,action_name,outcome,reward';
        const rows = trainingData.map(d => `${d.episode},${d.timestamp},${d.action_name},${d.outcome},${d.reward}`);
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `training_data_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        log('Exported training data as CSV', 'info');
    };

    const clearData = () => {
        if (window.confirm('Clear all training data? This cannot be undone.')) {
            setTrainingData([]);
            setStatistics(prev => ({ ...prev, maneuversCompleted: 0 }));
            log('Training data cleared', 'warning');
        }
    };

    useEffect(() => {
        setStatistics(prev => ({ ...prev, totalSatellites: satellites.length }));
    }, [satellites.length]);

    // Styles
    const styles = {
        container: { width: '100%', height: '100vh', overflow: 'hidden', fontFamily: "'Roboto Mono', monospace", background: colors.bg, color: '#e0e0e0', position: 'relative' },
        canvasContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 },
        scanline: { content: '', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)', pointerEvents: 'none', zIndex: 9999 },
        header: { position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to right, rgba(3, 5, 10, 0.9), rgba(15, 25, 45, 0.9))', borderBottom: `1px solid ${colors.borderColor}`, boxShadow: `0 2px 10px ${colors.borderGlow}`, display: 'flex', alignItems: 'center', padding: '0 30px', zIndex: 1000 },
        headerTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: '700', letterSpacing: '2px', color: colors.primary, textShadow: `0 0 8px ${colors.borderGlow}`, margin: 0 },
        statusIndicator: { width: '10px', height: '10px', borderRadius: '50%', background: colors.success, boxShadow: `0 0 10px ${colors.success}`, animation: 'pulse 1.5s infinite' },
        panel: { position: 'absolute', background: colors.panelBg, border: `1px solid ${colors.borderColor}`, backdropFilter: 'blur(12px)', boxShadow: '0 0 25px rgba(0, 0, 0, 0.7)', borderRadius: '0', padding: '20px', zIndex: 500 },
        corner: (pos) => ({ content: '""', position: 'absolute', width: '15px', height: '15px', borderColor: colors.primary, borderStyle: 'solid', ...(pos === 'tl' && { top: '-2px', left: '-2px', borderWidth: '2px 0 0 2px' }), ...(pos === 'tr' && { top: '-2px', right: '-2px', borderWidth: '2px 2px 0 0' }), ...(pos === 'bl' && { bottom: '-2px', left: '-2px', borderWidth: '0 0 2px 2px' }), ...(pos === 'br' && { bottom: '-2px', right: '-2px', borderWidth: '0 2px 2px 0' }) }),
        sectionTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: '14px', fontWeight: '400', color: colors.primary, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', paddingBottom: '8px', borderBottom: `1px solid ${colors.borderColor}`, display: 'flex', alignItems: 'center' },
        titleBar: { width: '4px', height: '16px', background: colors.primary, marginRight: '10px', boxShadow: `0 0 5px ${colors.primary}` },
        button: { width: '100%', padding: '12px 16px', background: 'transparent', border: `1px solid ${colors.primary}`, color: colors.primary, fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.3s ease', marginTop: '8px' },
        buttonDanger: { borderColor: colors.danger, color: colors.danger },
        label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontFamily: "'Roboto Mono', monospace" },
        input: { width: '100%', padding: '10px 12px', background: 'rgba(0, 0, 0, 0.3)', border: `1px solid ${colors.borderColor}`, color: '#e0e0e0', fontSize: '14px', fontFamily: "'Roboto Mono', monospace", transition: 'all 0.3s ease' },
        stats: { background: 'rgba(0, 0, 0, 0.3)', padding: '15px', borderLeft: `3px solid ${colors.primary}` },
        statRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' },
        statValue: { color: colors.success, fontWeight: '700', fontSize: '14px' },
        logConsole: { background: 'rgba(0, 0, 0, 0.5)', border: `1px solid ${colors.borderColor}`, padding: '12px', height: '250px', overflowY: 'auto', fontFamily: "'Roboto Mono', monospace", fontSize: '11px', lineHeight: '1.6' },
        collisionAlert: { background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.1), rgba(255, 82, 82, 0.2))', border: `2px solid ${colors.danger}`, padding: '15px', display: 'none', boxShadow: `0 0 20px ${colors.danger}`, marginBottom: '25px' },
        collisionAlertActive: { display: 'block' },
        alertTitle: { fontFamily: "'Orbitron', sans-serif", color: colors.danger, fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', textAlign: 'center', animation: 'blink 1s infinite' },
        collisionInfo: { background: 'rgba(0, 0, 0, 0.3)', padding: '10px', margin: '10px 0', fontFamily: "'Roboto Mono', monospace", fontSize: '12px', lineHeight: '1.8' },
    };

    return (
        <div style={styles.container}>
            <div style={styles.scanline}></div>

            <div style={styles.header}>
                <h1 style={styles.headerTitle}>ORBITAL COLLISION AVOIDANCE TRAINING SYSTEM</h1>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '30px', fontSize: '14px', fontFamily: "'Roboto Mono', monospace" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={styles.statusIndicator}></div>
                        <span>SYSTEM NOMINAL</span>
                    </div>
                    <div><span>{currentTime.toISOString().substr(11, 8)} UTC</span></div>
                </div>
            </div>

            <div id="canvas-container" style={styles.canvasContainer}>
                <div ref={mountRef} style={{ display: 'block', width: '100%', height: '100%', background: '#000' }}></div>
                <div ref={labelsContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}></div>
            </div>

            {/* Left Panel */}
            <div style={{ ...styles.panel, top: '80px', left: '20px', width: '350px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                <div style={styles.corner('tl')}></div>
                <div style={styles.corner('tr')}></div>
                <div style={styles.corner('bl')}></div>
                <div style={styles.corner('br')}></div>

                <div style={{ marginBottom: '25px' }}>
                    <div style={styles.sectionTitle}><div style={styles.titleBar}></div>ADD SATELLITE</div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={styles.label}>Object Name</label>
                        <input type="text" style={styles.input} value={objectName} onChange={(e) => setObjectName(e.target.value)} placeholder="SAT-001" />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={styles.label}>Type</label>
                        <select style={styles.input} value={objectType} onChange={(e) => setObjectType(e.target.value)}>
                            <option value="satellite">Satellite</option>
                            <option value="debris">Debris</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={styles.label}>Orbit Preset</label>
                        <select style={styles.input} value={orbitPreset} onChange={(e) => setOrbitPreset(e.target.value)}>
                            <option value="leo">LEO (Low Earth Orbit)</option>
                            <option value="meo">MEO (Medium Earth Orbit)</option>
                            <option value="geo">GEO (Geostationary)</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={styles.label}>Semi-Major Axis (km)</label>
                        <input type="number" style={styles.input} value={semiMajorAxis} onChange={(e) => setSemiMajorAxis(Number(e.target.value))} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={styles.label}>Inclination (°)</label>
                        <input type="number" style={styles.input} value={inclination} onChange={(e) => setInclination(Number(e.target.value))} />
                    </div>
                    <button style={styles.button} onClick={() => { addSatellite(objectName || `SAT-${String(satellites.length).padStart(3,'0')}`, objectType); setObjectName(''); }}>Add Object</button>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <div style={styles.sectionTitle}><div style={styles.titleBar}></div>TIME CONTROL</div>
                    <button style={styles.button} onClick={() => { setIsPaused(!isPaused); log(isPaused ? 'Simulation resumed' : 'Simulation paused', 'info'); }}>{isPaused ? 'Resume' : 'Pause'}</button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        {[1, 10, 100, 1000].map(speed => (
                            <button key={speed} style={{ ...styles.button, fontSize: '10px', padding: '8px 12px', marginTop: 0 }} onClick={() => { setTimeMultiplier(speed); log(`Time acceleration set to ${speed}x`, 'info'); }}>{speed}x</button>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: colors.primary }}>
                        SIMULATION RATE: <span>{timeMultiplier}x</span>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <div style={styles.sectionTitle}><div style={styles.titleBar}></div>SCENARIO CONTROL</div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={styles.label}>CelesTrak Catalog</label>
                        <select style={styles.input} value={celestrakCatalog} onChange={(e) => setCelestrakCatalog(e.target.value)}>
                            <option value="">Select Catalog...</option>
                            <option value="stations">Space Stations</option>
                            <option value="active">Active Satellites</option>
                            <option value="starlink">Starlink</option>
                            <option value="debris">Debris</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={styles.label}>Number of Objects</label>
                        <input type="number" style={styles.input} value={numCatalogObjects} onChange={(e) => setNumCatalogObjects(Number(e.target.value))} min="1" max="50" />
                    </div>
                    <button style={styles.button} onClick={loadCelesTrak}>Load from CelesTrak</button>
                    <button style={styles.button} onClick={analyzeConjunctions}>Analyze Conjunctions</button>
                    <button style={{ ...styles.button, ...styles.buttonDanger }} onClick={resetSimulation}>Reset Simulation</button>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <div style={styles.sectionTitle}><div style={styles.titleBar}></div>STATISTICS</div>
                    <div style={styles.stats}>
                        <div style={styles.statRow}><span>Objects in Orbit:</span><span style={styles.statValue}>{statistics.totalSatellites}</span></div>
                        <div style={styles.statRow}><span>Collisions:</span><span style={{ ...styles.statValue, color: colors.danger }}>{statistics.activeCollisions}</span></div>
                        <div style={styles.statRow}><span>Avoidances:</span><span style={styles.statValue}>{statistics.maneuversCompleted}</span></div>
                        <div style={styles.statRow}><span>Episodes:</span><span style={styles.statValue}>{trainingData.length}</span></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                        <button style={{ ...styles.button, fontSize: '10px', padding: '8px 12px', marginTop: 0 }} onClick={exportJSON}>Export JSON</button>
                        <button style={{ ...styles.button, fontSize: '10px', padding: '8px 12px', marginTop: 0 }} onClick={exportCSV}>Export CSV</button>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ ...styles.panel, top: '80px', right: '20px', width: '350px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                <div style={styles.corner('tl')}></div>
                <div style={styles.corner('tr')}></div>
                <div style={styles.corner('bl')}></div>
                <div style={styles.corner('br')}></div>

                <div style={{ position: 'relative' }}>
                    <div style={currentCollision ? { ...styles.collisionAlert, ...styles.collisionAlertActive } : styles.collisionAlert}>
                        <div style={styles.alertTitle}>CRITICAL CONJUNCTION</div>
                        <div style={styles.collisionInfo}>
                            {currentCollision && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span>PRIMARY:</span><span style={{ color: colors.success, fontWeight: '700' }}>{currentCollision.sat1.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span>CONJUNCTION:</span><span style={{ color: colors.success, fontWeight: '700' }}>{currentCollision.sat2.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                        <span>PROXIMITY:</span><span style={{ color: colors.success, fontWeight: '700' }}>{currentCollision.distance} px</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                            {[
                                { id: 1, text: 'Prograde Burn' },
                                { id: 2, text: 'Retrograde' },
                                { id: 3, text: 'Normal Burn' },
                                { id: 4, text: 'Radial Burn' },
                                { id: 5, text: 'Monitor', color: colors.warning },
                                { id: 6, text: 'Simulate Impact', danger: true }
                            ].map(action => (
                                <button
                                    key={action.id}
                                    style={{ ...styles.button, ...(action.danger && styles.buttonDanger), ...(action.color && { borderColor: action.color, color: action.color }), fontSize: '10px', padding: '8px 12px', marginTop: 0 }}
                                    onClick={() => executeAction(action.id)}
                                >
                                    {action.text}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <div style={styles.sectionTitle}><div style={styles.titleBar}></div>EVENT LOG</div>
                        <div style={styles.logConsole}>
                        {eventLog.map(event => (
                            <div key={event.id} style={{ marginBottom: '4px' }}>
                                <span style={{ color: colors.primary }}>[{event.timestamp.toLocaleTimeString()}]</span>{' '}
                                <span style={{ color: event.type === 'danger' ? colors.danger : event.type === 'success' ? colors.success : event.type === 'warning' ? colors.warning : '#87cefa' }}>
                                    {event.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div style={styles.sectionTitle}><div style={styles.titleBar}></div>TRAINING DATA</div>
                    <div style={styles.stats}>
                        <div style={styles.statRow}><span>Data Points:</span><span style={styles.statValue}>{trainingData.length}</span></div>
                    </div>
                    <div style={{ fontSize: '10px', marginTop: '10px', fontFamily: "'Roboto Mono', monospace" }}>
                        {trainingData.slice(-5).reverse().map((d, i) => (
                            <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid rgba(100,150,200,0.1)', color: d.outcome === 'collision' ? colors.danger : colors.success }}>
                                EP {d.episode}: {d.action_name} → {d.outcome.toUpperCase()} [R:{d.reward}]
                            </div>
                        ))}
                    </div>
                    <button style={{ ...styles.button, ...styles.buttonDanger, marginTop: '10px' }} onClick={clearData}>Clear Training Data</button>
                </div>
                </div>
            </div>
        </div>
    );
}
