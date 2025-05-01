# URL Shortener

A modern URL shortening application built with React and MSW (Mock Service Worker) for API simulation.

## Features

- Shorten long URLs to easy-to-remember links
- View statistics on each shortened URL
- View a list of all shortened URLs
- Search through your URLs
- Track visits to shortened URLs

## Quick Start

### Prerequisites

- Node.js v16 or higher
- npm or yarn

### Installation

1. Clone this repository:
```sh
git clone <YOUR_GIT_URL>
cd url-shortener
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. The application will be available at `http://localhost:5173` or the port specified by Vite.

## API Usage

### Endpoints

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/api/encode` | Create a short URL | `{ "longUrl": "https://example.com" }` | `{ "shortUrl": "http://domain/abCD12", "shortCode": "abCD12" }` |
| GET | `/api/decode?shortUrl=http://domain/abCD12` | Get original URL | - | `{ "longUrl": "https://example.com" }` |
| GET | `/api/statistic/abCD12` | Get URL statistics | - | `{ "longUrl": "...", "shortUrl": "...", "createdAt": "...", "visits": 5, "lastAccessed": "..." }` |
| GET | `/api/list` | Get all URLs | - | `{ "urls": [...] }` |
| GET | `/abCD12` | Redirect to original URL | - | Redirect to original URL |

### Example Usage

```typescript
// Creating a short URL
const response = await fetch('/api/encode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ longUrl: 'https://example.com' }),
});
const data = await response.json();
console.log('Short URL:', data.shortUrl);

// Getting the original URL
const shortUrl = 'http://domain/abCD12';
const response = await fetch(`/api/decode?shortUrl=${encodeURIComponent(shortUrl)}`);
const data = await response.json();
console.log('Original URL:', data.longUrl);
```

## Architecture

This application is built with:

- **React**: Frontend UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: UI component library
- **MSW (Mock Service Worker)**: API mocking
- **React Router**: Client-side routing
- **React Query**: Data fetching and state management
- **Axios**: HTTP client

## Testing

This project includes comprehensive testing for both frontend and backend functionality.

### Running Tests

```sh
npm test
```

### Test Structure

- `src/tests/UrlShortenerForm.test.tsx`: Tests for URL shortening form
- `src/tests/UrlList.test.tsx`: Tests for URL listing and search functionality
- `src/tests/handlers.test.ts`: Tests for API endpoints

## Implementation Details

### Short Code Generation

Short codes are generated using a base62 encoding (alphanumeric) with a length of 6 characters, providing a large address space for URLs.

```typescript
// Base62 characters for encoding
const BASE62_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Generate a random base62 string of length 6
const generateShortCode = (): string => {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += BASE62_CHARS.charAt(Math.floor(Math.random() * BASE62_CHARS.length));
  }
  return result;
};
```

### Data Storage

In this implementation, URL data is stored in-memory using a JavaScript Map:

```typescript
const urlStore = new Map<string, {
  longUrl: string;
  createdAt: Date;
  visits: number;
  lastAccessed: Date | null;
}>();
```

In a production environment, this would be replaced with a persistent database.

## License

MIT
