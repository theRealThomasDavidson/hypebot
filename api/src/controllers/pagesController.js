const { getProfileById } = require('./profileController');
const path = require('path');
const fs = require('fs');

// Define the pages directory path
const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Get API URL from environment or use default (without trailing slash)
const HOSTED_URL = (process.env.HOSTED_URL || 'http://localhost:3000').replace(/\/$/, '');

// Function to read file and replace placeholders
const serveFormattedHtml = (filePath, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error loading page');
        }

        // Replace EVERY instance of ${HOSTED_REPLACE_URL} in the file
        const formattedData = data.replace(/\$\{HOSTED_REPLACE_URL\}/g, HOSTED_URL);

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

const chat = (req, res) => {
    const filePath = path.join(PAGES_DIR, 'chat.html');
    serveFormattedHtml(filePath, res);
};

// Export functions directly to avoid any module loading issues
module.exports = {
    challengers_list,
    challenger_profile,
    chat
};
