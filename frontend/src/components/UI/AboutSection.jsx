import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
    const [activeSection, setActiveSection] = useState(0);

    const sections = [
        {
            title: "An Agent-First Experience",
            description: "Manage multiple agents at the same time, across any workspace, from one central mission control view.",
            image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop"
        },
        {
            title: "Real-Time Orbital Tracking",
            description: "Monitor thousands of satellites and debris objects in real-time with advanced collision detection and prediction algorithms.",
            image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop"
        },
        {
            title: "Advanced Analytics",
            description: "Get detailed insights into orbital mechanics, collision probabilities, and space traffic management with our comprehensive analytics dashboard.",
            image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop"
        }
    ];

    return (
        <div style={{ background: '#000000', color: '#ffffff', position: 'relative' }}>
            <div style={{
                display: 'flex',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px',
                position: 'relative'
            }}>
                {/* Left Column: Scrollable Text */}
                <div style={{ width: '50%', paddingBottom: '100px' }}>
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ amount: 0.5 }}
                            onViewportEnter={() => setActiveSection(index)}
                            style={{
                                minHeight: '100vh',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                paddingRight: '40px'
                            }}
                        >
                            <h2 style={{
                                fontSize: '3.5rem',
                                fontWeight: 400,
                                lineHeight: '1.2',
                                marginBottom: '24px',
                                background: 'linear-gradient(to right, #ffffff, #a0a0a0)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {section.title}
                            </h2>
                            <p style={{
                                fontSize: '1.25rem',
                                color: '#9aa0a6',
                                lineHeight: '1.6',
                                marginBottom: '32px'
                            }}>
                                {section.description}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '14px 32px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    borderRadius: '30px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)',
                                    width: 'fit-content'
                                }}
                            >
                                Explore Product
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Right Column: Sticky Image */}
                <div style={{
                    width: '50%',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '100%',
                        height: '500px',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}>
                        {sections.map((section, index) => (
                            <motion.img
                                key={index}
                                src={section.image}
                                alt={section.title}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{
                                    opacity: activeSection === index ? 1 : 0,
                                    scale: activeSection === index ? 1 : 1.1,
                                    zIndex: activeSection === index ? 10 : 0
                                }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSection;

