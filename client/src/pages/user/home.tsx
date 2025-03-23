import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VideoPlayer } from '@/components/ui/video-player';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoIcon, BookOpenIcon, ArrowRightIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');

  // Fetch featured videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos?published=true', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
  });

  // Fetch blog posts
  const { data: blogs, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs?published=true', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    },
  });

  // Fetch active ads
  const { data: ads, isLoading: isLoadingAds } = useQuery({
    queryKey: ['/api/ads'],
    queryFn: async () => {
      const res = await fetch('/api/ads?active=true', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch ads');
      return res.json();
    },
  });

  // Get featured videos (limit to 3)
  const featuredVideos = videos?.slice(0, 3) || [];
  
  // Get latest blog posts (limit to 3)
  const latestBlogs = blogs?.slice(0, 3) || [];
  
  // Get a random ad for the banner
  const [randomAd, setRandomAd] = useState<any>(null);

  useEffect(() => {
    if (ads && ads.length > 0) {
      const randomIndex = Math.floor(Math.random() * ads.length);
      setRandomAd(ads[randomIndex]);
    }
  }, [ads]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Discover Amazing Content</h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Watch videos, read blogs, and stay up to date with the latest trends in technology, lifestyle, and entertainment.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link href="/videos">
              <Button size="lg" className="text-white">
                Browse Videos
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="lg" variant="outline" className="text-primary bg-white hover:bg-gray-50">
                Read Blog Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Videos Section */}
      <div className="bg-white py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">Featured Videos</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-neutral-500 sm:mt-4">
              Check out our most popular and trending videos
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingVideos ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="mt-6 flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32 mt-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredVideos.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <VideoIcon className="h-12 w-12 mx-auto text-neutral-400" />
                <p className="mt-2 text-neutral-600">No videos found.</p>
              </div>
            ) : (
              featuredVideos.map((video: any) => (
                <Card key={video.id} className="flex flex-col overflow-hidden">
                  <div className="flex-shrink-0">
                    <div className="video-thumbnail h-48 w-full relative">
                      {video.thumbnailUrl ? (
                        <img 
                          className="h-48 w-full object-cover" 
                          src={video.thumbnailUrl} 
                          alt={video.title} 
                        />
                      ) : (
                        <div className="h-48 w-full bg-neutral-200 flex items-center justify-center">
                          <VideoIcon className="h-12 w-12 text-neutral-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <VideoIcon className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">
                        {/* Use category if available */}
                        {video.categoryId ? 'Video' : 'Video'}
                      </p>
                      <Link href={`/videos/${video.id}`}>
                        <a className="block mt-2">
                          <p className="text-xl font-semibold text-neutral-900">{video.title}</p>
                          <p className="mt-3 text-base text-neutral-500">
                            {video.description || 'Watch this video for more information.'}
                          </p>
                        </a>
                      </Link>
                    </div>
                    <div className="mt-6 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-neutral-600">
                            {video.authorId?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-900">
                          {video.authorId || 'MediaHub Team'}
                        </p>
                        <div className="flex space-x-1 text-sm text-neutral-500">
                          <time dateTime={video.createdAt}>
                            {new Date(video.createdAt).toLocaleDateString()}
                          </time>
                          <span aria-hidden="true">&middot;</span>
                          <span>{video.duration ? `${Math.floor(video.duration / 60)}m ${video.duration % 60}s` : '10 min'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/videos">
              <Button>
                View All Videos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Blog Posts */}
      <div className="bg-neutral-50 py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">Latest from Our Blog</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-neutral-500 sm:mt-4">
              Stay updated with our latest articles and insights
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingBlogs ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="mt-6 flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32 mt-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : latestBlogs.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <BookOpenIcon className="h-12 w-12 mx-auto text-neutral-400" />
                <p className="mt-2 text-neutral-600">No blog posts found.</p>
              </div>
            ) : (
              latestBlogs.map((blog: any) => (
                <Card key={blog.id} className="flex flex-col overflow-hidden bg-white">
                  <div className="flex-shrink-0">
                    {blog.featuredImage ? (
                      <img 
                        className="h-48 w-full object-cover" 
                        src={blog.featuredImage} 
                        alt={blog.title} 
                      />
                    ) : (
                      <div className="h-48 w-full bg-neutral-200 flex items-center justify-center">
                        <BookOpenIcon className="h-12 w-12 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">
                        {/* Use category if available */}
                        {blog.categoryId ? 'Blog' : 'Blog'}
                      </p>
                      <Link href={`/blog/${blog.id}`}>
                        <a className="block mt-2">
                          <p className="text-xl font-semibold text-neutral-900">{blog.title}</p>
                          <p className="mt-3 text-base text-neutral-500">
                            {blog.excerpt || blog.content.substring(0, 120) + '...'}
                          </p>
                        </a>
                      </Link>
                    </div>
                    <div className="mt-6 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-neutral-600">
                            {blog.authorId?.charAt(0) || 'A'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-900">
                          {blog.authorId || 'MediaHub Team'}
                        </p>
                        <div className="flex space-x-1 text-sm text-neutral-500">
                          <time dateTime={blog.createdAt}>
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </time>
                          <span aria-hidden="true">&middot;</span>
                          <span>{blog.content ? `${Math.ceil(blog.content.length / 1000)} min read` : '5 min read'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/blog">
              <Button variant="outline" className="text-primary">
                Read All Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      {randomAd && (
        <div className="bg-primary py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left md:max-w-2xl">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                <span className="block">{randomAd.name}</span>
              </h2>
              <p className="mt-3 text-lg leading-6 text-indigo-100">
                {randomAd.description || "Sign up for our premium subscription and get access to exclusive content, tutorials, and resources."}
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                <div className="inline-flex rounded-md shadow">
                  <a 
                    href={randomAd.targetUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-indigo-50"
                  >
                    Get Started
                  </a>
                </div>
                <div className="ml-3 inline-flex">
                  <a 
                    href={randomAd.targetUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
            {randomAd.imageUrl && (
              <div className="mt-8 md:mt-0">
                <img 
                  className="h-56 w-auto object-contain" 
                  src={randomAd.imageUrl} 
                  alt={randomAd.name} 
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Newsletter Subscription */}
      <div className="bg-white py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">Stay updated with our newsletter</h2>
          <p className="mt-4 text-lg text-neutral-500">
            Get the latest content, tips, and updates delivered straight to your inbox.
          </p>
          <div className="mt-8 sm:w-full sm:max-w-md mx-auto">
            <form className="sm:flex" onSubmit={handleSubscribe}>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <Input 
                id="email-address" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Button type="submit" className="w-full">
                  Subscribe
                </Button>
              </div>
            </form>
            <p className="mt-3 text-sm text-neutral-500">
              We care about your data. Read our <Link href="/terms"><a className="font-medium text-primary hover:text-primary/80">Privacy Policy</a></Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
