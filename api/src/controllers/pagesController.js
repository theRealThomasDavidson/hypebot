const { getProfileById } = require('./profileController');
const path = require('path');

// Define the pages directory path
const PAGES_DIR = path.join(__dirname, '..', 'pages');

const challengers_list = (req, res) => {
    const filePath = path.join(PAGES_DIR, 'challengers_list.html');
    res.sendFile(filePath, { root: '/' }, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error loading page');
        }
    });
};

// Challenger profile page function
const challenger_profile = (req, res) => {
    const filePath = path.join(PAGES_DIR, 'individual_challenger.html');

    res.sendFile(filePath, { root: '/' }, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error loading page');
        }
    });
};

// Export functions directly to avoid any module loading issues
module.exports = {
    challenger_profile,
    challengers_list,
};
