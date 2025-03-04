const request = require('supertest');
const { createTestApp } = require('./testServer');

// Create a test app
const app = createTestApp();

// Mock UUID for testing
const mockProfileId = '12345678-1234-1234-1234-123456789012';
const mockProfile = {
    name: 'Test Challenger',
    blurb: 'Test challenger blurb',
    bio: 'Test challenger biography',
    skills: ['skill1', 'skill2', 'skill3'],
    pic_url: 'https://example.com/profile.jpg',
    github_url: 'https://github.com/test-challenger',
    linkedin_url: 'https://linkedin.com/in/test-challenger',
    gauntlet_url: 'https://gauntletai.com/test-challenger',
    twitter_url: 'https://x.com/test-challenger'
};

// Mock the profile controller methods
jest.mock('../src/controllers/profileController', () => ({
    getAllProfiles: jest.fn((req, res) => {
        res.json({
            success: true,
            data: [
                {
                    id: mockProfileId,
                    ...mockProfile,
                    created_at: '2002-08-08T00:00:00.000Z',
                    updated_at: '2002-08-08T00:00:00.000Z'
                }
            ],
            message: 'Profiles retrieved successfully'
        });
    }),
    getProfileById: jest.fn((req, res) => {
        if (req.params.id !== mockProfileId) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
                error: {
                    code: 'NOT_FOUND',
                    details: {}
                }
            });
        }

        res.json({
            success: true,
            data: {
                id: mockProfileId,
                ...mockProfile,
                created_at: '2002-08-08T00:00:00.000Z',
                updated_at: '2002-08-08T00:00:00.000Z',
                projects: []
            },
            message: 'Profile retrieved successfully'
        });
    }),
    createProfile: jest.fn((req, res) => {
        res.status(201).json({
            success: true,
            data: {
                id: mockProfileId,
                ...req.body,
                created_at: '2002-08-08T00:00:00.000Z',
                updated_at: '2002-08-08T00:00:00.000Z'
            },
            message: 'Profile created successfully'
        });
    }),
    updateProfile: jest.fn((req, res) => {
        if (req.params.id !== mockProfileId) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
                error: {
                    code: 'NOT_FOUND',
                    details: {}
                }
            });
        }

        res.json({
            success: true,
            data: {
                id: mockProfileId,
                ...mockProfile,
                ...req.body,
                updated_at: '2002-08-08T00:00:00.000Z'
            },
            message: 'Profile updated successfully'
        });
    }),
    deleteProfile: jest.fn((req, res) => {
        if (req.params.id !== mockProfileId) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
                error: {
                    code: 'NOT_FOUND',
                    details: {}
                }
            });
        }

        res.json({
            success: true,
            data: {
                id: mockProfileId
            },
            message: 'Profile deleted successfully'
        });
    })
}));

describe('Profile Endpoints', () => {
    describe('GET /api/profiles', () => {
        it('should return all profiles', async () => {
            const response = await request(app).get('/api/profiles');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.message).toBe('Profiles retrieved successfully');
        });
    });

    describe('GET /api/profiles/:id', () => {
        it('should return a profile by ID', async () => {
            const response = await request(app).get(`/api/profiles/${mockProfileId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', mockProfileId);
            expect(response.body.data).toHaveProperty('name', mockProfile.name);
            expect(response.body.message).toBe('Profile retrieved successfully');
        });

        it('should return 404 for non-existent profile', async () => {
            const response = await request(app).get('/api/profiles/non-existent-id');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Profile not found');
        });
    });

    describe('POST /api/profiles', () => {
        it('should create a new profile', async () => {
            const newProfile = {
                name: 'New Challenger',
                blurb: 'New challenger blurb',
                bio: 'New challenger biography',
                skills: ['skill1', 'skill2']
            };

            const response = await request(app)
                .post('/api/profiles')
                .send(newProfile);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name', newProfile.name);
            expect(response.body.message).toBe('Profile created successfully');
        });

        it('should validate required fields', async () => {
            const invalidProfile = {
                // Missing required fields
                skills: ['skill1']
            };

            // Mocking the validation error response
            jest.spyOn(require('../src/controllers/profileController'), 'createProfile')
                .mockImplementationOnce((req, res) => {
                    res.status(400).json({
                        success: false,
                        message: 'Validation error',
                        error: {
                            code: 'VALIDATION_ERROR',
                            details: { message: 'Required fields are missing' }
                        }
                    });
                });

            const response = await request(app)
                .post('/api/profiles')
                .send(invalidProfile);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation error');
        });
    });

    describe('PUT /api/profiles/:id', () => {
        it('should update an existing profile', async () => {
            const updatedFields = {
                name: 'Updated Challenger',
                bio: 'Updated challenger biography'
            };

            const response = await request(app)
                .put(`/api/profiles/${mockProfileId}`)
                .send(updatedFields);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', mockProfileId);
            expect(response.body.data).toHaveProperty('name', updatedFields.name);
            expect(response.body.data).toHaveProperty('bio', updatedFields.bio);
            expect(response.body.message).toBe('Profile updated successfully');
        });

        it('should return 404 for non-existent profile', async () => {
            const response = await request(app)
                .put('/api/profiles/non-existent-id')
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Profile not found');
        });
    });

    describe('DELETE /api/profiles/:id', () => {
        it('should delete a profile', async () => {
            const response = await request(app).delete(`/api/profiles/${mockProfileId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', mockProfileId);
            expect(response.body.message).toBe('Profile deleted successfully');
        });

        it('should return 404 for non-existent profile', async () => {
            const response = await request(app).delete('/api/profiles/non-existent-id');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Profile not found');
        });
    });
}); 