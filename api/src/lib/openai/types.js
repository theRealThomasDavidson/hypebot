/**
 * @typedef {Object} Embedding
 * @property {string} id
 * @property {string} text
 * @property {number[]} vector
 * @property {Object.<string, any>} metadata
 * @property {Date} created_at
 */

/**
 * @typedef {Object} ProfileEmbeddingMetadata
 * @property {'profile'} type
 * @property {string} name
 * @property {string[]} skills
 * @property {number} project_count
 */

/**
 * @typedef {Embedding} ProfileEmbedding
 * @property {ProfileEmbeddingMetadata} metadata
 */

/**
 * @typedef {Object} ProjectEmbeddingMetadata
 * @property {'project'} type
 * @property {string} title
 * @property {string[]} techs
 * @property {string[]} keywords
 * @property {string} profile_id
 * @property {string} profile_name
 */

/**
 * @typedef {Embedding} ProjectEmbedding
 * @property {ProjectEmbeddingMetadata} metadata
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} [video_url]
 * @property {string} [screenshot_url]
 * @property {string[]} techs
 * @property {string[]} keywords
 * @property {string} [github_url]
 * @property {string} [deploy_url]
 * @property {string} profile_id
 * @property {Profile} [profile]
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} name
 * @property {string} blurb
 * @property {string} bio
 * @property {string[]} skills
 * @property {string} [pic_url]
 * @property {string} [github_url]
 * @property {string} [linkedin_url]
 * @property {string} [gauntlet_url]
 * @property {string} [twitter_url]
 * @property {Project[]} [projects]
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} SearchResult
 * @property {'profile' | 'project'} content_type
 * @property {string} content_id
 * @property {string} content_text
 * @property {number} similarity
 * @property {Object.<string, any>} metadata
 */

module.exports = {}; 