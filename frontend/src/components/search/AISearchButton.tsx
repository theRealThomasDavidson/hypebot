import React from 'react';
import './AISearchButton.css';

interface AISearchButtonProps {
    isActive: boolean;
    onClick: () => void;
    variant: 'primary' | 'suggestion';
}

const AISearchButton: React.FC<AISearchButtonProps> = ({ 
    isActive, 
    onClick, 
    variant 
}) => {
    const handleClick = () => {
        // Add ripple effect or animation here if needed
        onClick();
    };

    const renderSparkleIcon = () => (
        <span className="sparkle-icon">✨</span>
    );

    return (
        <button 
            className={`
                ai-search-btn 
                ${isActive ? 'active' : ''} 
                ${variant === 'suggestion' ? 'suggestion' : ''}
            `}
            onClick={handleClick}
            aria-pressed={isActive}
        >
            {renderSparkleIcon()}
            <span className="search-text">
                {variant === 'suggestion' ? 'Try AI Search' : 'AI Search'}
            </span>
        </button>
    );
};

export default AISearchButton; 