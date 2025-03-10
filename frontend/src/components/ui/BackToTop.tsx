import React, { useState, useEffect } from 'react';
import './BackToTop.css';

const BackToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button 
            className={`back-to-top ${isVisible ? 'visible' : ''}`}
            onClick={handleClick}
            aria-label="Back to top"
        >
            <span className="arrow">↑</span>
        </button>
    );
};

export default BackToTop; 