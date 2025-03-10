const { getProfileById } = require('./profileController');
const path = require('path');
const fs = require('fs');

// Define the pages directory path
const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Get API URL from environment or use default (without trailing slash)
const HOSTED_URL = (process.env.HOSTED_URL || 'http://localhost:3000').replace(/\/$/, '');

// Function to read file and replace placeholders
const serveFormattedHtml = async (res, filePath) => {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        // Replace EVERY instance of ${HOSTED_REPLACE_URL} in the file
        const formattedData = data.replace(/\$\{HOSTED_REPLACE_URL\}/g, HOSTED_URL);

        res.setHeader('Content-Type', 'text/html');
        res.send(formattedData);
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Error loading page');
    }
};

const challengers_list = async (req, res) => {
    await serveFormattedHtml(res, path.join(PAGES_DIR, 'challengers_list.html'));
};

const challenger_profile = async (req, res) => {
    await serveFormattedHtml(res, path.join(PAGES_DIR, 'individual_challenger.html'));
};

const challenger_projects = async (req, res) => {
    await serveFormattedHtml(res, path.join(PAGES_DIR, 'challenger_projects.html'));
};

const chat = async (req, res) => {
    await serveFormattedHtml(res, path.join(PAGES_DIR, 'chat.html'));
};

const projects = async (req, res) => {
    await serveFormattedHtml(res, path.join(PAGES_DIR, 'projects.html'));
};

// Export functions directly to avoid any module loading issues
module.exports = {
    challengers_list,
    challenger_profile,
    challenger_projects,
    chat,
    projects
};
