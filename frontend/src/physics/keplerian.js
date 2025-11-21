// Simple Keplerian Propagator for Circular Orbits
export function propagateKeplerian(orbit, time) {
    // Time is a Date object.
    // We need a time delta from some epoch.
    // Let's assume epoch is "now" (when data was generated) or just use raw time for animation.
    // For simplicity: Use time.getTime() (ms) scaled to simulation speed.

    const t = time.getTime() / 1000; // seconds

    // Mean Anomaly M = M0 + n * t
    // Calculate Mean Motion (n) based on Radius (r) for circular orbit
    // n = sqrt(mu / r^3)
    // mu = 398600 km^3/s^2
    const mu = 398600;
    const n = Math.sqrt(mu / Math.pow(orbit.radius, 3)); // rad/s

    const M = orbit.phase + n * t;

    // Circular Orbit (e=0)
    // r = radius
    // Position in Orbital Plane (PQW frame):
    // x_orb = r * cos(M)
    // y_orb = r * sin(M)
    // z_orb = 0

    const r = orbit.radius;
    const x_orb = r * Math.cos(M);
    const y_orb = r * Math.sin(M);

    // Rotate to ECI Frame using Inclination (i) and RAAN (O)
    // 3D Rotation Matrix for orbital elements:
    // x = x_orb * (cosO) - y_orb * (sinO * cosi)
    // y = x_orb * (sinO) + y_orb * (cosO * cosi)
    // z = y_orb * (sini)

    const O = orbit.raan;
    const i = orbit.inclination;

    const cosO = Math.cos(O);
    const sinO = Math.sin(O);
    const cosi = Math.cos(i);
    const sini = Math.sin(i);

    const x = x_orb * cosO - y_orb * cosO * cosi; // Wait, formula check
    // Standard rotation:
    // X = r (cos(O) cos(u) - sin(O) sin(u) cos(i))
    // Y = r (sin(O) cos(u) + cos(O) sin(u) cos(i))
    // Z = r (sin(u) sin(i))
    // where u = M (for circular)

    const X = r * (Math.cos(O) * Math.cos(M) - Math.sin(O) * Math.sin(M) * Math.cos(i));
    const Y = r * (Math.sin(O) * Math.cos(M) + Math.cos(O) * Math.sin(M) * Math.cos(i));
    const Z = r * (Math.sin(M) * Math.sin(i));

    return { x: X, y: Y, z: Z };
}
