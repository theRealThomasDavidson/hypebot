# API Endpoints Documentation

This document provides comprehensive information about all available API endpoints in the HypeBot Backend.

## Table of Contents

- [API Endpoints Documentation](#api-endpoints-documentation)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Response Format](#response-format)
  - [Error Handling](#error-handling)
  - [Rate Limiting](#rate-limiting)
  - [Endpoints](#endpoints)
    - [Health Check](#health-check)
      - [GET /health](#get-health)
    - [Profiles](#profiles)
      - [GET /api/profiles](#get-apiprofiles)
      - [GET /api/profiles/:id](#get-apiprofilesid)
      - [POST /api/profiles](#post-apiprofiles)
      - [PUT /api/profiles/:id](#put-apiprofilesid)
      - [DELETE /api/profiles/:id](#delete-apiprofilesid)
    - [Projects](#projects)
      - [GET /api/projects](#get-apiprojects)
      - [GET /api/projects/:id](#get-apiprojectsid)
      - [GET /api/profiles/:profileId/projects](#get-apiprofilesprofileidprojects)
      - [POST /api/projects](#post-apiprojects)
      - [PUT /api/projects/:id](#put-apiprojectsid)
      - [DELETE /api/projects/:id](#delete-apiprojectsid)
  - [Adding New Endpoint Documentation](#adding-new-endpoint-documentation)

## Overview

The HypeBot API provides access to Challenger profile data, including personal information, skills, and projects.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication.

## Response Format

All endpoints return data in JSON format with the following structure:

```json
{
  "success": true|false,
  "data": [result_data],
  "message": "Success or error message"
}
```

## Error Handling

When errors occur, the API returns an appropriate HTTP status code and a JSON response with error details:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

There are currently no rate limits enforced on the API.

## Endpoints

### Health Check

#### GET /health

Check the health status of the API.

**Parameters:** None

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2002-08-08T00:00:00.000Z",
  "service": "hypebot-backend"
}
```

### Profiles

#### GET /api/profiles

Retrieve a list of all Challenger profiles.

**Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "data": [
    {
	  "id": "uuid",
	  "name": "Challenger Name",
	  "blurb": "Challenger blurb...",
	  "bio": "Challenger biography...",
	  "skills": [
	  	"skill1",
	  	"skill2",
	  	"skill3"
	  ],
	  "pic_url": "https://example.com/profile.jpg",
	  "github_url": "https://github.com/challenger",
	  "linkedin_url": "https://linkedin.com/in/challenger",
	  "gauntlet_url": "https://gauntletai.com/challenger",
	  "twitter_url": "https://x.com/challenger",
      "created_at": "2002-08-08T00:00:00.000Z",
      "updated_at": "2002-08-08T00:00:00.000Z"
    },
    // More profiles...
  ],
  "message": "Profiles retrieved successfully"
}
```

#### GET /api/profiles/:id

Retrieve a specific profile by ID.

**Parameters:**
- `id` (path parameter, required): The UUID of the profile to retrieve

**Response:**
```json
{
  "success": true,
  "data": {
	"id": "uuid",
	"name": "Challenger Name",
	"blurb": "Challenger blurb...",
	"bio": "Challenger biography...",
	"skills": [
		"skill1",
		"skill2",
		"skill3"
	],
	"pic_url": "https://example.com/profile.jpg",
	"github_url": "https://github.com/challenger",
	"linkedin_url": "https://linkedin.com/in/challenger",
	"gauntlet_url": "https://gauntletai.com/challenger",
	"twitter_url": "https://x.com/challenger",
	"created_at": "2002-08-08T00:00:00.000Z",
	"updated_at": "2002-08-08T00:00:00.000Z",
	"projects": []
  },
  "message": "Profile retrieved successfully"
}
```

**Error Responses:**
- `404 Not Found`: If the profile with the specified ID does not exist

#### POST /api/profiles

Create a new profile.

**Request Body:**
```json
{
  "name": "Challenger Name",
  "blurb": "Challenger blurb...",
  "bio": "Challenger biography...",
  "skills": ["skill1", "skill2", "skill3"],
  "pic_url": "https://example.com/profile.jpg",
  "github_url": "https://github.com/challenger",
  "linkedin_url": "https://linkedin.com/in/challenger",
  "gauntlet_url": "https://gauntletai.com/challenger",
  "twitter_url": "https://x.com/challenger"
}
```

**Required Fields:**
- `name` (string): The challenger's name
- `blurb` (string): A brief blurb about the challenger
- `bio` (string): A brief biography of the challenger

**Optional Fields:**
- `skills` (array of strings): List of the challenger's skills
- `pic_url` (string): The URL of the challenger's profile picture
- `github_url` (string): The URL of the challenger's GitHub profile
- `linkedin_url` (string): The URL of the challenger's LinkedIn profile
- `gauntlet_url` (string): The URL of the challenger's Gauntlet profile
- `twitter_url` (string): The URL of the challenger's Twitter profile

**Response:**
```json
{
  "success": true,
  "data": {
	"id": "uuid",
	"name": "Challenger Name",
	"blurb": "Challenger blurb...",
	"bio": "Challenger biography...",
	"skills": [
		"skill1",
		"skill2",
		"skill3"
	],
	"pic_url": "https://example.com/profile.jpg",
	"github_url": "https://github.com/challenger",
	"linkedin_url": "https://linkedin.com/in/challenger",
	"gauntlet_url": "https://gauntletai.com/challenger",
	"twitter_url": "https://x.com/challenger",
	"created_at": "2002-08-08T00:00:00.000Z",
	"updated_at": "2002-08-08T00:00:00.000Z"
  },
  "message": "Profile created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: If the request body is missing required fields or contains invalid data

#### PUT /api/profiles/:id

Update an existing profile.

**Parameters:**
- `id` (path parameter, required): The UUID of the profile to update

**Request Body:**
```json
{
  "name": "Updated Challenger Name",
  "blurb": "Updated challenger blurb...",
  "bio": "Updated challenger biography...",
  "skills": ["skill1", "skill2", "skill3"]
}
```

**Optional Fields:**
All fields are optional for updates. Only include the fields you want to update.

**Response:**
```json
{
  "success": true,
  "data": {
	"id": "uuid",
	"name": "Updated Challenger Name",
	"blurb": "Updated challenger blurb...",
	"bio": "Updated challenger biography...",
	"skills": [
		"updated skill1",
		"updated skill2",
		"updated skill3"
	],
	"pic_url": "https://example.com/profile.jpg",
	"github_url": "https://github.com/challenger",
	"linkedin_url": "https://linkedin.com/in/challenger",
	"gauntlet_url": "https://gauntletai.com/challenger",
	"twitter_url": "https://x.com/challenger",
	"created_at": "2002-08-08T00:00:00.000Z",
	"updated_at": "2002-08-08T00:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: If the request body contains invalid data
- `404 Not Found`: If the profile with the specified ID does not exist

#### DELETE /api/profiles/:id

Delete a profile.

**Parameters:**
- `id` (path parameter, required): The UUID of the profile to delete

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Profile deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: If the profile with the specified ID does not exist

### Projects

#### GET /api/projects

Retrieve a list of all projects.

**Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Project Title",
      "description": "Project description...",
      "video_url": "https://example.com/video.mp4",
      "screenshot_url": "https://example.com/screenshot.jpg",
      "techs": [
        "tech1",
        "tech2",
        "tech3"
      ],
      "keywords": [
        "keyword1",
        "keyword2",
        "keyword3"
      ],
      "github_url": "https://github.com/user/project",
      "deploy_url": "https://project-demo.com",
      "profile_id": "uuid",
      "created_at": "2002-08-08T00:00:00.000Z",
      "updated_at": "2002-08-08T00:00:00.000Z"
    },
    // More projects...
  ],
  "message": "Projects retrieved successfully"
}
```

#### GET /api/projects/:id

Retrieve a specific project by ID.

**Parameters:**
- `id` (path parameter, required): The UUID of the project to retrieve

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Project Title",
    "description": "Project description...",
    "video_url": "https://example.com/video.mp4",
    "screenshot_url": "https://example.com/screenshot.jpg",
    "techs": [
      "tech1",
      "tech2",
      "tech3"
    ],
    "keywords": [
      "keyword1",
      "keyword2",
      "keyword3"
    ],
    "github_url": "https://github.com/user/project",
    "deploy_url": "https://project-demo.com",
    "profile_id": "uuid",
    "created_at": "2002-08-08T00:00:00.000Z",
    "updated_at": "2002-08-08T00:00:00.000Z",
    "profile": {
      "id": "uuid",
      "name": "Challenger Name"
      // Limited profile information
    }
  },
  "message": "Project retrieved successfully"
}
```

**Error Responses:**
- `404 Not Found`: If the project with the specified ID does not exist

#### GET /api/profiles/:profileId/projects

Retrieve all projects for a specific profile.

**Parameters:**
- `profileId` (path parameter, required): The UUID of the profile to retrieve projects for

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Project Title",
      "description": "Project description...",
      "video_url": "https://example.com/video.mp4",
      "screenshot_url": "https://example.com/screenshot.jpg",
      "techs": [
        "tech1",
        "tech2",
        "tech3"
      ],
      "keywords": [
        "keyword1",
        "keyword2",
        "keyword3"
      ],
      "github_url": "https://github.com/user/project",
      "deploy_url": "https://project-demo.com",
      "profile_id": "uuid",
      "created_at": "2002-08-08T00:00:00.000Z",
      "updated_at": "2002-08-08T00:00:00.000Z"
    },
    // More projects...
  ],
  "message": "Profile projects retrieved successfully"
}
```

**Error Responses:**
- `404 Not Found`: If the profile with the specified ID does not exist

#### POST /api/projects

Create a new project.

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Project description...",
  "video_url": "https://example.com/video.mp4",
  "screenshot_url": "https://example.com/screenshot.jpg",
  "techs": ["tech1", "tech2", "tech3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "github_url": "https://github.com/user/project",
  "deploy_url": "https://project-demo.com",
  "profile_id": "uuid"
}
```

**Required Fields:**
- `title` (string): The project title
- `description` (string): A detailed description of the project
- `profile_id` (string): The UUID of the profile this project belongs to

**Optional Fields:**
- `video_url` (string): The URL to a video demonstration
- `screenshot_url` (string): The URL to a screenshot image
- `techs` (array of strings): List of technologies used in the project (max 5)
- `keywords` (array of strings): List of keywords for the project (max 5)
- `github_url` (string): The URL to the project's GitHub repository
- `deploy_url` (string): The URL to the deployed project

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Project Title",
    "description": "Project description...",
    "video_url": "https://example.com/video.mp4",
    "screenshot_url": "https://example.com/screenshot.jpg",
    "techs": [
      "tech1",
      "tech2",
      "tech3"
    ],
    "keywords": [
      "keyword1",
      "keyword2",
      "keyword3"
    ],
    "github_url": "https://github.com/user/project",
    "deploy_url": "https://project-demo.com",
    "profile_id": "uuid",
    "created_at": "2002-08-08T00:00:00.000Z",
    "updated_at": "2002-08-08T00:00:00.000Z"
  },
  "message": "Project created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: If the request body is missing required fields or contains invalid data
- `404 Not Found`: If the profile with the specified ID does not exist

#### PUT /api/projects/:id

Update an existing project.

**Parameters:**
- `id` (path parameter, required): The UUID of the project to update

**Request Body:**
```json
{
  "title": "Updated Project Title",
  "description": "Updated project description...",
  "techs": ["tech1", "tech2", "tech4"],
  "keywords": ["keyword1", "keyword2", "keyword4"]
}
```

**Optional Fields:**
All fields are optional for updates. Only include the fields you want to update.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Project Title",
    "description": "Updated project description...",
    "video_url": "https://example.com/video.mp4",
    "screenshot_url": "https://example.com/screenshot.jpg",
    "techs": [
      "tech1",
      "tech2",
      "tech4"
    ],
    "keywords": [
      "keyword1",
      "keyword2",
      "keyword4"
    ],
    "github_url": "https://github.com/user/project",
    "deploy_url": "https://project-demo.com",
    "profile_id": "uuid",
    "created_at": "2002-08-08T00:00:00.000Z",
    "updated_at": "2002-08-08T00:00:00.000Z"
  },
  "message": "Project updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: If the request body contains invalid data
- `404 Not Found`: If the project with the specified ID does not exist

#### DELETE /api/projects/:id

Delete a project.

**Parameters:**
- `id` (path parameter, required): The UUID of the project to delete

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: If the project with the specified ID does not exist

## Adding New Endpoint Documentation

When adding new endpoints to the API, please follow these guidelines for documentation:

1. Create a new section under the appropriate resource category or create a new category
2. Include the HTTP method and complete endpoint path
3. Document all parameters (path, query, and request body)
4. Provide example request bodies for POST and PUT endpoints
5. Include example responses for success and error cases
6. Document any special conditions or requirements for using the endpoint

Example template for a new endpoint:

```markdown
#### [METHOD] /api/[resource]/[path]

Brief description of what the endpoint does.

**Parameters:**
- `paramName` (path/query/body, required/optional): Description

**Request Body:** (if applicable)
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**Required Fields:** (if applicable)
- `field1` (type): Description
- `field2` (type): Description

**Optional Fields:** (if applicable)
- `field3` (type): Description

**Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

**Error Responses:**
- `statusCode Error Name`: Description
```

This template ensures consistency across all endpoint documentation.
