const { getProfileById } = require('./profileController');
const path = require('path');
const fs = require('fs');

// Define the pages directory path
const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Get API URL from environment or use default (without trailing slash)
const API_URL = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Function to read file and replace placeholders
const serveFormattedHtml = (filePath, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error loading page');
        }

        // Replace the API_BASE_URL line with the correct API URL
        const formattedData = data.replace(
            /const API_BASE_URL = ['"].*['"]/g,
            `const API_BASE_URL = '${API_URL}'`
        );

        // Set content type header and send the formatted HTML
        res.setHeader('Content-Type', 'text/html');
        res.send(formattedData);
    });
};

const challengers_list = (req, res) => {
    const filePath = path.join(PAGES_DIR, 'challengers_list.html');
    serveFormattedHtml(filePath, res);
};

const challenger_profile = (req, res) => {
    const filePath = path.join(PAGES_DIR, 'individual_challenger.html');
    serveFormattedHtml(filePath, res);
};

// Export functions directly to avoid any module loading issues
module.exports = {
    challengers_list,
    challenger_profile,
};
