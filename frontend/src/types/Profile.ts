export interface Profile {
    id: string;
    name: string;
    blurb: string;
    bio: string;
    skills: string[];
    pic_url: string;
    github_url: string;
    linkedin_url: string;
    gauntlet_url: string;
    twitter_url: string;
    created_at: string;
    updated_at: string;
}

// And update our ChallengerCard props to use these new field names
interface ChallengerCardProps extends Profile {
    index?: number;
    className?: string;
} 