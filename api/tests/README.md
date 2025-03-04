# Semantic Search API Testing

This directory contains tests for the Semantic Search API.

## Prerequisites

- Python 3.6+
- Node.js 14+
- Required npm packages installed in the `api` directory
- Required Python packages: `requests`
- Running Supabase instance with pgvector setup

## Running Tests

### 1. Make sure the API server is running:

```bash
# From the api directory
npm install  # If you haven't installed dependencies
node src/server.js
```

### 2. Run the Python test script:

```bash
# From the api directory
pip install requests  # If you haven't installed requests
python tests/test_api.py
```

## Test Flow

The Python test script performs the following operations:

1. **Health Check**: Verifies the API server is running.
2. **Create Vectors**: Creates vector embeddings for test documents.
3. **Search Vectors**: Performs semantic searches using test queries.
4. **Delete Vectors**: Cleans up by deleting the test vectors.

## Manual Testing

You can also test the API manually using curl:

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Create Vector
```bash
curl -X POST http://localhost:3000/api/vectors \
  -H "Content-Type: application/json" \
  -d '{"text": "Sample text for vector embedding", "personId": "test_user_123"}'
```

### Search Vectors
```bash
curl "http://localhost:3000/api/vectors/search?query=example%20search%20query&limit=5"
```

### Delete Vector
```bash
curl -X DELETE http://localhost:3000/api/vectors/123
```

### Delete Person's Vectors
```bash
curl -X DELETE http://localhost:3000/api/vectors/person/test_user_123
``` 