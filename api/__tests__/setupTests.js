// Setup for Jest tests
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

// Global test timeout (30 seconds)
jest.setTimeout(30000); 