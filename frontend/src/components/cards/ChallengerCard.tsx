import React from 'react';
import { Profile } from '../../types/Profile';
import './ChallengerCard.css';

interface ChallengerCardProps extends Profile {
    index?: number;
    className?: string;
}

const ChallengerCard: React.FC<ChallengerCardProps> = ({
    id,
    name,
    blurb,
    bio,
    pic_url,
    gauntlet_url,
    index = 0,
    className = ''
}) => {
    // Calculate animation delay based on index
    const animationDelay = index * 30;

    return (
        <div 
            className={`profile-card ${className}`}
            data-name={name}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            {pic_url && (
                <div className="card-img-container">
                    <img 
                        src={pic_url} 
                        alt={name} 
                        className="card-img"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                        }}
                    />
                </div>
            )}
            <div className="card-content">
                <h3 className="card-name">{name}</h3>
                <div className="card-title">{blurb}</div>
                <p className="card-bio">{bio}</p>
                <a href={gauntlet_url} className="card-button">
                    View Profile
                </a>
            </div>
        </div>
    );
};

export default ChallengerCard; 