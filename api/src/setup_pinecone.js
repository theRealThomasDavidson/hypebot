/**
 * Pinecone Setup Script
 * 
 * This script helps set up and manage Pinecone indexes.
 * It provides commands for creating, listing, and deleting indexes.
 */

require('dotenv').config();
const { getPineconeClient } = require('./pinecone_client');
const { listIndexes, describeIndex, createIndex, deleteIndex } = require('./pinecone_index');

// Defaults
const DEFAULT_INDEX_NAME = process.env.PINECONE_INDEX || 'semantic-search';
const DEFAULT_DIMENSION = 1536; // OpenAI's text-embedding-3-small
const DEFAULT_METRIC = 'cosine';

// Command-line arguments
const args = process.argv.slice(2);
const command = args[0];

async function showUsage() {
  console.log(`
Pinecone Setup Script
=====================

Commands:
  list                    List all indexes
  describe <indexName>    Get information about an index
  create-index            Create a new index
  delete-index <indexName>Delete an index

Examples:
  node setup_pinecone.js list
  node setup_pinecone.js describe semantic-search
  node setup_pinecone.js create-index
  node setup_pinecone.js delete-index semantic-search
  `);
}

async function listAllIndexes() {
  try {
    const indexes = await listIndexes();
    console.log('\nPinecone Indexes:');
    console.log('================');
    
    if (indexes.length === 0) {
      console.log('No indexes found');
    } else {
      indexes.forEach(index => {
        console.log(`- ${index.name} (${index.dimension} dimensions, ${index.metric} metric)`);
      });
    }
    
    console.log('\nTotal:', indexes.length);
  } catch (error) {
    console.error('Error listing indexes:', error);
  }
}

async function describeIndexDetails(indexName) {
  try {
    const indexDetails = await describeIndex(indexName);
    console.log('\nIndex Details:');
    console.log('=============');
    console.log(JSON.stringify(indexDetails, null, 2));
  } catch (error) {
    console.error(`Error describing index ${indexName}:`, error);
  }
}

async function createNewIndex() {
  // Ask for user confirmation
  console.log(`
About to create a new Pinecone index with:
- Name: ${DEFAULT_INDEX_NAME}
- Dimensions: ${DEFAULT_DIMENSION}
- Metric: ${DEFAULT_METRIC}
  `);
  
  console.log('Creating index...');
  
  try {
    const result = await createIndex({
      name: DEFAULT_INDEX_NAME,
      dimension: DEFAULT_DIMENSION,
      metric: DEFAULT_METRIC
    });
    
    console.log(result.message);
    console.log('\nNOTE: The index may take a few minutes to become fully ready');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.error(`Index '${DEFAULT_INDEX_NAME}' already exists`);
    } else {
      console.error('Error creating index:', error);
    }
  }
}

async function deleteExistingIndex(indexName) {
  if (!indexName) {
    console.error('Error: Index name required for delete-index command');
    return;
  }
  
  // Ask for user confirmation
  console.log(`WARNING: About to delete index '${indexName}'`);
  console.log('This action cannot be undone!');
  
  console.log('Deleting index...');
  
  try {
    const result = await deleteIndex(indexName);
    console.log(result.message);
  } catch (error) {
    console.error(`Error deleting index ${indexName}:`, error);
  }
}

// Main execution
(async () => {
  if (!process.env.PINECONE_API_KEY) {
    console.error('Error: PINECONE_API_KEY environment variable is not set');
    process.exit(1);
  }

  try {
    // Initialize client
    getPineconeClient();

    // Process command
    switch (command) {
      case 'list':
        await listAllIndexes();
        break;
      
      case 'describe':
        const indexToDescribe = args[1] || DEFAULT_INDEX_NAME;
        await describeIndexDetails(indexToDescribe);
        break;
      
      case 'create-index':
        await createNewIndex();
        break;
      
      case 'delete-index':
        const indexToDelete = args[1];
        await deleteExistingIndex(indexToDelete);
        break;
      
      default:
        await showUsage();
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})(); 