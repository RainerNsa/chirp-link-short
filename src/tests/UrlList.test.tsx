import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UrlList from '../components/UrlList';
import * as api from '../services/api';

// Create a wrapper to provide context for the component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('UrlList', () => {
  it('renders loading state initially', () => {
    // Mock the API call to delay response
    vi.spyOn(api, 'listUrls').mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<UrlList />, { wrapper: createWrapper() });
    
    // Check if loading animation is displayed by looking for the animation class
    const loadingElement = screen.getByTestId('loading-animation') || screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
  });

  it('displays URLs after loading', async () => {
    // Mock the API call
    const mockUrls = {
      urls: [
        {
          longUrl: 'https://example.com',
          shortUrl: 'http://localhost/abc123',
          shortCode: 'abc123',
          createdAt: new Date().toISOString(),
          visits: 5,
          lastAccessed: new Date().toISOString(),
        },
        {
          longUrl: 'https://github.com',
          shortUrl: 'http://localhost/def456',
          shortCode: 'def456',
          createdAt: new Date().toISOString(),
          visits: 10,
          lastAccessed: new Date().toISOString(),
        },
      ],
    };
    
    vi.spyOn(api, 'listUrls').mockResolvedValue(mockUrls);
    
    render(<UrlList />, { wrapper: createWrapper() });
    
    // Check if URLs are displayed after loading
    await waitFor(() => {
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('https://github.com')).toBeInTheDocument();
    });
  });

  it('filters URLs after 3 characters', async () => {
    // Mock the API call
    const mockUrls = {
      urls: [
        {
          longUrl: 'https://example.com',
          shortUrl: 'http://localhost/abc123',
          shortCode: 'abc123',
          createdAt: new Date().toISOString(),
          visits: 5,
          lastAccessed: new Date().toISOString(),
        },
        {
          longUrl: 'https://github.com',
          shortUrl: 'http://localhost/def456',
          shortCode: 'def456',
          createdAt: new Date().toISOString(),
          visits: 10,
          lastAccessed: new Date().toISOString(),
        },
      ],
    };
    
    vi.spyOn(api, 'listUrls').mockResolvedValue(mockUrls);
    
    render(<UrlList />, { wrapper: createWrapper() });
    
    // Wait for URLs to load
    await waitFor(() => {
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('https://github.com')).toBeInTheDocument();
    });
    
    // Enter search query
    const searchInput = screen.getByTestId('url-search-input');
    fireEvent.change(searchInput, { target: { value: 'git' } });
    
    // Check if filtering works
    await waitFor(() => {
      expect(screen.queryByText('https://example.com')).not.toBeInTheDocument();
      expect(screen.getByText('https://github.com')).toBeInTheDocument();
    });
  });
});
