import { Profile } from '../types/Profile';

const API_BASE_URL = 'http://ec2-3-82-210-208.compute-1.amazonaws.com:3000';

export const api = {
    async getProfiles(): Promise<Profile[]> {
        const response = await fetch(`${API_BASE_URL}/profiles`);
        if (!response.ok) {
            throw new Error('Failed to fetch profiles');
        }
        return response.json();
    },

    async searchProfiles(query: string): Promise<Profile[]> {
        const response = await fetch(`${API_BASE_URL}/profiles/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to search profiles');
        }
        return response.json();
    },

    async searchProfilesWithAI(query: string): Promise<Profile[]> {
        const response = await fetch(`${API_BASE_URL}/profiles/ai-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        if (!response.ok) {
            throw new Error('Failed to perform AI search');
        }
        return response.json();
    }
}; 