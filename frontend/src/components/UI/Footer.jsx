import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer style={{
            background: 'linear-gradient(135deg, #000000 0%, #0a0a2e 50%, #16213e 100%)',
            color: '#ffffff',
            padding: '80px 8% 40px',
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Wave Pattern Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 50%, rgba(0, 50, 150, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(0, 100, 200, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(0, 30, 100, 0.25) 0%, transparent 50%)
                `,
                filter: 'blur(60px)',
                opacity: 0.8,
                zIndex: 0
            }}></div>
            <div style={{
                position: 'relative',
                zIndex: 1
            }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '60px',
                flexWrap: 'wrap',
                gap: '40px'
            }}>
                {/* Left side - Brand */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{
                        flex: 1,
                        minWidth: '250px'
                    }}
                >
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#ffffff',
                        textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px rgba(66, 133, 244, 0.8))' }}>satellite_alt</span>
                        Sentinel
                    </div>
                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.6',
                        maxWidth: '300px',
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                    }}>
                        Experience liftoff with real-time orbital tracking and collision prediction.
                    </p>
                </motion.div>

                {/* Navigation Links */}
                <div style={{
                    display: 'flex',
                    gap: '80px',
                    flexWrap: 'wrap'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h3 style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            marginBottom: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: '#ffffff',
                            textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                        }}>
                            Product
                        </h3>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {['Download', 'Product', 'Docs', 'Changelog'].map((item) => (
                                <li key={item}>
                                    <a href="#" style={{
                                        fontSize: '0.95rem',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s',
                                        display: 'block',
                                        textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = '#ffffff';
                                        e.target.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                                        e.target.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.3)';
                                    }}
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h3 style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            marginBottom: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: '#ffffff',
                            textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                        }}>
                            Resources
                        </h3>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {['Blog', 'Pricing', 'Use Cases'].map((item) => (
                                <li key={item}>
                                    <a href="#" style={{
                                        fontSize: '0.95rem',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s',
                                        display: 'block',
                                        textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = '#ffffff';
                                        e.target.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                                        e.target.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.3)';
                                    }}
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                    paddingTop: '40px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}
            >
                <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                }}>
                    © 2025 Sentinel. All rights reserved.
                </div>
                <div style={{
                    display: 'flex',
                    gap: '24px',
                    fontSize: '0.9rem'
                }}>
                    <a href="#" style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        textDecoration: 'none',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.color = '#ffffff';
                        e.target.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.3)';
                    }}
                    >Privacy</a>
                    <a href="#" style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        textDecoration: 'none',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.color = '#ffffff';
                        e.target.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.3)';
                    }}
                    >Terms</a>
                    <a href="https://github.com/atharvavdeo/Sentinel---SkyHacks25" target="_blank" rel="noopener noreferrer" style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        textDecoration: 'none',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.color = '#ffffff';
                        e.target.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.3)';
                    }}
                    >GitHub</a>
                </div>
            </motion.div>
            </div>
        </footer>
    );
};

export default Footer;

