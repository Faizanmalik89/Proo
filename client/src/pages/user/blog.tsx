import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, BookOpenIcon, SearchIcon, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'wouter';

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  // Fetch blogs
  const { data: blogs, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs?published=true', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch blogs');
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

  // Filter blogs based on search term and category
  const filteredBlogs = blogs?.filter((blog: any) => {
    const matchesSearch = 
      !searchTerm || 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.content && blog.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      blog.categoryId === parseInt(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Calculate read time
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number): string => {
    if (!categories) return '';
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category ? category.name : '';
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Display selected blog post */}
      {selectedBlog ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button 
            variant="ghost" 
            className="mb-6 text-neutral-600"
            onClick={() => setSelectedBlog(null)}
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to all posts
          </Button>
          
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {selectedBlog.featuredImage && (
              <img 
                src={selectedBlog.featuredImage} 
                alt={selectedBlog.title} 
                className="w-full h-64 object-cover"
              />
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex items-center text-sm text-neutral-500 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {getCategoryName(selectedBlog.categoryId)}
                </span>
                <div className="mx-2">•</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mx-2">•</div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{calculateReadTime(selectedBlog.content)}</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">{selectedBlog.title}</h1>
              
              <div className="prose max-w-none">
                {selectedBlog.content.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          </article>
        </div>
      ) : (
        <>
          {/* Blog listing */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">Our Blog</h2>
                <p className="text-neutral-600 mt-2">Insights, stories, and ideas from our team</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search articles..."
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

            {isLoadingBlogs ? (
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
                {filteredBlogs?.length === 0 ? (
                  <div className="text-center py-20">
                    <BookOpenIcon className="h-12 w-12 mx-auto text-neutral-400" />
                    <h3 className="mt-4 text-lg font-medium text-neutral-900">No articles found</h3>
                    <p className="mt-1 text-neutral-500">
                      {searchTerm 
                        ? `No results for "${searchTerm}". Try a different search term.` 
                        : 'No articles available in this category.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs?.map((blog: any) => (
                      <Card key={blog.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-0">
                          <div 
                            className="h-48 w-full cursor-pointer"
                            onClick={() => setSelectedBlog(blog)}
                          >
                            {blog.featuredImage ? (
                              <img 
                                src={blog.featuredImage} 
                                alt={blog.title} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-neutral-200 flex items-center justify-center">
                                <BookOpenIcon className="h-12 w-12 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center mb-2">
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                {getCategoryName(blog.categoryId) || 'Article'}
                              </span>
                            </div>
                            <h3 
                              className="text-lg font-semibold text-neutral-900 hover:text-primary cursor-pointer"
                              onClick={() => setSelectedBlog(blog)}
                            >
                              {blog.title}
                            </h3>
                            <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
                              {blog.excerpt || blog.content.substring(0, 150) + '...'}
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-xs text-neutral-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                <span className="mx-1">•</span>
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{calculateReadTime(blog.content)}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-primary"
                                onClick={() => setSelectedBlog(blog)}
                              >
                                Read more
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
        </>
      )}
    </div>
  );
}
