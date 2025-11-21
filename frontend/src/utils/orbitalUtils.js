import { propagateKeplerian } from '../physics/keplerian';

export const safePropagate = (obj, time) => {
    try {
        if (!obj || !time) return { x: 0, y: 0, z: 0 };

        const pos = propagateKeplerian(obj, time);

        // Check for NaNs or Infinities
        if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y) || !Number.isFinite(pos.z)) {
            // console.warn(`Invalid position calculated for ${obj.name || 'unknown object'}`);
            return { x: 0, y: 0, z: 0 };
        }

        return pos;
    } catch (error) {
        console.error('Error in orbital propagation:', error);
        return { x: 0, y: 0, z: 0 };
    }
};
