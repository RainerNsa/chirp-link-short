
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { encodeUrl } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';

const UrlShortenerForm = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(true);
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setIsUrlValid(true);
      return true;
    }
    
    try {
      new URL(url);
      setIsUrlValid(true);
      return true;
    } catch (error) {
      setIsUrlValid(false);
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLongUrl(url);
    validateUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!longUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(longUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await encodeUrl(longUrl);
      setShortUrl(result.shortUrl);
      toast({
        title: "URL Shortened",
        description: "Your short URL has been generated!",
      });
    } catch (error) {
      console.error('Error shortening URL:', error);
      toast({
        title: "Error",
        description: "Failed to shorten URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyClick = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Shorten Your URL</CardTitle>
        <CardDescription>Enter a long URL to create a short, shareable link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="https://example.com/very-long-url-path"
                value={longUrl}
                onChange={handleInputChange}
                className={`pr-4 ${!isUrlValid ? 'border-red-500' : ''}`}
                disabled={isLoading}
                data-testid="long-url-input"
              />
              {!isUrlValid && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid URL (including http:// or https://)</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-opacity" 
              disabled={isLoading || !isUrlValid}
              data-testid="shorten-button"
            >
              {isLoading ? 'Shortening...' : 'Shorten URL'}
            </Button>
          </div>
        </form>

        {shortUrl && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200 animate-fade-in">
            <div className="flex justify-between items-center">
              <div className="flex-1 mr-2">
                <label className="text-sm font-medium text-gray-500 block mb-1">Your shortened URL:</label>
                <a 
                  href={shortUrl} 
                  className="text-brand-blue hover:text-brand-purple text-sm sm:text-base font-medium break-all" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="short-url-result"
                >
                  {shortUrl}
                </a>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleCopyClick} 
                className="flex-shrink-0"
                data-testid="copy-button"
              >
                <Copy size={16} className="mr-1" /> Copy
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UrlShortenerForm;
