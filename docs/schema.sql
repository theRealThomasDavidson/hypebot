-- Drop all tables and extensions
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS conversation_messages CASCADE;

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

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create conversation messages table
CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    referenced_profiles UUID[] DEFAULT '{}',
    referenced_projects UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_role CHECK (role IN ('user', 'assistant'))
);

-- Add the foreign key constraint after both tables exist
ALTER TABLE projects 
ADD CONSTRAINT fk_profile 
FOREIGN KEY (profile_id) REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_projects_profile_id ON projects(profile_id);
CREATE INDEX idx_profiles_name ON profiles(name);
CREATE INDEX idx_conversation_messages ON conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_created ON conversation_messages(created_at);
