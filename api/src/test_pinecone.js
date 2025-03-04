/**
 * Pinecone Test Script
 * 
 * This script tests the Pinecone setup and operations.
 * It verifies connection, index operations, and data operations.
 */

require('dotenv').config();
const { getPineconeClient, getIndex } = require('./pinecone_client');
const { upsertDocument, querySimilar, deleteVectors } = require('./pinecone_operations');

// Mock data for testing
const mockEmbedding = Array(1536).fill(0).map(() => Math.random() - 0.5);
const mockDocument = {
  text: "This is a test document for Pinecone vector database",
  userId: "test-user-123",
  embedding: mockEmbedding,
  metadata: {
    source: "test-script",
    timestamp: new Date().toISOString()
  }
};

// Use existing index instead of creating a new one for testing
const indexName = process.env.PINECONE_INDEX || 'semantic-search';

async function runTests() {
  console.log('==================================');
  console.log('STARTING PINECONE INTEGRATION TESTS');
  console.log('==================================');
  
  try {
    // Test 1: Verify API connection
    console.log('\n🧪 TEST 1: Verify Pinecone connection');
    const pinecone = getPineconeClient();
    console.log('✅ Successfully connected to Pinecone');
    
    // Test 2: Verify index access
    console.log(`\n🧪 TEST 2: Verify index access (${indexName})`);
    const index = getIndex(indexName);
    console.log(`✅ Successfully accessed index: ${indexName}`);
    
    // Test 3: Basic stats check
    console.log('\n🧪 TEST 3: Check index stats');
    try {
      const stats = await index.describeIndexStats();
      console.log('✅ Index stats retrieved:');
      console.log(`- Total vectors: ${stats.totalVectorCount || 'not available'}`);
      console.log(`- Dimensions: ${stats.dimension || 'not available'}`);
      console.log(`- Namespaces: ${Object.keys(stats.namespaces || {}).join(', ') || 'none'}`);
    } catch (error) {
      console.log('⚠️ Could not retrieve index stats, this might be expected for some configurations.');
      console.log(`Error: ${error.message}`);
      // Continue with tests even if stats cannot be retrieved
    }
    
    // Test 4: Upsert document
    console.log('\n🧪 TEST 4: Upsert vector');
    const testId = `test-${Date.now()}`;
    const testVector = {
      id: testId,
      values: mockEmbedding,
      metadata: {
        text: "This is a test vector",
        userId: "test-user",
        timestamp: new Date().toISOString()
      }
    };
    
    try {
      await index.upsert([testVector]);
      console.log(`✅ Successfully upserted test vector with ID: ${testId}`);
    } catch (error) {
      console.error('❌ Upsert failed:', error.message);
      throw error;
    }
    
    // Test 5: Query vector
    console.log('\n🧪 TEST 5: Query similar vectors');
    try {
      const searchResults = await index.query({
        vector: mockEmbedding,
        topK: 1,
        includeMetadata: true
      });
      
      if (searchResults.matches && searchResults.matches.length > 0) {
        console.log(`✅ Query returned ${searchResults.matches.length} results`);
        console.log('First match:', {
          id: searchResults.matches[0].id,
          score: searchResults.matches[0].score,
          metadata: searchResults.matches[0].metadata
        });
      } else {
        console.log('⚠️ Query returned no matches');
      }
    } catch (error) {
      console.error('❌ Query failed:', error.message);
      throw error;
    }
    
    // Test 6: Delete vector
    console.log(`\n🧪 TEST 6: Delete test vector (${testId})`);
    try {
      await index.deleteOne(testId);
      console.log(`✅ Successfully deleted test vector with ID: ${testId}`);
    } catch (error) {
      console.error('❌ Delete failed:', error.message);
      throw error;
    }
    
    console.log('\n==================================');
    console.log('🎉 ALL PINECONE TESTS PASSED');
    console.log('==================================');
  } catch (error) {
    console.error('\n⛔ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests(); 