import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PencilIcon, TrashIcon, PlusIcon, LinkIcon, EyeIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// Form schema
const adFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  targetUrl: z.string().url('Must be a valid URL'),
  active: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type AdFormValues = z.infer<typeof adFormSchema>;

export default function AdsManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<number | null>(null);

  // Fetch ads
  const { data: ads, isLoading: isLoadingAds } = useQuery({
    queryKey: ['/api/ads'],
    queryFn: async () => {
      const res = await fetch('/api/ads', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch ads');
      return res.json();
    },
  });

  // Create ad mutation
  const createAdMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/ads', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create ad');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast({ title: 'Success', description: 'Ad created successfully' });
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update ad mutation
  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const res = await fetch(`/api/ads/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: data,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update ad');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast({ title: 'Success', description: 'Ad updated successfully' });
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete ad mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/ads/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast({ title: 'Success', description: 'Ad deleted successfully' });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Form for creating a new ad
  const createForm = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      name: '',
      description: '',
      targetUrl: '',
      active: true,
      startDate: '',
      endDate: '',
    },
  });

  // Form for editing an existing ad
  const editForm = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      name: '',
      description: '',
      targetUrl: '',
      active: true,
      startDate: '',
      endDate: '',
    },
  });

  const handleCreateSubmit = (values: AdFormValues) => {
    const formData = new FormData();
    formData.append('name', values.name);
    if (values.description) formData.append('description', values.description);
    formData.append('targetUrl', values.targetUrl);
    formData.append('active', values.active.toString());
    if (values.startDate) formData.append('startDate', values.startDate);
    if (values.endDate) formData.append('endDate', values.endDate);
    
    // Get the file input from the form
    const fileInput = document.querySelector('#create-image') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('image', fileInput.files[0]);
    }
    
    createAdMutation.mutate(formData);
  };

  const handleEditSubmit = (values: AdFormValues) => {
    if (!currentAd) return;
    
    const formData = new FormData();
    formData.append('name', values.name);
    if (values.description) formData.append('description', values.description);
    formData.append('targetUrl', values.targetUrl);
    formData.append('active', values.active.toString());
    if (values.startDate) formData.append('startDate', values.startDate);
    if (values.endDate) formData.append('endDate', values.endDate);
    
    // Get the file input from the form
    const fileInput = document.querySelector('#edit-image') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('image', fileInput.files[0]);
    }
    
    updateAdMutation.mutate({ id: currentAd.id, data: formData });
  };

  const handleEditClick = (ad: any) => {
    setCurrentAd(ad);
    
    // Format dates for the form
    const startDate = ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 10) : '';
    const endDate = ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 10) : '';
    
    editForm.reset({
      name: ad.name,
      description: ad.description || '',
      targetUrl: ad.targetUrl,
      active: ad.active,
      startDate,
      endDate,
    });
    setIsEditOpen(true);
  };

  const handlePreviewClick = (ad: any) => {
    setCurrentAd(ad);
    setIsPreviewOpen(true);
  };

  const handleDeleteClick = (adId: number) => {
    setAdToDelete(adId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (adToDelete !== null) {
      deleteAdMutation.mutate(adToDelete);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Ads Management</h1>
          <p className="text-neutral-600">Create, edit, and manage advertisements</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Advertisement</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ad name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ad description" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel htmlFor="create-image">Image</FormLabel>
                  <Input 
                    id="create-image" 
                    type="file" 
                    accept="image/*" 
                  />
                  <FormDescription>
                    Upload an image for this advertisement
                  </FormDescription>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          This advertisement will be displayed on the site
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAdMutation.isPending}
                  >
                    {createAdMutation.isPending ? 'Creating...' : 'Create Advertisement'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advertisements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAds ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-28" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No advertisements found. Create your first ad.
                    </TableCell>
                  </TableRow>
                ) : (
                  ads?.map((ad: any) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        {ad.imageUrl ? (
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.name} 
                            className="h-12 w-20 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center">
                            <LinkIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{ad.name}</TableCell>
                      <TableCell>
                        <a 
                          href={ad.targetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          {ad.targetUrl.substring(0, 25)}...
                          <LinkIcon className="h-3 w-3 ml-1" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            ad.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ad.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewClick(ad)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(ad)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(ad.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Ad Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Advertisement</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ad description" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel htmlFor="edit-image">Image (optional)</FormLabel>
                <Input 
                  id="edit-image" 
                  type="file" 
                  accept="image/*" 
                />
                {currentAd?.imageUrl && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Current image: {currentAd.imageUrl}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        This advertisement will be displayed on the site
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateAdMutation.isPending}
                >
                  {updateAdMutation.isPending ? 'Updating...' : 'Update Advertisement'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Ad Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ad Preview: {currentAd?.name}</DialogTitle>
          </DialogHeader>
          {currentAd && (
            <div className="flex flex-col items-center">
              {currentAd.imageUrl && (
                <div className="w-full max-h-64 overflow-hidden rounded border">
                  <img 
                    src={currentAd.imageUrl} 
                    alt={currentAd.name} 
                    className="w-full object-contain"
                  />
                </div>
              )}
              
              <div className="w-full mt-4">
                <h3 className="font-bold text-lg">{currentAd.name}</h3>
                {currentAd.description && (
                  <p className="text-neutral-600 mt-2">{currentAd.description}</p>
                )}
                
                <div className="mt-4">
                  <p className="text-sm font-semibold text-neutral-500">Target URL:</p>
                  <a 
                    href={currentAd.targetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline"
                  >
                    {currentAd.targetUrl}
                  </a>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-500">Start Date:</p>
                    <p>{formatDate(currentAd.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-500">End Date:</p>
                    <p>{formatDate(currentAd.endDate)}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-semibold text-neutral-500">Status:</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      currentAd.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {currentAd.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the advertisement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteAdMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
