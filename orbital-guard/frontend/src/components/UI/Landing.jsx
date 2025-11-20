import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LandingGlobe from './LandingGlobe';

const TypingText = ({ text, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                setDisplayedText(text.slice(0, index + 1));
                index++;
                if (index === text.length) clearInterval(interval);
            }, 50);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(timeout);
    }, [text, delay]);

    return <span>{displayedText}<span className="cursor">|</span></span>;
};

const Landing = ({ onInitialize }) => {
    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: '#000000',
            color: '#ffffff',
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Navigation Bar */}
            <nav style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                boxSizing: 'border-box'
            }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#4285F4' }}>satellite_alt</span>
                    Sentinel
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                    <span style={{ cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }} className="hover-text">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>info</span>
                        About Us
                    </span>
                    <span style={{ cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }} className="hover-text">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>code</span>
                        GitHub
                    </span>
                    <span style={{ cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }} className="hover-text">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                        Community
                    </span>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8%',
                position: 'relative',
                zIndex: 5
            }}>
                {/* Left Content */}
                <div style={{ maxWidth: '600px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                            fontSize: '5.5rem',
                            fontWeight: 400,
                            lineHeight: '1.1',
                            letterSpacing: '-2px',
                            marginBottom: '24px',
                            background: 'linear-gradient(to right, #ffffff, #a0a0a0)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Track Every Object in Orbit
                    </motion.h1>

                    <div style={{
                        fontSize: '1.5rem',
                        color: '#9aa0a6',
                        marginBottom: '48px',
                        height: '3rem', // Fixed height to prevent layout shift
                        fontFamily: '"Roboto Mono", monospace'
                    }}>
                        <TypingText text="Real-time visualization of 2000+ active satellites and debris." delay={800} />
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onInitialize}
                        style={{
                            padding: '16px 40px',
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            borderRadius: '30px',
                            border: 'none',
                            background: '#4285F4',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(66, 133, 244, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        Launch Tracker
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </motion.button>
                </div>

                {/* Right Content - 3D Globe */}
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    style={{
                        position: 'absolute',
                        right: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '60vw',
                        height: '100vh',
                        zIndex: -1,
                        pointerEvents: 'all',
                        overflow: 'visible'
                    }}
                >
                    <LandingGlobe />
                </motion.div>
            </main>

            {/* Footer Stats */}
            <footer style={{
                padding: '40px 8%',
                display: 'flex',
                gap: '80px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)'
            }}>
                <div>
                    <div style={{ fontSize: '2rem', fontWeight: 300 }}>2,000+</div>
                    <div style={{ color: '#9aa0a6', fontSize: '0.9rem', marginTop: '4px' }}>Active Satellites</div>
                </div>
                <div>
                    <div style={{ fontSize: '2rem', fontWeight: 300 }}>15,000+</div>
                    <div style={{ color: '#9aa0a6', fontSize: '0.9rem', marginTop: '4px' }}>Debris Objects</div>
                </div>
                <div>
                    <div style={{ fontSize: '2rem', fontWeight: 300 }}>Real-time</div>
                    <div style={{ color: '#9aa0a6', fontSize: '0.9rem', marginTop: '4px' }}>Orbital Physics</div>
                </div>
            </footer>

            <style>{`
                .cursor {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default Landing;
