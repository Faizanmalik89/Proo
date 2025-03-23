import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function Terms() {
  const [activeTermType, setActiveTermType] = useState<string | null>(null);

  // Fetch terms
  const { data: terms, isLoading } = useQuery({
    queryKey: ['/api/terms'],
    queryFn: async () => {
      const res = await fetch('/api/terms', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch terms');
      return res.json();
    },
  });

  // Filter to only active terms
  const activeTerms = terms?.filter((term: any) => term.active) || [];

  // Get all unique term types
  const termTypes = activeTerms.length > 0 
    ? [...new Set(activeTerms.map((term: any) => term.type))] 
    : [];

  // If no active term type is set, set it to the first available one
  React.useEffect(() => {
    if (!activeTermType && termTypes.length > 0) {
      setActiveTermType(termTypes[0]);
    }
  }, [termTypes, activeTermType]);

  // Format term type for display
  const formatTermType = (type: string): string => {
    return type
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Get the current displayed term
  const currentTerm = activeTermType
    ? activeTerms.find((term: any) => term.type === activeTermType)
    : null;

  return (
    <div className="bg-neutral-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Terms & Policies</h1>
          <p className="mt-2 text-neutral-600">Important information about using our services</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/3 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-6" />
              
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ) : activeTerms.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-neutral-600">No terms or policies found.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              {termTypes.length > 1 && (
                <Tabs value={activeTermType || ''} onValueChange={setActiveTermType} className="mb-6">
                  <TabsList className="w-full flex justify-center">
                    {termTypes.map((type) => (
                      <TabsTrigger key={type} value={type}>
                        {formatTermType(type)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

              {currentTerm ? (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">{currentTerm.title}</h2>
                  <div className="text-neutral-700 space-y-4">
                    {currentTerm.content.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-6 text-sm text-neutral-500">
                    Last updated: {new Date(currentTerm.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <p className="text-neutral-600 text-center">Please select a policy to view.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
