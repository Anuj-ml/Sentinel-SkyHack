# Sentinel - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │  Main App    │  │  Components  │      │
│  │   Page       │→ │  (3D Scene)  │  │  (UI Panels) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                 ↓                   ↓              │
│  ┌──────────────────────────────────────────────────┐       │
│  │        React Three Fiber (3D Rendering)          │       │
│  └──────────────────────────────────────────────────┘       │
│         ↓                                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │     Client-side Keplerian Orbital Propagation    │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js + Express)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  REST API    │  │  Data Layer  │  │  Collision   │      │
│  │  Endpoints   │→ │  (Keplerian) │  │  Detection   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │   Static Orbital Data (orbitalData.json)         │       │
│  │   - 260 Active Satellites                         │       │
│  │   - 1500 Debris Objects                           │       │
│  │   - 15 Satellite Collision Pairs                  │       │
│  │   - 38 Collision Warning Scenarios                │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Architecture

### Frontend Architecture

#### 1. **Core Application Layer** (`App.jsx`)
- **State Management**: React hooks for satellite data, time, selection
- **3D Scene Management**: React Three Fiber canvas
- **UI Orchestration**: Manages all UI panels and their interactions

#### 2. **3D Visualization Layer**
```
Canvas (React Three Fiber)
├── Globe.jsx (Earth with texture)
├── Atmosphere.jsx (Atmospheric glow)
├── OrbitPath.jsx (Satellite trajectories)
└── Billboard Sprites (Satellites & Debris)
```

**Technologies:**
- `@react-three/fiber`: React renderer for Three.js
- `@react-three/drei`: Useful helpers (OrbitControls, Billboard)
- `three.js`: 3D graphics library

#### 3. **UI Components Layer**

**Left Panel:**
```
SearchBar.jsx
├── Satellite search with dropdown
└── Debris visibility toggle

SortDropdown.jsx
└── Sort by Name/Hazards/Altitude

ComparisonPanel.jsx
└── Quick satellite stats

HazardList.jsx
└── Scrollable collision warnings

ManeuverSuggestion.jsx
├── Safe signal (no threats)
└── Maneuver recommendations
    ├── Delta-V calculations
    ├── Burn duration
    └── Alert broadcasting
```

**Right Panel:**
```
InfoPanel.jsx
├── Satellite name & type
├── Altitude, velocity, period
└── Current UTC time

RightPanel.jsx
├── Mission brief
└── Ground station passes

GroundStationPanel.jsx
└── Pass predictions
```

**Bottom Elements:**
```
TimeSlider.jsx (Bottom-left)
├── Playback controls
├── Speed adjustment
└── Time scrubbing

CollisionStrip.jsx (Bottom, fixed)
├── Total threat count
├── Severity indicator
└── Top 5 hazards preview
```

#### 4. **Physics Engine** (`keplerian.js`)
```javascript
// Simplified Keplerian orbital mechanics
function propagateKeplerian(satellite, time) {
  // Input: Orbital elements (radius, inclination, RAAN, phase)
  // Output: 3D position (x, y, z) in ECI coordinates
  
  1. Calculate mean anomaly from time
  2. Apply orbital rotation matrices
  3. Convert to Cartesian coordinates
  4. Return position vector
}
```

**Key Features:**
- Real-time propagation at any timestamp
- Support for time scrubbing
- Efficient client-side calculation
- Configurable time scale (0.0005x to 10x)

#### 5. **Data Management** (`useSatelliteData.js`)
```javascript
Custom React Hook
├── Fetch satellites & debris from backend
├── Parse orbital elements
├── Fetch collision predictions
└── Manage loading states
```

### Backend Architecture

#### 1. **Server Layer** (`server.js`)
```
Express.js REST API
├── GET /api/satellites → All satellite data
├── GET /api/debris → All debris data
├── POST /api/predict-hazard → Collision warnings
└── CORS enabled for frontend
```

#### 2. **Data Generation** (`generate_keplerian.js`)
```
Stochastic Data Generator
├── 260 Satellites (real names)
│   ├── ISS, Hubble, GPS constellation
│   └── Starlink, weather sats, etc.
│
├── Collision Scenarios
│   ├── 18% probability per satellite
│   ├── 4-10 debris per targeted satellite
│   ├── CRITICAL (direct) vs MODERATE (proximity)
│   └── 15 satellite-on-satellite collisions
│
└── 1500 Total Debris Objects
    ├── ~258 killer debris (targeted)
    └── ~1242 background debris
```

**Orbital Parameters:**
- Radius: 6700-8000 km (LEO)
- Inclination: 0-180°
- Phase randomization
- Realistic velocities (7-8 km/s)

#### 3. **Collision Detection Logic**
```
For each satellite:
1. Filter debris with matching targetId
2. Calculate:
   - Distance (0.1-50 km)
   - Time to collision (seconds)
   - Severity (CRITICAL < 5km, MODERATE > 5km)
3. Sort by:
   - Satellite collisions first
   - Then CRITICAL severity
   - Then MODERATE severity
   - Finally by distance
4. Return ALL hazards (no slicing)
```

## 🔄 Data Flow

### Initialization Flow
```
1. User lands on Landing.jsx
2. Click "Launch Tracker"
3. App.jsx:
   - useSatelliteData() fetches from backend
   - Parses 260 satellites + 1500 debris
4. 3D scene initializes with all objects
5. Client-side propagation starts
```

### Satellite Selection Flow
```
1. User searches/selects satellite
2. setSelectedSat() updates state
3. Triggered effects:
   - Fetch hazards for this satellite
   - Calculate orbit path
   - Update InfoPanel
   - Update HazardList
   - Update ManeuverSuggestion
4. 3D scene highlights selected satellite
```

### Time Scrubbing Flow
```
1. User drags TimeSlider
2. handleTimeChange() updates currentTime
3. useEffect triggers:
   - Recalculate all positions via propagateKeplerian()
   - Update globe rotation (GMST)
   - Update hazard distances
4. Re-render 3D scene with new positions
```

### Position Update Flow (Throttled)
```
Every 2 seconds:
1. positionUpdateTrigger increments
2. currentPositions useMemo recalculates:
   - For each satellite/debris:
     - propagateKeplerian(obj, currentTime)
     - Return new (x, y, z)
3. 3D scene updates positions
4. Hazard distances recalculated
```

## 🎨 Design System

### Material You Theme
```css
Colors:
- Primary: #4285F4 (Google Blue)
- Error/Critical: #ef4444 (Red)
- Warning/Moderate: #f59e0b (Orange)
- Satellite Collision: #9333ea (Purple)
- Success: #4caf50 (Green)

Glassmorphism:
- background: rgba(30, 30, 30, 0.7)
- backdrop-filter: blur(10px)
- border: 1px solid rgba(255, 255, 255, 0.1)
- border-radius: 8-12px
```

## 🚀 Performance Optimizations

1. **Position Update Throttling**: Only recalculate every 2 seconds
2. **useMemo**: Expensive calculations cached
3. **Lazy Rendering**: Only render visible objects
4. **Static Data**: Pre-generated orbital data (no live TLE fetches)
5. **Client-side Propagation**: No constant server requests

## 🔐 Security Considerations

- CORS enabled for frontend domain only
- No sensitive data exposed
- Static orbital data (no live tracking)
- Rate limiting recommended for production

## 📊 Scalability

**Current Limits:**
- 260 satellites
- 1500 debris objects
- ~260 collision warnings

**Can Scale To:**
- 10,000+ objects with InstancedMesh
- Real TLE fetches from CelesTrak/Space-Track
- WebSocket for real-time updates
- Database for persistent tracking

## 🧪 Testing Strategy

**Unit Tests:**
- `propagateKeplerian()` accuracy
- Collision detection logic
- Data parsing

**Integration Tests:**
- API endpoint responses
- Data flow satellite → hazards
- Time scrubbing functionality

**E2E Tests:**
- User journey: Landing → Selection → Collision Warning
- Time scrubbing
- Search functionality

## 🌐 Deployment Architecture

```
Production Setup:
├── Frontend: Vercel/Netlify
├── Backend: Railway/Render/Fly.io
└── CDN: Cloudflare (optional)

Development:
├── Frontend: Vite dev server (port 5173)
└── Backend: Node.js (port 3001)
```

## 📝 Future Enhancements

1. **Real TLE Integration**: Live data from CelesTrak
2. **Machine Learning**: Collision probability ML models
3. **Multi-user**: Collaborative tracking sessions
4. **Mobile App**: React Native version
5. **AR View**: Satellite AR visualization
6. **Historical Playback**: Rewind/replay past conjunctions
7. **Notifications**: Email/SMS collision alerts

## 🏆 Key Innovations

1. **Stochastic Collision System**: Dynamic, realistic threat scenarios
2. **Dual Severity Levels**: CRITICAL vs MODERATE warnings
3. **Satellite-on-Satellite**: Rare but critical collision type
4. **Maneuver Recommendations**: Delta-V calculations with alert broadcasting
5. **Time Travel**: Sub-second precision time scrubbing
6. **Material You**: Modern, beautiful UI aesthetic
