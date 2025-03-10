export const API_CONFIG = {
    BASE_URL: 'http://ec2-3-82-210-208.compute-1.amazonaws.com:3000',
    ENDPOINTS: {
        PROFILES: '/api/profiles',
        SEARCH: '/api/profiles/search',
        AI_SEARCH: '/api/profiles/ai-search'
    },
    HEADERS: {
        'Content-Type': 'application/json'
    }
} as const; 