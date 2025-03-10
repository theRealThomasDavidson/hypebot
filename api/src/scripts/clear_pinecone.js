require('dotenv').config();
const { connectPinecone } = require('../lib/pinecone');

/**
 * Clear all embeddings from Pinecone index
 */
async function clearAllEmbeddings() {
    try {
        console.log('Connecting to Pinecone...');
        const { index } = await connectPinecone();

        console.log('Getting current vector count...');
        const stats = await index.describeIndexStats();
        const vectorCount = stats.totalRecordCount || 0;

        console.log('Deleting all vectors from index...');
        await index.deleteAll();

        console.log(`✅ Successfully deleted ${vectorCount} vectors`);
    } catch (error) {
        console.error('Error clearing Pinecone index:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    clearAllEmbeddings()
        .then(() => {
            console.log('Done!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Failed to clear embeddings:', error);
            process.exit(1);
        });
}

module.exports = { clearAllEmbeddings }; 