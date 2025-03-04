-- Drop all tables and extensions
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- Create the projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(40) NOT NULL,
    description TEXT NOT NULL,
    video_url VARCHAR(255),
    screenshot_url VARCHAR(255),
    techs VARCHAR(40)[], -- 5 max
    keywords VARCHAR(40)[], -- 5 max
    github_url VARCHAR(255),
    deploy_url VARCHAR(255),
    profile_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    blurb VARCHAR(40) NOT NULL,
    bio VARCHAR(700) NOT NULL,
    skills VARCHAR(40)[], -- 3 max
    pic_url VARCHAR(255),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    gauntlet_url VARCHAR(255),
    twitter_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add the foreign key constraint after both tables exist
ALTER TABLE projects 
ADD CONSTRAINT fk_profile 
FOREIGN KEY (profile_id) REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_projects_profile_id ON projects(profile_id);
CREATE INDEX idx_profiles_name ON profiles(name);
