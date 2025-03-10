import { Profile } from '@/types/Profile';
import { API_CONFIG } from '@/config/api.config';
import API from '@components/lib/backend';

class ApiService {
    private readonly baseUrl: string;
    private readonly headers: HeadersInit;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.headers = API_CONFIG.HEADERS;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // Extract the data property from the API response
        return result.data as T;
    }

    async getProfiles(): Promise<Profile[]> {
        console.log('Fetching profiles from:', `${this.baseUrl}${API_CONFIG.ENDPOINTS.PROFILES}`);
        const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROFILES}`);
        return this.handleResponse<Profile[]>(response);
    }

    async searchProfiles(query: string): Promise<Profile[]> {
        const response = await fetch(
            `${this.baseUrl}${API_CONFIG.ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`
        );
        return this.handleResponse<Profile[]>(response);
    }

    async searchProfilesWithAI(query: string): Promise<Profile[]> {
        const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AI_SEARCH}`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ query })
        });
        return this.handleResponse<Profile[]>(response);
    }
}

export const apiService = new ApiService(); 