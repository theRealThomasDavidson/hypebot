const { getProfileById, fetchAllProfiles } = require('./profileController');
const path = require('path');
const fs = require('fs');
const { getAllProfiles } = require('./profileController');

// Define the pages directory path
const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Get API URL from environment or use default (without trailing slash)
const HOSTED_URL = (process.env.HOSTED_URL || 'http://localhost:3000').replace(/\/$/, '');

// Function to read file and replace placeholders
const serveFormattedHtml = (filePath, res, replace_data) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error loading page');
        }

        // Replace EVERY instance of ${HOSTED_REPLACE_URL} in the file
        let formattedData = data;
        for (const key in replace_data) {
            formattedData = formattedData.replace(new RegExp(`\\$\{${key}\\}`, 'g'), replace_data[key]);
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(formattedData);
    });
};

const challengers_list = async (req, res) => {
    const filePath = path.join(PAGES_DIR, 'challengers_list.html');
    try {
        const profiles = await fetchAllProfiles();
        const replace_data = {
            HOSTED_REPLACE_URL: HOSTED_URL,
            CHALLENGERS_LIST: JSON.stringify(profiles),
        }
        serveFormattedHtml(filePath, res, replace_data);
    } catch (error) {
        console.error('Error loading challengers list:', error);
        res.status(500).send('Error loading page');
    }
};

const challenger_profile = (req, res) => {
    const filePath = path.join(PAGES_DIR, 'individual_challenger.html');
    serveFormattedHtml(filePath, res,);
};

// Export functions directly to avoid any module loading issues
module.exports = {
    challengers_list,
    challenger_profile,
};
