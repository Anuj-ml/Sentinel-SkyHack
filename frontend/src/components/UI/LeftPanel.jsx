import React from 'react';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import FilterDropdown from './FilterDropdown';
import ComparisonPanel from './ComparisonPanel';
import HazardList from './HazardList';
import ManeuverSuggestion from './ManeuverSuggestion';

const LeftPanel = ({
    currentPositions,
    handleSelectSat,
    showDebris,
    setShowDebris,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    satellites,
    selectedSat,
    hazards
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '320px',
            pointerEvents: 'auto'
        }}>
            <SearchBar
                satellites={currentPositions}
                onSelect={handleSelectSat}
                showDebris={showDebris}
                setShowDebris={setShowDebris}
            />

            {/* Dedicated Filter/Sort Box */}
            <div className="glass-panel" style={{
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'rgba(20, 20, 30, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 500 }}>Filter & Sort</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
                    <FilterDropdown filterBy={filterBy} setFilterBy={setFilterBy} />
                </div>
            </div>

            <ComparisonPanel satellites={satellites} selectedSat={selectedSat} />
            <HazardList hazards={hazards} />
            <ManeuverSuggestion hazards={hazards} selectedSat={selectedSat} />
        </div>
    );
};

export default LeftPanel;
