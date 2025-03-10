import React, { useEffect, ReactNode } from 'react';
import './MainLayout.css';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    useEffect(() => {
        const handleResize = () => {
            // Update CSS custom property for viewport height (mobile browsers)
            document.documentElement.style.setProperty(
                '--vh', 
                `${window.innerHeight * 0.01}px`
            );
        };

        // Initial call
        handleResize();

        // Setup listeners
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return (
        <div className="main-layout">
            <div className="content-container">
                {children}
            </div>
        </div>
    );
};

export default MainLayout; 