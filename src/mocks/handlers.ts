
import { http, HttpResponse } from 'msw'
import { EncodeResponse, DecodeResponse, StatisticResponse, ListResponse, UrlEntry } from '@/types';

// In-memory storage for URL shortener
const urlStore = new Map<string, {
  longUrl: string;
  createdAt: Date;
  visits: number;
  lastAccessed: Date | null;
}>();

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

// Generate a unique short code
const generateUniqueShortCode = (): string => {
  let shortCode = generateShortCode();
  
  // Ensure uniqueness
  while (urlStore.has(shortCode)) {
    shortCode = generateShortCode();
  }
  
  return shortCode;
};

// Base URL for short URLs
const BASE_URL = window.location.origin;

// Add some sample data
const addSampleData = () => {
  const samples = [
    { longUrl: 'https://example.com', shortCode: 'AbC123', visits: 5, daysAgo: 2 },
    { longUrl: 'https://google.com', shortCode: 'GoOgLe', visits: 10, daysAgo: 1 },
    { longUrl: 'https://github.com', shortCode: 'GiThuB', visits: 3, daysAgo: 3 },
    { longUrl: 'https://reactjs.org', shortCode: 'ReAcTs', visits: 7, daysAgo: 5 },
  ];

  samples.forEach(sample => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - sample.daysAgo);
    
    urlStore.set(sample.shortCode, {
      longUrl: sample.longUrl,
      createdAt,
      visits: sample.visits,
      lastAccessed: sample.visits > 0 ? new Date() : null,
    });
  });
};

// Add sample data on initialization
addSampleData();

export const handlers = [
  // POST /api/encode - Create a short URL
  http.post('http://localhost/api/encode', async ({ request }) => {
    const { longUrl } = await request.json();
    
    if (!longUrl || typeof longUrl !== 'string') {
      return new HttpResponse(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'longUrl is required and must be a string' 
        }),
        { status: 400 }
      );
    }
    
    try {
      new URL(longUrl);
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Invalid URL format' 
        }),
        { status: 400 }
      );
    }

    const shortCode = generateUniqueShortCode();
    const shortUrl = `${BASE_URL}/${shortCode}`;
    
    urlStore.set(shortCode, {
      longUrl,
      createdAt: new Date(),
      visits: 0,
      lastAccessed: null,
    });
    
    return HttpResponse.json(
      { shortUrl, shortCode } as EncodeResponse,
      { status: 201 }
    );
  }),
  
  // GET /api/decode - Decode a short URL
  http.get('http://localhost/api/decode', ({ request }) => {
    const url = new URL(request.url);
    const shortUrl = url.searchParams.get('shortUrl');
    
    if (!shortUrl) {
      return HttpResponse.json(
        { error: 'Bad Request', message: 'shortUrl query parameter is required' },
        { status: 400 }
      );
    }
    
    // Extract shortCode from shortUrl
    const urlObj = new URL(shortUrl);
    const shortCode = urlObj.pathname.slice(1); // Remove leading slash
    
    if (!urlStore.has(shortCode)) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Short URL not found' },
        { status: 404 }
      );
    }
    
    const { longUrl } = urlStore.get(shortCode)!;
    
    return HttpResponse.json({ longUrl } as DecodeResponse);
  }),
  
  // GET /api/statistic/:shortCode - Get statistics for a short URL
  http.get('http://localhost/api/statistic/:shortCode', ({ params }) => {
    const { shortCode } = params;
    
    if (!urlStore.has(shortCode as string)) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Short URL not found' },
        { status: 404 }
      );
    }
    
    const { longUrl, createdAt, visits, lastAccessed } = urlStore.get(shortCode as string)!;
    
    return HttpResponse.json({
      longUrl,
      shortUrl: `${BASE_URL}/${shortCode}`,
      shortCode,
      createdAt: createdAt.toISOString(),
      visits,
      lastAccessed: lastAccessed ? lastAccessed.toISOString() : null,
    } as StatisticResponse);
  }),
  
  // GET /api/list - List all URLs
  http.get('http://localhost/api/list', () => {
    const urls: UrlEntry[] = [];
    
    urlStore.forEach((value, shortCode) => {
      urls.push({
        longUrl: value.longUrl,
        shortUrl: `${BASE_URL}/${shortCode}`,
        shortCode,
        createdAt: value.createdAt.toISOString(),
        visits: value.visits,
        lastAccessed: value.lastAccessed ? value.lastAccessed.toISOString() : null,
      });
    });
    
    return HttpResponse.json({ urls } as ListResponse);
  }),
  
  // GET /:shortCode - Redirect to the original URL
  http.get('/:shortCode', ({ params }) => {
    const { shortCode } = params;
    
    if (!urlStore.has(shortCode as string)) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Short URL not found' },
        { status: 404 }
      );
    }
    
    const urlData = urlStore.get(shortCode as string)!;
    
    // Update statistics
    urlStore.set(shortCode as string, {
      ...urlData,
      visits: urlData.visits + 1,
      lastAccessed: new Date(),
    });
    
    // In a real API, this would redirect to the long URL
    // For MSW, we'll return the long URL with a special status
    return HttpResponse.json({ redirectTo: urlData.longUrl });
  }),
];
