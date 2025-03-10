import React from 'react';
import { Profile } from '@/types/Profile';
import ChallengerCard from '@components/cards/ChallengerCard';
import AISearchButton from '@components/search/AISearchButton';
import './ChallengersGrid.css';

interface ChallengersGridProps {
    profiles: Profile[];
    isLoading: boolean;
    hasNoResults: boolean;
    onTryAISearch: () => void;
}

const ChallengersGrid: React.FC<ChallengersGridProps> = ({
    profiles,
    isLoading,
    hasNoResults,
    onTryAISearch
}) => {
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading profiles...</p>
            </div>
        );
    }

    if (hasNoResults) {
        return (
            <div className="no-results">
                <p className="no-results-content">
                    No profiles match your search. Try different keywords.
                </p>
                <div className="ai-suggestion">
                    <p>Want better results? Try searching with our AI assistant!</p>
                    <AISearchButton 
                        isActive={false}
                        onClick={onTryAISearch}
                        variant="suggestion"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="challengers-grid">
            {profiles.map((profile, index) => (
                <ChallengerCard
                    key={profile.id}
                    {...profile}
                    index={index}
                />
            ))}
        </div>
    );
};

export default ChallengersGrid; 