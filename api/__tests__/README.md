# API Tests

This directory contains automated tests for the HypeBot API using Jest and Supertest.

## Test Structure

The tests are organized into the following files:

- `healthCheck.test.js`: Tests for the `/health` endpoint
- `profiles.test.js`: Tests for all profile-related endpoints (route testing)
- `projects.test.js`: Tests for all project-related endpoints (route testing)
- `profileController.test.js`: Direct tests for the profile controller functions
- `projectController.test.js`: Direct tests for the project controller functions
- `supabase.test.js`: Tests for the Supabase database utility functions
- `supabaseClient.test.js`: Tests for the Supabase client initialization
- `setupTests.js`: Global test configuration
- `testServer.js`: Express app setup for testing

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with basic coverage reports
npm run test:coverage

# Run tests with detailed HTML coverage report
npm run test:coverage-report
# View the HTML report in a browser by opening the file: coverage/index.html
```

## Test Coverage

Current test coverage (as of last update):
- Statement coverage: 68.03%
- Branch coverage: 54.31%
- Function coverage: 100%
- Line coverage: 73.5%

Notable improvements:
- Supabase library: 100% coverage (up from 21.21%)
- Routes: 100% coverage
- Controller functions: 100% coverage (although not all branches are covered)

The tests aim to provide comprehensive coverage of all API endpoints, including:

- Success responses
- Error handling
- Validation
- Edge cases

We have three types of tests:
1. **Route tests**: Test the API endpoints through the Express routes
2. **Controller tests**: Test the controller functions directly by mocking the database responses
3. **Library tests**: Test database utility functions and client initialization

## Known Issues

There are a few tests that are currently skipped due to issues with mocking error conditions:
- Tests for 404 responses when resources don't exist

## Mock Strategy

These tests use Jest's mocking capabilities to isolate components and avoid network/database dependencies. The tests mock:

1. Controller functions in route tests to avoid actual controller execution
2. Database (Supabase) calls in controller tests to avoid actual database operations
3. Response objects to test method calls
4. Request objects with test data
5. Environment variables and process functions for initialization tests

## Adding New Tests

When adding new endpoints to the API, please follow these guidelines for creating tests:

1. Add route test cases to the appropriate file based on the resource type
2. Add controller test cases to test the business logic directly
3. Ensure you test both success and error cases
4. Mock any external dependencies
5. Add comments explaining complex test scenarios

## Troubleshooting Common Issues

- **Timeouts**: If tests are timing out, check if you're awaiting asynchronous operations properly
- **Mock Issues**: If mocks aren't working, ensure paths are correct and the mock implementation matches the expected interface
- **Database Errors**: Tests should never connect to a real database; check if your mocks are configured correctly 