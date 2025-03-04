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

        res.json({
            success: true,
            data: data,
            message: "Profiles retrieved successfully"
        });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profiles',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
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
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
                error: {
                    code: 'RESOURCE_NOT_FOUND',
                    details: { id }
                }
            });
        }

        res.json({
            success: true,
            data: data,
            message: "Profile retrieved successfully"
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
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
        if (!name || !blurb || !bio) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: {
                    code: 'INVALID_REQUEST',
                    details: {
                        message: 'name, blurb, and bio are required'
                    }
                }
            });
        }

        // Validate skills array if provided
        if (skills && (!Array.isArray(skills))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format',
                error: {
                    code: 'INVALID_REQUEST',
                    details: {
                        message: 'Skills must be an array'
                    }
                }
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

        res.status(201).json({
            success: true,
            data: data,
            message: "Profile created successfully"
        });
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create profile',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
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
        // Validate skills array if provided
        if (skills && (!Array.isArray(skills))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format',
                error: {
                    code: 'INVALID_REQUEST',
                    details: {
                        message: 'Skills must be an array'
                    }
                }
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
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
                error: {
                    code: 'RESOURCE_NOT_FOUND',
                    details: { id }
                }
            });
        }

        res.json({
            success: true,
            data: data,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
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
        // Check if profile exists before deleting
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError || !profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
                error: {
                    code: 'RESOURCE_NOT_FOUND',
                    details: { id }
                }
            });
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            data: {
                id: id
            },
            message: "Profile deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete profile',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
    }
}

module.exports = {
    getAllProfiles,
    getProfileById,
    createProfile,
    updateProfile,
    deleteProfile
}; 