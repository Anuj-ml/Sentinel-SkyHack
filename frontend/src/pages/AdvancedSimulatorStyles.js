// Orbital Collision Avoidance Training System - UI Styles
// Matching the futuristic sci-fi aesthetic from the HTML version

export const colors = {
    primary: '#00d8ff',
    secondary: '#ff9800',
    danger: '#ff5252',
    success: '#00ff7f',
    warning: '#ffeb3b',
    bg: '#03050a',
    panelBg: 'rgba(10, 20, 35, 0.85)',
    borderColor: 'rgba(0, 216, 255, 0.2)',
    borderGlow: 'rgba(0, 216, 255, 0.5)',
    fontFamilyUI: "'Roboto Mono', monospace",
    fontFamilyTitle: "'Orbitron', sans-serif",
};

export const styles = {
    container: {
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: colors.fontFamilyUI,
        background: colors.bg,
        color: '#e0e0e0',
        position: 'relative',
    },

    scanlineOverlay: {
        content: '',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
        pointerEvents: 'none',
        zIndex: 9999,
    },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(to right, rgba(3, 5, 10, 0.9), rgba(15, 25, 45, 0.9))',
        borderBottom: `1px solid ${colors.borderColor}`,
        boxShadow: `0 2px 10px ${colors.borderGlow}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 30px',
        zIndex: 1000,
    },

    headerTitle: {
        fontFamily: colors.fontFamilyTitle,
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '2px',
        color: colors.primary,
        textShadow: `0 0 8px ${colors.borderGlow}`,
        margin: 0,
    },

    statusIndicator: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: colors.success,
        boxShadow: `0 0 10px ${colors.success}`,
    },

    panel: {
        position: 'relative',
        background: colors.panelBg,
        border: `1px solid ${colors.borderColor}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 25px rgba(0, 0, 0, 0.7)',
        borderRadius: '0',
        padding: '20px',
    },

    cornerDecoration: (position) => {
        const base = {
            content: '""',
            position: 'absolute',
            width: '15px',
            height: '15px',
            borderColor: colors.primary,
            borderStyle: 'solid',
            zIndex: 1,
        };

        const positions = {
            tl: { top: '-2px', left: '-2px', borderWidth: '2px 0 0 2px' },
            tr: { top: '-2px', right: '-2px', borderWidth: '2px 2px 0 0' },
            bl: { bottom: '-2px', left: '-2px', borderWidth: '0 0 2px 2px' },
            br: { bottom: '-2px', right: '-2px', borderWidth: '0 2px 2px 0' },
        };

        return { ...base, ...positions[position] };
    },

    sectionTitle: {
        fontFamily: colors.fontFamilyTitle,
        fontSize: '14px',
        fontWeight: '400',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '15px',
        paddingBottom: '8px',
        borderBottom: `1px solid ${colors.borderColor}`,
        display: 'flex',
        alignItems: 'center',
    },

    sectionTitleBar: {
        width: '4px',
        height: '16px',
        background: colors.primary,
        marginRight: '10px',
        boxShadow: `0 0 5px ${colors.primary}`,
    },

    button: {
        width: '100%',
        padding: '12px 16px',
        background: 'transparent',
        border: `1px solid ${colors.primary}`,
        color: colors.primary,
        fontFamily: colors.fontFamilyTitle,
        fontSize: '12px',
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '8px',
        position: 'relative',
    },

    buttonDanger: {
        borderColor: colors.danger,
        color: colors.danger,
    },

    input: {
        width: '100%',
        padding: '10px 12px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: `1px solid ${colors.borderColor}`,
        color: '#e0e0e0',
        fontSize: '14px',
        fontFamily: colors.fontFamilyUI,
        transition: 'all 0.3s ease',
    },

    select: {
        width: '100%',
        padding: '10px 12px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: `1px solid ${colors.borderColor}`,
        color: '#e0e0e0',
        fontSize: '14px',
        fontFamily: colors.fontFamilyUI,
        transition: 'all 0.3s ease',
    },

    label: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        color: '#b0b0b0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '6px',
        fontFamily: colors.fontFamilyUI,
    },

    stats: {
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '15px',
        borderLeft: `3px solid ${colors.primary}`,
    },

    statRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 0',
        fontSize: '12px',
    },

    statValue: {
        color: colors.success,
        fontWeight: '700',
        fontSize: '14px',
    },

    logConsole: {
        background: 'rgba(0, 0, 0, 0.5)',
        border: `1px solid ${colors.borderColor}`,
        padding: '12px',
        height: '250px',
        overflowY: 'auto',
        fontFamily: colors.fontFamilyUI,
        fontSize: '11px',
        lineHeight: '1.6',
    },

    collisionAlert: {
        background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.1), rgba(255, 82, 82, 0.2))',
        border: `2px solid ${colors.danger}`,
        padding: '15px',
        boxShadow: `0 0 20px ${colors.danger}`,
        marginBottom: '25px',
    },

    collisionAlertTitle: {
        fontFamily: colors.fontFamilyTitle,
        color: colors.danger,
        fontSize: '16px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '15px',
        textAlign: 'center',
    },

    collisionInfo: {
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '10px',
        margin: '10px 0',
        fontFamily: colors.fontFamilyUI,
        fontSize: '12px',
        lineHeight: '1.8',
        borderLeft: `3px solid ${colors.primary}`,
    },

    satelliteLabel: {
        position: 'absolute',
        color: 'white',
        fontFamily: colors.fontFamilyUI,
        fontSize: '12px',
        padding: '2px 5px',
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '3px',
        transform: 'translate(-50%, 10px)',
        whiteSpace: 'nowrap',
        willChange: 'transform',
        transition: 'opacity 0.2s',
    },
};

export const animations = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.8); opacity: 0.7; }
    }

    @keyframes blink {
        50% { opacity: 0.5; }
    }
`;
