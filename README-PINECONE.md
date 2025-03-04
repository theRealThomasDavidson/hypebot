# Pinecone Vector Database Integration

This project uses Pinecone as a vector database for semantic search capabilities. The following guide explains how to set up and use Pinecone with this application.

## Setup Instructions

### 1. Create a Pinecone Account

1. Go to [Pinecone](https://www.pinecone.io/) and sign up for an account.
2. Once registered, navigate to the API Keys section and create a new API key.
3. Copy the API key for use in your environment variables.

### 2. Create a Pinecone Index

You can create an index through the Pinecone dashboard or using our setup script:

#### Using the Dashboard:

1. Go to the "Indexes" section in the Pinecone dashboard.
2. Click "Create Index".
3. Enter an index name (e.g., "semantic-search").
4. Set the dimensions to 1536 for OpenAI embeddings.
5. Choose "cosine" as the metric.
6. Select your preferred cloud provider and region.
7. Click "Create Index".

#### Using the Setup Script:

```bash
node api/src/setup_pinecone.js create-index
```

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp api/.env.example api/.env
   ```

2. Update the following variables in the `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_index_name
   ```

### 4. Install Dependencies

```bash
cd api
npm install
```

## Testing the Setup

Run the test script to verify your Pinecone setup:

```bash
node api/src/test_pinecone.js
```

This script will:
1. Connect to Pinecone
2. Create a temporary test index
3. Insert, query, and delete vectors
4. Clean up the test index

If all tests pass, your Pinecone configuration is correct.

## Usage

### Importing Documents

To store documents in Pinecone with their embeddings:

```javascript
const { storeDocument } = require('./api/src/semantic_search');

await storeDocument({
  text: "Your document text here",
  userId: "user123",
  metadata: { 
    source: "example",
    category: "documentation"
  }
});
```

### Semantic Search

To perform semantic search:

```javascript
const { semanticSearch } = require('./api/src/semantic_search');

const results = await semanticSearch({
  query: "Your search query",
  limit: 5,
  threshold: 0.7,
  filter: { userId: "user123" }
});

console.log(results);
```

## File Structure

- `api/src/pinecone_client.js` - Base client setup
- `api/src/pinecone_index.js` - Index management operations
- `api/src/pinecone_operations.js` - Vector operations (upsert, query, delete)
- `api/src/semantic_search.js` - OpenAI embedding integration with Pinecone
- `api/src/test_pinecone.js` - Tests for Pinecone operations

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify your API key is correct
2. Check if your index exists using the dashboard
3. Ensure you're not hitting rate limits
4. Verify network connectivity to Pinecone servers

## Additional Resources

- [Pinecone Documentation](https://docs.pinecone.io/)
- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings) 