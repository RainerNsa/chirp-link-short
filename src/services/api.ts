import axios from 'axios';
import { EncodeResponse, DecodeResponse, StatisticResponse, ListResponse } from '@/types';

// Set base URL for the API
const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for fallback when API fails
const createMockShortUrl = (longUrl: string) => {
  const shortCode = Math.random().toString(36).substring(2, 8);
  return {
    shortUrl: `${window.location.origin}/${shortCode}`,
    shortCode,
  };
};

export const encodeUrl = async (longUrl: string): Promise<EncodeResponse> => {
  try {
    const response = await api.post<EncodeResponse>('/encode', { longUrl });
    return response.data;
  } catch (error) {
    console.error('Error encoding URL:', error);
    
    // If in development, provide a fallback mock response
    if (import.meta.env.DEV) {
      console.warn('Using fallback mock response for URL shortening');
      return createMockShortUrl(longUrl);
    }
    
    throw error;
  }
};

export const decodeUrl = async (shortUrl: string): Promise<DecodeResponse> => {
  try {
    const response = await api.get<DecodeResponse>(`/decode?shortUrl=${encodeURIComponent(shortUrl)}`);
    return response.data;
  } catch (error) {
    console.error('Error decoding URL:', error);
    throw error;
  }
};

export const getStatistics = async (shortCode: string): Promise<StatisticResponse> => {
  try {
    const response = await api.get<StatisticResponse>(`/statistic/${shortCode}`);
    return response.data;
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
};

export const listUrls = async (): Promise<ListResponse> => {
  try {
    const response = await api.get<ListResponse>('/list');
    return response.data;
  } catch (error) {
    console.error('Error listing URLs:', error);
    throw error;
  }
};

export default api;
