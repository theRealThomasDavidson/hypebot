# Profile Cards Backend

Backend API for student profile cards project with Express.js and Docker.

## Features

- Express.js RESTful API
- Docker containerization
- Hot reloading for fast development
- Sample data with 100 student profiles
- Search and filter capabilities
- CORS enabled for frontend integration

## Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js and npm (for local development outside Docker)

## Quick Start

### Using Docker (Recommended)

1. Clone this repository
2. Run Docker Compose to start the server:

```bash
docker-compose up
```

The server will be available at http://localhost:3000 with hot reloading enabled.

### Local Development (without Docker)

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | Get all profiles |
| GET | `/api/profiles/:id` | Get a specific profile by ID |
| GET | `/api/profiles/search?query=keyword` | Search profiles by keyword |

## Environment Variables

Create a `.env` file in the root directory to customize configuration:

```
PORT=3000
NODE_ENV=development
```

## Frontend Integration

To connect the frontend to this API, update your fetch calls to use the appropriate endpoints:

```javascript
// Example: Fetching all profiles
fetch('http://localhost:3000/api/profiles')
  .then(response => response.json())
  .then(data => {
    // Use data.data to access the profiles array
    const profiles = data.data;
    displayProfiles(profiles);
  })
  .catch(error => console.error('Error fetching profiles:', error));
```

## Structure

```
.
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
├── package.json        # Dependencies and scripts
├── src/                # Source code
│   ├── server.js       # Express server setup
│   └── data/           # Sample data
│       └── profiles.js # Profile data and generator
└── README.md           # Documentation
```

## Development

The server uses nodemon for automatic restarts when you make changes. Edit files in the `src` directory and the server will automatically restart to reflect your changes. 