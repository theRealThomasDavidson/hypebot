const profileController = require('./profileController');
const path = require('path');

// Define the pages directory path
const PAGES_DIR = path.join(__dirname, '..', 'pages');

const students_list = (req, res) => {
    const filePath = path.join(PAGES_DIR, 'student_list.html');
    res.sendFile(filePath, { root: '/' }, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error loading page');
        }
    });
};

const student_profile = (req, res) => {
    const filePath = path.join(PAGES_DIR, 'individual_student.html');
    
    // Using profileController approach:
    /*
    const profile = new Promise((resolve, reject) => {
        profileController.getProfileById(student_id, (err, profile) => {
            if (err) reject(err);
            else resolve(profile);
        });
    });

    if (!profile) {
        return res.status(404).json({ error: 'Student not found' });
    }
    */

    res.sendFile(filePath, { root: '/' }, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error loading page');
        }
    });
};

module.exports = {
    students_list,
    student_profile,
};
