const { getProfileById, fetchAllProfiles } = require('./profileController');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Define the pages directory path
const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Get API URL from environment or use default (without trailing slash)
const HOSTED_URL = (process.env.HOSTED_URL || 'http://localhost:3000').replace(/\/$/, '');

// Function to fetch and convert image to base64
const getImageAsBase64 = async (url) => {
    if (!url) return null;
    return new Promise((resolve) => {
        https.get(url, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64 = buffer.toString('base64');
                resolve(`data:image/${url.endsWith('png') ? 'png' : 'jpeg'};base64,${base64}`);
            });
            response.on('error', () => resolve(null));
        }).on('error', () => resolve(null));
    });
};

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
        const profilesWithImages = await Promise.all(profiles.map(async profile => {
            const imageUrl = profile.pic_url || 'https://randomuser.me/api/portraits/lego/1.jpg';
            const base64Image = await getImageAsBase64(imageUrl);
            return {
                ...profile,
                image: base64Image || imageUrl,
                title: profile.blurb || 'GauntletAI Challenger',
                bio: profile.bio || 'No bio available',
                profileUrl: `/pages/challenger/${profile.id}`,
                keywords: profile.skills ? profile.skills.join(',') : ''
            };
        }));
        const replace_data = {
            HOSTED_REPLACE_URL: HOSTED_URL,
            CHALLENGERS_LIST: JSON.stringify(profilesWithImages),
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
