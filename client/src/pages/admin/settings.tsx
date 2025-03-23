import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SaveIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// Form schema
const settingSchema = z.object({
  value: z.string().min(1, 'Value is required'),
});

type SettingFormValues = z.infer<typeof settingSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // Fetch settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiRequest('PUT', `/api/settings/${key}`, { value });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: 'Success', description: 'Setting updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Group settings by category for the tabs
  const groupedSettings = {
    general: settings?.filter((s: any) => s.key.startsWith('site_')) || [],
    email: settings?.filter((s: any) => s.key.startsWith('email_')) || [],
    social: settings?.filter((s: any) => s.key.startsWith('social_')) || [],
    analytics: settings?.filter((s: any) => s.key.startsWith('analytics_')) || [],
  };

  // Create a form for each setting
  const forms = new Map();

  const getSettingForm = (setting: any) => {
    if (!forms.has(setting.key)) {
      const form = useForm<SettingFormValues>({
        resolver: zodResolver(settingSchema),
        defaultValues: {
          value: setting.value,
        },
      });
      forms.set(setting.key, form);
    }
    return forms.get(setting.key);
  };

  const handleSubmit = (key: string, values: SettingFormValues) => {
    updateSettingMutation.mutate({ key, value: values.value });
  };

  // Helper to display setting fields based on their name pattern
  const getSettingInput = (setting: any, form: any) => {
    // Check if the setting value might be a long text
    if (
      setting.key.includes('description') ||
      setting.key.includes('text') ||
      setting.key.includes('content')
    ) {
      return (
        <Textarea 
          {...form.register('value')} 
          className="min-h-[100px]" 
        />
      );
    }
    
    // For URL types
    if (setting.key.includes('url') || setting.key.includes('link')) {
      return (
        <Input 
          {...form.register('value')} 
          type="url" 
          placeholder="https://" 
        />
      );
    }
    
    // For email types
    if (setting.key.includes('email')) {
      return (
        <Input 
          {...form.register('value')} 
          type="email" 
          placeholder="email@example.com" 
        />
      );
    }
    
    // Default to text input
    return (
      <Input 
        {...form.register('value')} 
      />
    );
  };

  // Format the setting key for display
  const formatSettingKey = (key: string): string => {
    // Remove prefix like 'site_', 'email_', etc.
    const parts = key.split('_');
    const nameWithoutPrefix = parts.length > 1 ? parts.slice(1).join('_') : key;
    
    // Replace underscores with spaces and capitalize
    return nameWithoutPrefix
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Site Settings</h1>
        <p className="text-neutral-600">Configure global settings for your site</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <TabsContent value={category} key={category}>
            <div className="grid grid-cols-1 gap-6">
              {isLoadingSettings ? (
                // Skeleton loaders for settings
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                // Actual settings
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {category === 'general' ? 'General Settings' : 
                       category === 'email' ? 'Email Configuration' :
                       category === 'social' ? 'Social Media Links' : 'Analytics Settings'}
                    </CardTitle>
                    <CardDescription>
                      {category === 'general' ? 'Basic site configuration settings' : 
                       category === 'email' ? 'Configure email settings for notifications' :
                       category === 'social' ? 'Set up your social media presence' : 'Configure analytics tracking'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {categorySettings.length === 0 ? (
                      <p className="text-center py-4 text-neutral-500">
                        No settings found in this category.
                      </p>
                    ) : (
                      categorySettings.map((setting: any) => {
                        const form = getSettingForm(setting);
                        
                        return (
                          <Form key={setting.key} {...form}>
                            <form onSubmit={form.handleSubmit((values) => handleSubmit(setting.key, values))}>
                              <div className="flex flex-col md:flex-row md:items-start gap-6">
                                <div className="md:w-1/3">
                                  <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{formatSettingKey(setting.key)}</FormLabel>
                                        <FormDescription>
                                          {setting.description || `Configure the ${formatSettingKey(setting.key).toLowerCase()}`}
                                        </FormDescription>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="flex-1">
                                  <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          {getSettingInput(setting, form)}
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="mt-2 md:mt-0">
                                  <Button 
                                    type="submit" 
                                    disabled={updateSettingMutation.isPending}
                                  >
                                    <SaveIcon className="h-4 w-4 mr-2" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </form>
                          </Form>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
