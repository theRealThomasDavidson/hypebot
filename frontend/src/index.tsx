// Load polyfills first
import 'react-app-polyfill/stable';
import 'react-app-polyfill/ie11';
import './polyfills';

// Then load React
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Initialize the application
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Failed to find the root element');
}

// Create root with error boundary
const renderApp = () => {
    try {
        const root = createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } catch (error) {
        console.error('Error rendering app:', error);
        rootElement.innerHTML = 'Error loading application. Please try refreshing the page.';
    }
};

// Start the app
renderApp(); 