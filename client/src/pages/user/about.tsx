import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function About() {
  // Fetch site settings (optional)
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      } catch (error) {
        console.error("Error fetching settings:", error);
        return [];
      }
    },
  });

  // Helper to get setting value by key
  const getSetting = (key: string): string => {
    if (!settings) return '';
    const setting = settings.find((s: any) => s.key === key);
    return setting ? setting.value : '';
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero section */}
      <div className="bg-white py-16 px-4 sm:py-24 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              About MediaHub
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-neutral-500">
              Your one-stop platform for videos, blogs, and digital content to help you learn, grow, and stay informed.
            </p>
          </div>
        </div>
      </div>

      {/* Company mission */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Our Mission</h2>
            <Separator className="my-6" />
            <p className="text-lg text-neutral-600 mb-6">
              At MediaHub, our mission is to create a platform where quality content is accessible to everyone. 
              We believe in the power of knowledge sharing and continuous learning through engaging videos, 
              insightful articles, and interactive media.
            </p>
            <p className="text-lg text-neutral-600">
              We strive to build a community of creators and learners who share their expertise and 
              experiences, fostering an environment of growth and innovation.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Our team working together" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* What we offer */}
      <div className="bg-neutral-100 py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900">What We Offer</h2>
            <p className="mt-4 text-lg text-neutral-600">
              Discover the diverse content and features available on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Engaging Videos</h3>
                <p className="text-neutral-600">
                  High-quality video content covering a wide range of topics from technology and education to entertainment and lifestyle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"></path>
                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Insightful Blogs</h3>
                <p className="text-neutral-600">
                  Thought-provoking articles and blog posts written by experts and enthusiasts sharing their knowledge and experiences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Community Engagement</h3>
                <p className="text-neutral-600">
                  Connect with like-minded individuals, participate in discussions, and be part of a growing community of creators and learners.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Team section (optional) */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral-900">Our Team</h2>
          <p className="mt-4 text-lg text-neutral-600">
            Meet the passionate people behind MediaHub
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Team Member 1 */}
          <div className="text-center">
            <div className="mx-auto h-40 w-40 rounded-full overflow-hidden mb-4">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Sarah Johnson" 
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Sarah Johnson</h3>
            <p className="text-neutral-600">Founder & CEO</p>
          </div>

          {/* Team Member 2 */}
          <div className="text-center">
            <div className="mx-auto h-40 w-40 rounded-full overflow-hidden mb-4">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Tom Wilson" 
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Tom Wilson</h3>
            <p className="text-neutral-600">Content Director</p>
          </div>

          {/* Team Member 3 */}
          <div className="text-center">
            <div className="mx-auto h-40 w-40 rounded-full overflow-hidden mb-4">
              <img 
                src="https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Esther Howard" 
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Esther Howard</h3>
            <p className="text-neutral-600">Head of Technology</p>
          </div>

          {/* Team Member 4 */}
          <div className="text-center">
            <div className="mx-auto h-40 w-40 rounded-full overflow-hidden mb-4">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Michael Turner" 
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Michael Turner</h3>
            <p className="text-neutral-600">Marketing Director</p>
          </div>
        </div>
      </div>

      {/* Contact / CTA section */}
      <div className="bg-primary text-white py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to explore MediaHub?
          </h2>
          <p className="mt-4 text-lg">
            Join our community today and discover a world of engaging content.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth">
              <Button variant="outline" className="bg-white text-primary hover:bg-neutral-100 border-white">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="border-white text-white hover:bg-primary/80">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
