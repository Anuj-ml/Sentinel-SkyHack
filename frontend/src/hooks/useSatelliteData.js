import { useState, useEffect } from 'react';
import axios from 'axios';
import * as satellite from 'satellite.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useSatelliteData = () => {
    const [satellites, setSatellites] = useState([]);
    const [debris, setDebris] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false); // New state variable

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [satRes, debRes] = await Promise.all([
                    axios.get(`${API_URL}/satellites`),
                    axios.get(`${API_URL}/debris`)
                ]);

                // Raw Keplerian Data
                setSatellites(satRes.data);
                setDebris(debRes.data);
                setLoading(false); // Keep loading state for consistency
                setInitialized(true); // Set initialized to true after data is fetched
            } catch (err) {
                console.error("Failed to fetch data", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getHazards = async (targetName) => {
        try {
            const res = await axios.post(`${API_URL}/predict-hazard`, { targetName });
            return res.data;
        } catch (err) {
            console.error("Failed to predict hazards:", err.message);
            if (err.response) {
                console.error("Server responded with:", err.response.status, err.response.data);
            } else if (err.request) {
                console.error("No response received from server. Is it running?");
            }
            return [];
        }
    };

    return { satellites, debris, loading, getHazards };
};
