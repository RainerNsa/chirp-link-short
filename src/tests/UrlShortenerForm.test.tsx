import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UrlShortenerForm from '../components/UrlShortenerForm';
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

describe('UrlShortenerForm', () => {
  it('renders the form correctly', () => {
    render(<UrlShortenerForm />, { wrapper: createWrapper() });
    
    expect(screen.getByPlaceholderText(/https:\/\/example.com\/very-long-url-path/i)).toBeInTheDocument();
    expect(screen.getByTestId('shorten-button')).toBeInTheDocument();
  });

  it('validates URL input', async () => {
    render(<UrlShortenerForm />, { wrapper: createWrapper() });
    
    const input = screen.getByTestId('long-url-input');
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('shorten-button'));
    
    // Check if validation error appears
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  it('shortens URL successfully', async () => {
    // Mock the API call
    const mockResponse = { shortUrl: 'http://localhost/abc123', shortCode: 'abc123' };
    vi.spyOn(api, 'encodeUrl').mockResolvedValue(mockResponse);
    
    render(<UrlShortenerForm />, { wrapper: createWrapper() });
    
    const input = screen.getByTestId('long-url-input');
    fireEvent.change(input, { target: { value: 'https://example.com/long-url' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('shorten-button'));
    
    // Check if short URL is displayed
    await waitFor(() => {
      expect(screen.getByTestId('short-url-result')).toBeInTheDocument();
      expect(screen.getByTestId('short-url-result')).toHaveTextContent('http://localhost/abc123');
    });
  });

  it('allows copying the shortened URL', async () => {
    // Mock the API call
    const mockResponse = { shortUrl: 'http://localhost/abc123', shortCode: 'abc123' };
    vi.spyOn(api, 'encodeUrl').mockResolvedValue(mockResponse);
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    
    render(<UrlShortenerForm />, { wrapper: createWrapper() });
    
    const input = screen.getByTestId('long-url-input');
    fireEvent.change(input, { target: { value: 'https://example.com/long-url' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('shorten-button'));
    
    // Wait for the shortened URL to appear and click the copy button
    await waitFor(() => {
      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost/abc123');
    });
  });
});