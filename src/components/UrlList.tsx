
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { listUrls } from '@/services/api';
import { UrlEntry } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Search, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const UrlList = () => {
  const [urls, setUrls] = useState<UrlEntry[]>([]);
  const [filteredUrls, setFilteredUrls] = useState<UrlEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUrls = async () => {
      setIsLoading(true);
      try {
        const response = await listUrls();
        setUrls(response.urls);
        setFilteredUrls(response.urls);
      } catch (error) {
        console.error('Error fetching URLs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load URL list. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, [toast]);

  useEffect(() => {
    // Filter URLs when search query changes (after 3 or more characters)
    if (searchQuery.length >= 3) {
      const filtered = urls.filter(url => 
        url.longUrl.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUrls(filtered);
    } else {
      setFilteredUrls(urls);
    }
  }, [searchQuery, urls]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCopyClick = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'URL copied to clipboard',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-md mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Your Shortened URLs</CardTitle>
        <div className="relative w-full max-w-xs">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            type="text"
            placeholder="Search URLs..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
            data-testid="url-search-input"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-4" data-testid="loading-animation" role="status">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredUrls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Original URL</th>
                  <th className="px-4 py-3">Short URL</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Visits</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUrls.map((url) => (
                  <tr key={url.shortCode} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="max-w-[200px] truncate" title={url.longUrl}>
                        {url.longUrl}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={url.shortUrl}
                        className="text-brand-blue hover:text-brand-purple"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {url.shortUrl.split('/').pop()}
                      </a>
                    </td>
                    <td className="px-4 py-3">{formatDate(url.createdAt)}</td>
                    <td className="px-4 py-3">{url.visits}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyClick(url.shortUrl)}
                        title="Copy short URL"
                      >
                        <Copy size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchQuery.length >= 3
              ? 'No URLs match your search'
              : 'No shortened URLs yet'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UrlList;
