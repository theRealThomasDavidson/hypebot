/**
 * API Endpoint Configurations
 * 
 * @typedef {Object} Profile
 * @property {string} id - Unique identifier
 * @property {string} name - Profile name
 * @property {string} [bio] - Profile biography
 * @property {string} [image] - Profile image URL
 * @property {string[]} [skills] - Array of skills
 * @property {string} [title] - Professional title
 * 
 * @typedef {Object} Project
 * @property {string} id - Unique identifier
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} profileId - Associated profile ID
 * 
 * @typedef {Object} Document
 * @property {string} id - Unique identifier
 * @property {string} content - Document content
 * @property {string} userId - Associated user ID
 * @property {number[]} embedding - Vector embedding
 */

const API = {
    baseURL: 'http://ec2-3-82-210-208.compute-1.amazonaws.com:3000/api',
    
    endpoints: {
        // Profile endpoints
        profiles: {
            getAll: () => ({ url: '/profiles', method: 'GET' }),
            getById: (id) => ({ url: `/profiles/${id}`, method: 'GET' }),
            create: () => ({ url: '/profiles', method: 'POST' }),
            update: (id) => ({ url: `/profiles/${id}`, method: 'PUT' }),
            delete: (id) => ({ url: `/profiles/${id}`, method: 'DELETE' }),
        },

        // Project endpoints
        projects: {
            getAll: () => ({ url: '/projects', method: 'GET' }),
            getById: (id) => ({ url: `/projects/${id}`, method: 'GET' }),
            create: () => ({ url: '/projects', method: 'POST' }),
            update: (id) => ({ url: `/projects/${id}`, method: 'PUT' }),
            delete: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
        },

        // Profile-specific project endpoints
        profileProjects: {
            getAll: (profileId) => ({ url: `/profiles/${profileId}/projects`, method: 'GET' }),
        },

        // Document endpoints
        documents: {
            create: () => ({ url: '/documents', method: 'POST' }),
            search: () => ({ url: '/documents/search', method: 'GET' }),
            delete: (id) => ({ url: `/documents/${id}`, method: 'DELETE' }),
            deleteUserDocs: (userId) => ({ url: `/documents/user/${userId}`, method: 'DELETE' }),
        }
    },

    defaultHeaders: {
        'Content-Type': 'application/json'
    },

    buildUrl: (endpoint) => `${API.baseURL}${endpoint}`,

    request: async (endpoint, options = {}) => {
        const url = API.buildUrl(endpoint.url);
        const response = await fetch(url, {
            ...options,
            method: endpoint.method,
            headers: {
                ...API.defaultHeaders,
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    }
};

export default API;
