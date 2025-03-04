const { supabase } = require('../lib/supabase');

/**
 * Get all profiles
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getAllProfiles(req, res) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
}

/**
 * Get a profile by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getProfileById(req, res) {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, projects(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
}

/**
 * Create a new profile
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function createProfile(req, res) {
    const {
        name,
        blurb,
        bio,
        skills,
        pic_url,
        github_url,
        linkedin_url,
        gauntlet_url,
        twitter_url
    } = req.body;

    try {
        // Validate required fields
        if (!name || !blurb || !bio || !skills) {
            return res.status(400).json({
                error: 'Missing required fields: name, blurb, bio, and skills are required'
            });
        }

        // Validate skills array length
        if (!Array.isArray(skills) || skills.length > 3) {
            return res.status(400).json({
                error: 'Skills must be an array with maximum 3 items'
            });
        }

        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                name,
                blurb,
                bio,
                skills,
                pic_url,
                github_url,
                linkedin_url,
                gauntlet_url,
                twitter_url
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Failed to create profile' });
    }
}

/**
 * Update a profile
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function updateProfile(req, res) {
    const { id } = req.params;
    const {
        name,
        blurb,
        bio,
        skills,
        pic_url,
        github_url,
        linkedin_url,
        gauntlet_url,
        twitter_url
    } = req.body;

    try {
        // Validate skills array length if provided
        if (skills && (!Array.isArray(skills) || skills.length > 3)) {
            return res.status(400).json({
                error: 'Skills must be an array with maximum 3 items'
            });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({
                name,
                blurb,
                bio,
                skills,
                pic_url,
                github_url,
                linkedin_url,
                gauntlet_url,
                twitter_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

/**
 * Delete a profile
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function deleteProfile(req, res) {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
}

module.exports = {
    getAllProfiles,
    getProfileById,
    createProfile,
    updateProfile,
    deleteProfile
}; 