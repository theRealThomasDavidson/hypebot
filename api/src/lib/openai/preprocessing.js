/**
 * Clean and normalize text for embedding generation
 * @param {string} text - The text to normalize
 * @returns {string} The normalized text
 */
function normalizeText(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
    .toLowerCase();
}

/**
 * Generate text template for profile embedding
 * @param {import('./types').Profile} profile - The profile to generate text for
 * @returns {string} The generated text
 */
function generateProfileText(profile) {
  const sections = [
    `Name: ${profile.name}`,
    `Summary: ${profile.blurb}`,
    `About: ${profile.bio}`,
    `Skills: ${profile.skills.join(', ')}`,
  ];

  if (profile.projects?.length) {
    sections.push(`Projects: ${profile.projects.map(p => p.title).join(', ')}`);
  }

  return sections
    .filter(section => section.split(': ')[1]?.trim())  // Remove empty sections
    .join('\n')
    .trim();
}

/**
 * Generate text template for project embedding
 * @param {import('./types').Project} project - The project to generate text for
 * @returns {string} The generated text
 */
function generateProjectText(project) {
  const sections = [
    `Title: ${project.title}`,
    `Description: ${project.description}`,
    `Technologies: ${project.techs.join(', ')}`,
  ];

  if (project.keywords?.length) {
    sections.push(`Keywords: ${project.keywords.join(', ')}`);
  }

  if (project.profile?.name) {
    sections.push(`Created by: ${project.profile.name}`);
  }

  return sections
    .filter(section => section.split(': ')[1]?.trim())  // Remove empty sections
    .join('\n')
    .trim();
}

/**
 * Create metadata for profile embedding
 * @param {import('./types').Profile} profile - The profile to create metadata for
 * @returns {import('./types').ProfileEmbeddingMetadata} The profile metadata
 */
function createProfileMetadata(profile) {
  return {
    type: 'profile',
    name: profile.name,
    skills: profile.skills,
    project_count: profile.projects?.length || 0
  };
}

/**
 * Create metadata for project embedding
 * @param {import('./types').Project} project - The project to create metadata for
 * @returns {import('./types').ProjectEmbeddingMetadata} The project metadata
 */
function createProjectMetadata(project) {
  return {
    type: 'project',
    title: project.title,
    techs: project.techs,
    keywords: project.keywords || [],
    profile_id: project.profile_id,
    profile_name: project.profile?.name || ''
  };
}

/**
 * Validate text length for OpenAI API limits
 * @param {string} text - The text to validate
 * @returns {boolean} Whether the text is within limits
 */
function validateTextLength(text) {
  // OpenAI has a token limit, roughly 4 chars per token
  const APPROX_MAX_TOKENS = 8000;
  const CHARS_PER_TOKEN = 4;
  return text.length <= APPROX_MAX_TOKENS * CHARS_PER_TOKEN;
}

/**
 * Truncate text to fit within OpenAI token limits while preserving meaning
 * @param {string} text - The text to truncate
 * @returns {string} The truncated text
 */
function truncateText(text) {
  const MAX_LENGTH = 8000 * 4; // Same as validateTextLength
  
  if (text.length <= MAX_LENGTH) {
    return text;
  }

  // Split into sentences and gradually add until we reach the limit
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let result = '';
  
  for (const sentence of sentences) {
    if ((result + sentence).length > MAX_LENGTH) {
      break;
    }
    result += sentence;
  }

  return result.trim();
}

module.exports = {
  normalizeText,
  generateProfileText,
  generateProjectText,
  createProfileMetadata,
  createProjectMetadata,
  validateTextLength,
  truncateText
}; 