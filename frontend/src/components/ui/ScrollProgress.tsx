import React, { useState, useEffect } from 'react';
import './ScrollProgress.css';

const ScrollProgress: React.FC = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            setScrollProgress(scrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="scroll-progress-container">
            <div 
                className="scroll-progress"
                style={{ width: `${scrollProgress}%` }}
                role="progressbar"
                aria-valuenow={scrollProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
    );
};

export default ScrollProgress; 