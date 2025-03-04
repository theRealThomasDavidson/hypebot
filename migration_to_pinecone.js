#!/usr/bin/env node
/**
 * Migration Script: Supabase to Pinecone
 * 
 * This script migrates vector embeddings from Supabase to Pinecone.
 * 
 * Usage:
 *   node migration_to_pinecone.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { migrateFromSupabase } = require('./api/src/semantic_search_pinecone');
const pineconeModule = require('./api/src/pinecone');

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

/**
 * Print a formatted header
 */
function printHeader(text) {
  console.log('\n' + colors.bgBlue + colors.white + colors.bright + ' ' + text + ' ' + colors.reset + '\n');
}

/**
 * Print an info message
 */
function printInfo(text) {
  console.log(colors.cyan + 'ℹ ' + text + colors.reset);
}

/**
 * Print a success message
 */
function printSuccess(text) {
  console.log(colors.green + '✓ ' + text + colors.reset);
}

/**
 * Print an error message
 */
function printError(text) {
  console.log(colors.red + '✗ ' + text + colors.reset);
}

/**
 * Print a warning message
 */
function printWarning(text) {
  console.log(colors.yellow + '⚠ ' + text + colors.reset);
}

/**
 * Main migration function
 */
async function runMigration() {
  printHeader('MIGRATION: SUPABASE TO PINECONE');
  
  try {
    // Check environment variables
    const missingVars = [];
    
    if (!process.env.SUPABASE_URL) missingVars.push('SUPABASE_URL');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY) {
      missingVars.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    }
    if (!process.env.PINECONE_API_KEY) missingVars.push('PINECONE_API_KEY');
    if (!process.env.PINECONE_ENVIRONMENT) missingVars.push('PINECONE_ENVIRONMENT');
    if (!process.env.PINECONE_INDEX) missingVars.push('PINECONE_INDEX');
    
    if (missingVars.length > 0) {
      printError(`Missing environment variables: ${missingVars.join(', ')}`);
      printInfo('Please set these variables in your .env file and try again.');
      process.exit(1);
    }
    
    // Initialize Supabase client
    printInfo('Initializing Supabase client...');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    printSuccess('Supabase client initialized');
    
    // Initialize Pinecone
    printInfo('Initializing Pinecone...');
    const isPineconeReady = await pineconeModule.setupPinecone();
    
    if (!isPineconeReady) {
      printError('Failed to initialize Pinecone');
      printInfo('Please check your Pinecone settings and ensure the index exists.');
      process.exit(1);
    }
    
    printSuccess('Pinecone initialized');
    
    // Start migration
    printInfo('Starting migration process...');
    printWarning('This process will copy all vectors from Supabase to Pinecone.');
    printWarning('Existing vectors in Pinecone with the same IDs will be overwritten.');
    printInfo('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    // Wait 5 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    printInfo('Migration in progress...');
    
    // Perform migration
    const migratedCount = await pineconeModule.migrateFromSupabase(supabase);
    
    if (migratedCount > 0) {
      printSuccess(`Successfully migrated ${migratedCount} vectors to Pinecone`);
    } else {
      printWarning('No vectors were migrated to Pinecone');
    }
    
    printHeader('MIGRATION COMPLETE');
    printInfo('Next steps:');
    printInfo('1. Update your .env file to use semantic_search_pinecone.js instead of semantic_search.js');
    printInfo('2. Update your server.js to require the Pinecone version');
    printInfo('3. Restart your server to use Pinecone for vector search');
    
  } catch (error) {
    printError(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(error => {
  printError(`Unhandled error: ${error.message}`);
  console.error(error);
  process.exit(1); 