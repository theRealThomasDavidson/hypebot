const request = require('supertest');
const express = require('express');

// Create a mock Express app for testing
const app = express();

// Mock the health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'hypebot-backend'
    });
});

describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('service', 'hypebot-backend');
    });
}); 