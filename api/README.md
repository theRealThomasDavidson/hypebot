# API Backend

This is the API backend for the semantic search application. It provides endpoints for storing, searching, and managing documents with vector embeddings.

## Technologies

- Node.js
- Express
- OpenAI API for embeddings
- Pinecone for vector storage and similarity search

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- OpenAI API key
- Pinecone account and API key

### Installation

1. Clone the repository
2. Navigate to the API directory:
   ```bash
   cd api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment variables example file:
   ```bash
   cp .env.example .env
   ```
5. Update the `.env` file with your API keys and configuration.

### Pinecone Setup

1. Create a Pinecone account at [pinecone.io](https://www.pinecone.io/)
2. Obtain your API key from the Pinecone dashboard
3. Create an index (or use our setup script - see below)
4. Add your Pinecone credentials to the `.env` file:
   ```
   PINECONE_API_KEY=your_api_key
   PINECONE_INDEX=your_index_name
   ```

#### Using the Pinecone Setup Script

We provide a setup script to help manage your Pinecone indexes:

```bash
# List all indexes
node src/setup_pinecone.js list

# Describe an index
node src/setup_pinecone.js describe your_index_name

# Create a new index
node src/setup_pinecone.js create-index

# Delete an index
node src/setup_pinecone.js delete-index your_index_name
```

### Test Your Setup

Run the test script to verify your Pinecone and OpenAI setup:

```bash
node src/test_pinecone.js
```

## Running the Server

Start the server in development mode:

```bash
npm run dev
```

Or in production mode:

```bash
npm start
```

## API Endpoints

The server exposes the following endpoints:

- `POST /api/documents` - Store a document with its vector embedding
- `GET /api/search` - Perform semantic search
- `DELETE /api/documents/:id` - Delete a document
- `DELETE /api/users/:userId/documents` - Delete all documents for a user

## Development

### Project Structure

```
api/
├── src/             # Source code
│   ├── controllers/ # Controller functions for routes
│   ├── routes/      # API route definitions
│   ├── lib/         # Utility libraries
│   ├── pinecone_client.js        # Pinecone client setup
│   ├── pinecone_index.js         # Index management
│   ├── pinecone_operations.js    # Vector operations
│   ├── semantic_search.js        # OpenAI embedding integration
│   ├── setup_pinecone.js         # Pinecone setup script
│   ├── test_pinecone.js          # Test script
│   └── server.js    # Express server entry point
├── tests/           # Test files
├── .env.example     # Example environment variables
├── .env             # Environment variables (git-ignored)
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

### Testing

Run the tests with:

```bash
npm test
```

## Troubleshooting

If you encounter issues with Pinecone:

1. Check your API key and index name
2. Verify network connectivity
3. Run the test script for diagnostics
4. Check the Pinecone status page

For more detailed instructions on Pinecone setup, see the [README-PINECONE.md](../README-PINECONE.md) file.

## License

This project is licensed under the MIT License. 