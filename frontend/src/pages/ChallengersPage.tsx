import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SearchContainer from '@/components/search/SearchContainer';
import FeaturedSection from '@/components/featured/FeaturedSection';
import ChallengersGrid from '@/components/grid/ChallengersGrid';
import ScrollProgress from '@/components/ui/ScrollProgress';
import BackToTop from '@/components/ui/BackToTop';
import { Profile } from '@/types/Profile';
import { apiService } from '@/services/api.service';
import '@/pages/ChallengersPage.css';


async function searchProfilesWithAI(term: string): Promise<Profile[]> {
    return apiService.searchProfilesWithAI(term);
}

async function searchProfiles(term: string): Promise<Profile[]> {
    return apiService.searchProfiles(term);
}

async function getProfiles(): Promise<Profile[]> {
    return apiService.getProfiles();
}

const ChallengersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAISearchActive, setIsAISearchActive] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [featuredProfiles, setFeaturedProfiles] = useState<Profile[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial profiles
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const data = await getProfiles();
                setProfiles(data);
            } catch (err) {
                setError('Failed to load profiles. Please try again later.');
                console.error('Error fetching profiles:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    // Handle search
    const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        
        if (!term) {
            setFeaturedProfiles([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            if (isAISearchActive) {
                const aiResults = await searchProfilesWithAI(term);
                setFeaturedProfiles(aiResults);
            } else {
                const searchResults = await searchProfiles(term);
                setProfiles(searchResults);
            }
        } catch (err) {
            setError('Search failed. Please try again.');
            console.error('Error during search:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setFeaturedProfiles([]);
        // Reload all profiles
        getProfiles()
            .then((data: Profile[]) => setProfiles(data))
            .catch((err: unknown) => {
                setError('Failed to reload profiles.');
                console.error('Error reloading profiles:', err);
            });
    };

    const handleAISearchToggle = () => {
        setIsAISearchActive(!isAISearchActive);
        if (!isAISearchActive && searchTerm) {
            // Trigger AI search when enabling
            handleSearchChange({ target: { value: searchTerm } } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    return (
        <MainLayout>
            <ScrollProgress />
            <div className="challengers-page">
                <h1 className="page-title">Discover Challengers</h1>
                <SearchContainer
                    searchTerm={searchTerm}
                    isLoading={isLoading}
                    isAISearchActive={isAISearchActive}
                    onSearchChange={handleSearchChange}
                    onClearSearch={handleClearSearch}
                    onAISearchToggle={handleAISearchToggle}
                />
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {isAISearchActive && (
                    <FeaturedSection
                        profiles={featuredProfiles}
                        isVisible={!!searchTerm && featuredProfiles.length > 0}
                    />
                )}

                <ChallengersGrid
                    profiles={Array.isArray(profiles) ? profiles : []}
                    isLoading={isLoading}
                    hasNoResults={!isLoading && (!profiles || profiles.length === 0)}
                    onTryAISearch={() => {
                        setIsAISearchActive(true);
                        handleSearchChange({ target: { value: searchTerm } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                />
            </div>
            <BackToTop />
        </MainLayout>
    );
};

export default ChallengersPage; 