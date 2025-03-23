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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoPlayer } from '@/components/ui/video-player';
import { PencilIcon, TrashIcon, PlusIcon, PlayIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// Form schema
const videoFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  videoUrl: z.string().optional(), // This will be handled by file input
  thumbnailUrl: z.string().optional(), // This will be handled by file input
  duration: z.string().optional(),
  categoryId: z.string().optional(),
  published: z.boolean().default(false),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

export default function VideoManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);

  // Fetch videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
  });

  // Fetch categories for the dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/videos', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create video');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({ title: 'Success', description: 'Video created successfully' });
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: data,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update video');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({ title: 'Success', description: 'Video updated successfully' });
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/videos/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({ title: 'Success', description: 'Video deleted successfully' });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Form for creating a new video
  const createForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: '',
      published: false,
    },
  });

  // Form for editing an existing video
  const editForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: '',
      published: false,
    },
  });

  const handleCreateSubmit = (values: VideoFormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.description) formData.append('description', values.description);
    if (values.duration) formData.append('duration', values.duration);
    if (values.categoryId) formData.append('categoryId', values.categoryId);
    formData.append('published', values.published.toString());
    
    // Get the file inputs from the form
    const videoInput = document.querySelector('#create-video') as HTMLInputElement;
    const thumbnailInput = document.querySelector('#create-thumbnail') as HTMLInputElement;
    
    if (videoInput?.files?.[0]) {
      formData.append('video', videoInput.files[0]);
    } else {
      toast({ 
        title: 'Error', 
        description: 'Video file is required', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (thumbnailInput?.files?.[0]) {
      formData.append('thumbnail', thumbnailInput.files[0]);
    }
    
    createVideoMutation.mutate(formData);
  };

  const handleEditSubmit = (values: VideoFormValues) => {
    if (!currentVideo) return;
    
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.description) formData.append('description', values.description);
    if (values.duration) formData.append('duration', values.duration);
    if (values.categoryId) formData.append('categoryId', values.categoryId);
    formData.append('published', values.published.toString());
    
    // Get the file inputs from the form
    const videoInput = document.querySelector('#edit-video') as HTMLInputElement;
    const thumbnailInput = document.querySelector('#edit-thumbnail') as HTMLInputElement;
    
    if (videoInput?.files?.[0]) {
      formData.append('video', videoInput.files[0]);
    }
    
    if (thumbnailInput?.files?.[0]) {
      formData.append('thumbnail', thumbnailInput.files[0]);
    }
    
    updateVideoMutation.mutate({ id: currentVideo.id, data: formData });
  };

  const handleEditClick = (video: any) => {
    setCurrentVideo(video);
    editForm.reset({
      title: video.title,
      description: video.description || '',
      duration: video.duration ? String(video.duration) : '',
      categoryId: video.categoryId ? String(video.categoryId) : undefined,
      published: video.published,
    });
    setIsEditOpen(true);
  };

  const handlePreviewClick = (video: any) => {
    setCurrentVideo(video);
    setIsPreviewOpen(true);
  };

  const handleDeleteClick = (videoId: number) => {
    setVideoToDelete(videoId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (videoToDelete !== null) {
      deleteVideoMutation.mutate(videoToDelete);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Video Management</h1>
          <p className="text-neutral-600">Upload, edit, and manage video content</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload New Video</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Video title" {...field} />
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
                          placeholder="Video description" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel htmlFor="create-video">Video File</FormLabel>
                  <Input 
                    id="create-video" 
                    type="file" 
                    accept="video/*" 
                  />
                  <FormDescription>
                    Upload your video file (MP4 recommended)
                  </FormDescription>
                </div>
                
                <div>
                  <FormLabel htmlFor="create-thumbnail">Thumbnail Image</FormLabel>
                  <Input 
                    id="create-thumbnail" 
                    type="file" 
                    accept="image/*" 
                  />
                  <FormDescription>
                    Upload a thumbnail image for your video
                  </FormDescription>
                </div>
                
                <FormField
                  control={createForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (in seconds)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Duration in seconds" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Published</FormLabel>
                        <FormDescription>
                          This video will be visible to users
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
                    disabled={createVideoMutation.isPending}
                  >
                    {createVideoMutation.isPending ? 'Uploading...' : 'Upload Video'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingVideos ? (
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
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No videos found. Upload your first video.
                    </TableCell>
                  </TableRow>
                ) : (
                  videos?.map((video: any) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="h-12 w-20 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center">
                            <VideoIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{video.title}</TableCell>
                      <TableCell>
                        {categories?.find((c: any) => c.id === video.categoryId)?.name || '-'}
                      </TableCell>
                      <TableCell>{formatDuration(video.duration)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            video.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {video.published ? 'Published' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewClick(video)}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(video)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(video.id)}
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

      {/* Edit Video Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Video title" {...field} />
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
                        placeholder="Video description" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel htmlFor="edit-video">Video File (optional)</FormLabel>
                <Input 
                  id="edit-video" 
                  type="file" 
                  accept="video/*" 
                />
                {currentVideo?.videoUrl && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Current video: {currentVideo.videoUrl}
                  </p>
                )}
              </div>
              
              <div>
                <FormLabel htmlFor="edit-thumbnail">Thumbnail Image (optional)</FormLabel>
                <Input 
                  id="edit-thumbnail" 
                  type="file" 
                  accept="image/*" 
                />
                {currentVideo?.thumbnailUrl && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Current thumbnail: {currentVideo.thumbnailUrl}
                  </p>
                )}
              </div>
              
              <FormField
                control={editForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (in seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Duration in seconds" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Published</FormLabel>
                      <FormDescription>
                        This video will be visible to users
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
                  disabled={updateVideoMutation.isPending}
                >
                  {updateVideoMutation.isPending ? 'Updating...' : 'Update Video'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Video Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{currentVideo?.title}</DialogTitle>
          </DialogHeader>
          {currentVideo && (
            <div>
              <VideoPlayer 
                src={currentVideo.videoUrl} 
                poster={currentVideo.thumbnailUrl}
                height={400}
                width="100%"
                className="mb-4"
              />
              <p className="text-sm text-neutral-600">{currentVideo.description}</p>
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
              This action cannot be undone. This will permanently delete the video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteVideoMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
