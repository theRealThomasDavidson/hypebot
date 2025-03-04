const express = require('express');
const cors = require('cors');
const profileRoutes = require('../src/routes/profileRoutes');
const projectRoutes = require('../src/routes/projectRoutes');
const profileProjectsRoutes = require('../src/routes/profileProjectsRoutes');

// Create Express app for testing
function createTestApp() {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/api/profiles', profileRoutes);
    app.use('/api/projects', projectRoutes);
    // Using the routes directly with a parameter
    app.use('/api/profiles/:profileId/projects', profileProjectsRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'hypebot-backend'
        });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            success: false,
            message: err.message,
            error: {
                code: 'SERVER_ERROR',
                details: {}
            }
        });
    });

    return app;
}

module.exports = { createTestApp }; 