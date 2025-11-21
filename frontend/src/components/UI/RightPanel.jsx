import React from 'react';
import InfoPanel from './InfoPanel';
import SatelliteInfoText from './SatelliteInfoText';
import GroundStationPanel from './GroundStationPanel';

const RightPanel = ({ selectedSat, currentTime }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '320px',
            pointerEvents: 'auto',
            alignItems: 'flex-end' // Align to right
        }}>
            <InfoPanel selectedSat={selectedSat} currentTime={currentTime} />
            <SatelliteInfoText selectedSat={selectedSat} />
            <GroundStationPanel selectedSat={selectedSat} currentTime={currentTime} />
        </div>
    );
};

export default RightPanel;
