import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlayer } from '@/components/ui/video-player';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, VideoIcon, SearchIcon } from 'lucide-react';
import { Link } from 'wouter';

export default function Videos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos?published=true', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filter videos based on search term and category
  const filteredVideos = videos?.filter((video: any) => {
    const matchesSearch = 
      !searchTerm || 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      video.categoryId === parseInt(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Get featured video (first video if available)
  const featuredVideo = videos && videos.length > 0 ? videos[0] : null;

  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero section with featured video */}
      {featuredVideo && !selectedVideo && (
        <div className="bg-neutral-800 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6">Featured Video</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="rounded-lg overflow-hidden">
                  <VideoPlayer 
                    src={featuredVideo.videoUrl} 
                    poster={featuredVideo.thumbnailUrl}
                    className="w-full" 
                    height={400}
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold">{featuredVideo.title}</h2>
                <p className="text-neutral-300 mt-3">{featuredVideo.description}</p>
                <div className="mt-4 flex items-center text-sm text-neutral-400">
                  <span>{new Date(featuredVideo.createdAt).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDuration(featuredVideo.duration)}</span>
                </div>
                <div className="mt-6">
                  <Button onClick={() => setSelectedVideo(featuredVideo)}>
                    Watch Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video player for selected video */}
      {selectedVideo && (
        <div className="bg-neutral-800 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button 
              variant="ghost" 
              className="text-neutral-300 mb-4"
              onClick={() => setSelectedVideo(null)}
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Back to videos
            </Button>
            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-lg overflow-hidden">
                <VideoPlayer 
                  src={selectedVideo.videoUrl} 
                  poster={selectedVideo.thumbnailUrl}
                  className="w-full" 
                  height={500}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{selectedVideo.title}</h1>
                <div className="mt-2 flex items-center text-sm text-neutral-400">
                  <span>{new Date(selectedVideo.createdAt).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDuration(selectedVideo.duration)}</span>
                </div>
                <p className="text-neutral-300 mt-4">{selectedVideo.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Browse Videos</h2>
            <p className="text-neutral-600 mt-2">Explore our collection of videos</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoadingVideos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredVideos?.length === 0 ? (
              <div className="text-center py-20">
                <VideoIcon className="h-12 w-12 mx-auto text-neutral-400" />
                <h3 className="mt-4 text-lg font-medium text-neutral-900">No videos found</h3>
                <p className="mt-1 text-neutral-500">
                  {searchTerm 
                    ? `No results for "${searchTerm}". Try a different search term.` 
                    : 'No videos available in this category.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos?.map((video: any) => (
                  <Card key={video.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div 
                        className="h-48 w-full cursor-pointer relative"
                        onClick={() => setSelectedVideo(video)}
                      >
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-neutral-200 flex items-center justify-center">
                            <VideoIcon className="h-12 w-12 text-neutral-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <svg className="h-16 w-16 text-white opacity-80" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 
                          className="text-lg font-semibold text-neutral-900 hover:text-primary cursor-pointer"
                          onClick={() => setSelectedVideo(video)}
                        >
                          {video.title}
                        </h3>
                        <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                          {video.description || "No description available."}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-neutral-500">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedVideo(video)}
                          >
                            Watch Video
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
