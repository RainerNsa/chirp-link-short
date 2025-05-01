
export interface UrlEntry {
  longUrl: string;
  shortUrl: string;
  shortCode: string;
  createdAt: string;
  visits: number;
  lastAccessed: string | null;
}

export interface EncodeResponse {
  shortUrl: string;
  shortCode: string;
}

export interface DecodeResponse {
  longUrl: string;
}

export interface StatisticResponse {
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  visits: number;
  lastAccessed: string | null;
}

export interface ListResponse {
  urls: UrlEntry[];
}

export interface ApiError {
  error: string;
  message: string;
}
