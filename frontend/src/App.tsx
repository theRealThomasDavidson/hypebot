import React, { Component, ErrorInfo } from 'react';
import ChallengersPage from '@pages/ChallengersPage';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <h1>Something went wrong.</h1>
                    <p>Please try refreshing the page.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <ChallengersPage />
        </ErrorBoundary>
    );
};

export default App; 