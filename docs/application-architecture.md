# URL Shortener Application Architecture

This document provides a comprehensive overview of the URL Shortener application architecture, with a particular focus on how Express.js is used to create the backend API.

## Application Overview

The URL Shortener is a full-stack web application that allows users to:
- Create shortened URLs from long URLs
- Retrieve the original URL when accessing a shortened link
- View statistics about URL usage
- Manage a list of all shortened URLs

The application consists of two main parts:
1. A React frontend for user interaction
2. An Express.js backend API for URL processing and data management

## System Architecture

### High-Level Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │<────>│  Express API    │<────>│  Data Storage   │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Frontend Architecture

The frontend is built with:
- React for UI components
- TypeScript for type safety
- React Query for data fetching and state management
- React Router for client-side routing
- Tailwind CSS and shadcn/ui for styling

### Backend Architecture

The backend is built with:
- Express.js for API routing and middleware
- In-memory data storage (in production, this would be replaced with a database)

## Express.js Backend Implementation

### Server Setup

The Express server is initialized with standard configuration:

```javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`URL Shortener API running on port ${port}`);
});
```

### Data Storage

For simplicity, the application uses an in-memory data store:

```javascript
// In-memory storage for URL data
const urlStore = new Map();

// Function to generate a unique short code
function generateUniqueShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode;
  
  do {
    shortCode = '';
    for (let i = 0; i < 6; i++) {
      shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (urlStore.has(shortCode));
  
  return shortCode;
}
```

In a production environment, this would be replaced with a database like MongoDB, PostgreSQL, or Redis.

### API Endpoints

The Express application defines several RESTful endpoints:

#### 1. Create Short URL (POST /api/encode)

```javascript
app.post('/api/encode', (req, res) => {
  const { longUrl } = req.body;
  
  // Validate input
  if (!longUrl || typeof longUrl !== 'string') {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'longUrl is required and must be a string' 
    });
  }
  
  // Validate URL format
  try {
    new URL(longUrl);
  } catch (error) {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'Invalid URL format' 
    });
  }
  
  // Generate a unique short code
  const shortCode = generateUniqueShortCode();
  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  
  // Store the URL data
  urlStore.set(shortCode, {
    longUrl,
    createdAt: new Date(),
    visits: 0,
    lastAccessed: null,
  });
  
  // Return the short URL
  return res.status(201).json({
    shortUrl,
    shortCode,
  });
});
```

This endpoint:
1. Validates the input URL
2. Generates a unique short code
3. Stores the URL data
4. Returns the shortened URL

#### 2. Retrieve Original URL (GET /api/decode)

```javascript
app.get('/api/decode', (req, res) => {
  const { shortUrl } = req.query;
  
  if (!shortUrl || typeof shortUrl !== 'string') {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'shortUrl query parameter is required' 
    });
  }
  
  // Extract the short code from the URL
  let shortCode;
  try {
    const url = new URL(shortUrl);
    shortCode = url.pathname.substring(1); // Remove leading slash
  } catch (error) {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'Invalid URL format' 
    });
  }
  
  // Look up the short code
  if (!urlStore.has(shortCode)) {
    return res.status(404).json({ 
      error: 'Not Found', 
      message: 'Short URL not found' 
    });
  }
  
  const urlData = urlStore.get(shortCode);
  
  // Return the original URL
  return res.status(200).json({
    longUrl: urlData.longUrl,
  });
});
```

This endpoint:
1. Extracts the short code from the provided URL
2. Looks up the original URL
3. Returns the original URL if found

#### 3. Get URL Statistics (GET /api/statistic/:shortCode)

```javascript
app.get('/api/statistic/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  if (!urlStore.has(shortCode)) {
    return res.status(404).json({ 
      error: 'Not Found', 
      message: 'Short URL not found' 
    });
  }
  
  const urlData = urlStore.get(shortCode);
  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  
  // Return statistics
  return res.status(200).json({
    longUrl: urlData.longUrl,
    shortUrl,
    shortCode,
    createdAt: urlData.createdAt,
    visits: urlData.visits,
    lastAccessed: urlData.lastAccessed,
  });
});
```

This endpoint:
1. Looks up the URL data for the given short code
2. Returns statistics including creation date, visit count, and last access time

#### 4. List All URLs (GET /api/list)

```javascript
app.get('/api/list', (req, res) => {
  const urls = [];
  
  // Convert Map entries to an array of URL objects
  for (const [shortCode, urlData] of urlStore.entries()) {
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    urls.push({
      longUrl: urlData.longUrl,
      shortUrl,
      shortCode,
      createdAt: urlData.createdAt,
      visits: urlData.visits,
      lastAccessed: urlData.lastAccessed,
    });
  }
  
  // Return the list of URLs
  return res.status(200).json({
    urls,
  });
});
```

This endpoint:
1. Collects all URL data from the store
2. Formats it into an array
3. Returns the complete list

#### 5. URL Redirection (GET /:shortCode)

```javascript
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  if (!urlStore.has(shortCode)) {
    return res.status(404).send('Short URL not found');
  }
  
  const urlData = urlStore.get(shortCode);
  
  // Update statistics
  urlStore.set(shortCode, {
    ...urlData,
    visits: urlData.visits + 1,
    lastAccessed: new Date(),
  });
  
  // Redirect to the original URL
  return res.redirect(urlData.longUrl);
});
```

This endpoint:
1. Looks up the original URL for the given short code
2. Updates the visit count and last access time
3. Redirects the user to the original URL

### Express Middleware Usage

The application uses several Express middleware functions:

#### 1. Body Parsing Middleware

```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

These middleware functions parse incoming request bodies:
- `express.json()` parses JSON request bodies
- `express.urlencoded()` parses URL-encoded request bodies

#### 2. Static File Serving

```javascript
app.use(express.static('public'));
```

This middleware serves static files from the 'public' directory.

#### 3. Error Handling Middleware

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server',
  });
});
```

This middleware catches any errors that occur during request processing and returns a standardized error response.

#### 4. 404 Handler

```javascript
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});
```

This middleware handles any requests that don't match defined routes.

## Frontend-Backend Integration

The frontend communicates with the Express backend using the Axios HTTP client:

```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const encodeUrl = async (longUrl: string) => {
  const response = await api.post('/encode', { longUrl });
  return response.data;
};

export const decodeUrl = async (shortUrl: string) => {
  const response = await api.get(`/decode?shortUrl=${encodeURIComponent(shortUrl)}`);
  return response.data;
};

// Additional API functions...
```

## Development Environment

During development, the application uses Mock Service Worker (MSW) to simulate the Express API:

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

// In-memory storage for URL data
const urlStore = new Map();
const BASE_URL = 'http://localhost';

export const handlers = [
  rest.post('/api/encode', (req, res, ctx) => {
    const { longUrl } = req.body;
    // Implementation similar to Express endpoint
    // ...
  }),
  
  // Additional handlers...
];
```

This allows frontend development to proceed without requiring the actual Express backend to be running.

## Deployment Considerations

In a production environment:

1. **Database Integration**: Replace the in-memory store with a proper database
2. **Environment Configuration**: Use environment variables for configuration
3. **CORS Handling**: Add CORS middleware for cross-origin requests
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Logging**: Implement comprehensive logging
6. **Monitoring**: Add health checks and monitoring
7. **HTTPS**: Ensure all traffic is encrypted

## Conclusion

The URL Shortener application demonstrates a clean separation of concerns between the frontend and backend. The Express.js backend provides a RESTful API that handles URL shortening, retrieval, and statistics tracking, while the React frontend provides a user-friendly interface for interacting with these features.

The use of Express.js allows for:
- Simple and intuitive route definitions
- Flexible middleware for request processing
- Easy error handling
- Scalable API architecture

This architecture could be extended to include user authentication, more advanced analytics, and integration with external services while maintaining the same core structure.