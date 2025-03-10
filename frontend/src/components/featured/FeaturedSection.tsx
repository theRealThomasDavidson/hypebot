import React from 'react';
import { Profile } from '@/types/Profile';
import ChallengerCard from '@/components/cards/ChallengerCard';
import './FeaturedSection.css';

interface FeaturedSectionProps {
    profiles: Profile[];
    isVisible: boolean;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ profiles, isVisible }) => {
    if (!isVisible || profiles.length === 0) return null;

    return (
        <div className="featured-section ai-active">
            <h2 className="featured-heading">AI Recommended Challengers</h2>
            <p className="featured-description">
                Based on your search criteria, our AI has selected these top matches
            </p>
            <div className="featured-grid">
                {profiles.map((profile, index) => (
                    <ChallengerCard
                        key={profile.id}
                        {...profile}
                        index={index}
                        className="featured-card"
                    />
                ))}
            </div>
        </div>
    );
};

export default FeaturedSection; 