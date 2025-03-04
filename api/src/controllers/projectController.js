const { supabase } = require('../lib/supabase');

/**
 * Get all projects
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getAllProjects(req, res) {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*');

        if (error) throw error;

        res.json({
            success: true,
            data: data,
            message: "Projects retrieved successfully"
        });
    } catch (error) {
        console.error('Error retrieving projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve projects',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
    }
}

/**
 * Get a specific project by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getProjectById(req, res) {
    try {
        const { id } = req.params;

        // Get the project with some profile information
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                profiles:profile_id (
                    id,
                    name
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found',
                    error: {
                        code: 'NOT_FOUND',
                        details: error
                    }
                });
            }
            throw error;
        }

        res.json({
            success: true,
            data: data,
            message: "Project retrieved successfully"
        });
    } catch (error) {
        console.error('Error retrieving project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve project',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
    }
}

/**
 * Get all projects for a specific profile
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function getProjectsByProfileId(req, res) {
    try {
        const { profileId } = req.params;

        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', profileId)
            .single();

        if (profileError) {
            if (profileError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found',
                    error: {
                        code: 'NOT_FOUND',
                        details: profileError
                    }
                });
            }
            throw profileError;
        }

        // Get all projects for the profile
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('profile_id', profileId);

        if (error) throw error;

        res.json({
            success: true,
            data: data,
            message: "Profile projects retrieved successfully"
        });
    } catch (error) {
        console.error('Error retrieving profile projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile projects',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
    }
}

/**
 * Create a new project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function createProject(req, res) {
    try {
        const {
            title,
            description,
            video_url,
            screenshot_url,
            techs,
            keywords,
            github_url,
            deploy_url,
            profile_id
        } = req.body;

        // Validate required fields
        if (!title || !description || !profile_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                error: {
                    code: 'MISSING_FIELDS',
                    details: {
                        required: ['title', 'description', 'profile_id'],
                        provided: Object.keys(req.body)
                    }
                }
            });
        }

        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', profile_id)
            .single();

        if (profileError) {
            if (profileError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found',
                    error: {
                        code: 'PROFILE_NOT_FOUND',
                        details: profileError
                    }
                });
            }
            throw profileError;
        }

        // Validate arrays
        if (techs && techs.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Too many technologies',
                error: {
                    code: 'VALIDATION_ERROR',
                    details: 'Maximum of 5 technologies allowed'
                }
            });
        }

        if (keywords && keywords.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Too many keywords',
                error: {
                    code: 'VALIDATION_ERROR',
                    details: 'Maximum of 5 keywords allowed'
                }
            });
        }

        // Create the project
        const { data, error } = await supabase
            .from('projects')
            .insert({
                title,
                description,
                video_url,
                screenshot_url,
                techs,
                keywords,
                github_url,
                deploy_url,
                profile_id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: data,
            message: "Project created successfully"
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
    }
}

/**
 * Update an existing project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function updateProject(req, res) {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            video_url,
            screenshot_url,
            techs,
            keywords,
            github_url,
            deploy_url,
            profile_id
        } = req.body;

        // Check if project exists
        const { data: existingProject, error: checkError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found',
                    error: {
                        code: 'NOT_FOUND',
                        details: checkError
                    }
                });
            }
            throw checkError;
        }

        // Validate arrays if provided
        if (techs && techs.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Too many technologies',
                error: {
                    code: 'VALIDATION_ERROR',
                    details: 'Maximum of 5 technologies allowed'
                }
            });
        }

        if (keywords && keywords.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Too many keywords',
                error: {
                    code: 'VALIDATION_ERROR',
                    details: 'Maximum of 5 keywords allowed'
                }
            });
        }

        // If profile_id is being changed, check if the new profile exists
        if (profile_id) {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', profile_id)
                .single();

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    return res.status(404).json({
                        success: false,
                        message: 'Profile not found',
                        error: {
                            code: 'PROFILE_NOT_FOUND',
                            details: profileError
                        }
                    });
                }
                throw profileError;
            }
        }

        // Update the project
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (video_url !== undefined) updateData.video_url = video_url;
        if (screenshot_url !== undefined) updateData.screenshot_url = screenshot_url;
        if (techs !== undefined) updateData.techs = techs;
        if (keywords !== undefined) updateData.keywords = keywords;
        if (github_url !== undefined) updateData.github_url = github_url;
        if (deploy_url !== undefined) updateData.deploy_url = deploy_url;
        if (profile_id !== undefined) updateData.profile_id = profile_id;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: data,
            message: "Project updated successfully"
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
    }
}

/**
 * Delete a project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function deleteProject(req, res) {
    try {
        const { id } = req.params;

        // Check if project exists
        const { data: existingProject, error: checkError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found',
                    error: {
                        code: 'NOT_FOUND',
                        details: checkError
                    }
                });
            }
            throw checkError;
        }

        // Delete the project
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            data: {
                id: id
            },
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: {
                code: 'SERVER_ERROR',
                details: error
            }
        });
    }
}

module.exports = {
    getAllProjects,
    getProjectById,
    getProjectsByProfileId,
    createProject,
    updateProject,
    deleteProject
}; 