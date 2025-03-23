import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  UserIcon, 
  BookOpenIcon, 
  VideoIcon, 
  BellRingIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  // Fetch recent blogs for recent content
  const { data: recentBlogs, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    },
  });

  // Fetch recent videos for recent content
  const { data: recentVideos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
  });

  // Fetch users for new users section
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  // Get the most recent content (combining blogs and videos)
  const getRecentContent = () => {
    if (!recentBlogs || !recentVideos) return [];
    
    const blogItems = recentBlogs.slice(0, 3).map(blog => ({
      ...blog,
      type: 'blog',
      timestamp: new Date(blog.createdAt)
    }));
    
    const videoItems = recentVideos.slice(0, 3).map(video => ({
      ...video,
      type: 'video',
      timestamp: new Date(video.createdAt)
    }));
    
    return [...blogItems, ...videoItems]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4);
  };

  const recentContent = getRecentContent();
  
  // Get the most recent users
  const newUsers = users?.slice(0, 4) || [];
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
        <p className="text-neutral-600">Welcome back! Here's an overview of your site.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Users */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm font-medium">Total Users</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-neutral-800 mt-1">{stats?.users || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-3 text-xs font-medium flex items-center text-green-500">
              <TrendingUpIcon className="w-3 h-3 mr-1" />
              <span>Up 12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm font-medium">Blog Posts</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-neutral-800 mt-1">{stats?.blogs || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 text-xs font-medium flex items-center text-green-500">
              <TrendingUpIcon className="w-3 h-3 mr-1" />
              <span>Up 8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm font-medium">Videos</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-neutral-800 mt-1">{stats?.videos || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <VideoIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-xs font-medium flex items-center text-green-500">
              <TrendingUpIcon className="w-3 h-3 mr-1" />
              <span>Up 3.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Ads */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm font-medium">Active Ads</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-neutral-800 mt-1">{stats?.activeAds || 0}</p>
                )}
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <BellRingIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-3 text-xs font-medium flex items-center text-yellow-500">
              <TrendingDownIcon className="w-3 h-3 mr-1" />
              <span>Down 2.3% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <Card>
          <div className="px-5 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-medium">Recent Content</h2>
          </div>
          <CardContent className="p-0">
            {(isLoadingBlogs || isLoadingVideos) ? (
              <div className="p-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start py-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="ml-4 flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5">
                <ul className="divide-y divide-neutral-200">
                  {recentContent.map((content: any) => (
                    <li key={`${content.type}-${content.id}`} className="py-3 flex items-start">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-md ${
                        content.type === 'blog' ? 'bg-primary/10' : 'bg-green-100'
                      } flex items-center justify-center`}>
                        {content.type === 'blog' ? (
                          <BookOpenIcon className="h-6 w-6 text-primary" />
                        ) : (
                          <VideoIcon className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-800">{content.title}</p>
                          <span className="text-xs text-neutral-500">
                            {new Date(content.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">
                          {content.type === 'blog' ? 'Blog post' : 'Video'} by {content.authorId}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-3 w-full">
                  View All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Users */}
        <Card>
          <div className="px-5 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-medium">New Users</h2>
          </div>
          <CardContent className="p-0">
            {isLoadingUsers ? (
              <div className="p-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5">
                <ul className="divide-y divide-neutral-200">
                  {newUsers.map((user: any) => (
                    <li key={user.id} className="py-3 flex items-center">
                      <Avatar>
                        <AvatarImage 
                          src={`https://ui-avatars.com/api/?name=${user.firstName || user.username}`} 
                          alt={user.username} 
                        />
                        <AvatarFallback>{user.firstName?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-800">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-neutral-500">{user.email}</p>
                      </div>
                      <span className="ml-auto text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">
                        New
                      </span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-3 w-full">
                  View All Users
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
