import React from 'react';
import AISearchButton from '@components/search/AISearchButton';
import './SearchContainer.css';

interface SearchContainerProps {
    searchTerm: string;
    isLoading: boolean;
    isAISearchActive: boolean;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearSearch: () => void;
    onAISearchToggle: () => void;
    placeholder?: string;
}

const SearchContainer: React.FC<SearchContainerProps> = ({
    searchTerm,
    isLoading,
    isAISearchActive,
    onSearchChange,
    onClearSearch,
    onAISearchToggle,
    placeholder = "Search by name, skills, projects, or keywords..."
}) => {
    return (
        <div className="search-container">
            <div className="search-icon">🔍</div>
            <input 
                type="text"
                id="search-input"
                placeholder={placeholder}
                value={searchTerm}
                onChange={onSearchChange}
                className={isAISearchActive ? 'ai-active' : ''}
            />
            {searchTerm && (
                <button 
                    className="clear-search-btn visible"
                    onClick={onClearSearch}
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
            <div className={`ai-loading-indicator ${isLoading && isAISearchActive ? 'active' : ''}`}>
                <span className="loading-text">AI searching</span>
                <div className="ai-loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <AISearchButton 
                isActive={isAISearchActive}
                onClick={onAISearchToggle}
                variant="primary"
            />
        </div>
    );
};

export default SearchContainer; 