import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// Form schema
const termFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.string().min(1, 'Type is required'),
  active: z.boolean().default(true),
});

type TermFormValues = z.infer<typeof termFormSchema>;

export default function Terms() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState<number | null>(null);

  // Fetch terms
  const { data: terms, isLoading: isLoadingTerms } = useQuery({
    queryKey: ['/api/terms'],
    queryFn: async () => {
      const res = await fetch('/api/terms', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch terms');
      return res.json();
    },
  });

  // Create term mutation
  const createTermMutation = useMutation({
    mutationFn: async (data: TermFormValues) => {
      const res = await apiRequest('POST', '/api/terms', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/terms'] });
      toast({ title: 'Success', description: 'Term created successfully' });
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update term mutation
  const updateTermMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TermFormValues }) => {
      const res = await apiRequest('PUT', `/api/terms/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/terms'] });
      toast({ title: 'Success', description: 'Term updated successfully' });
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete term mutation
  const deleteTermMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/terms/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/terms'] });
      toast({ title: 'Success', description: 'Term deleted successfully' });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Form for creating a new term
  const createForm = useForm<TermFormValues>({
    resolver: zodResolver(termFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: '',
      active: true,
    },
  });

  // Form for editing an existing term
  const editForm = useForm<TermFormValues>({
    resolver: zodResolver(termFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: '',
      active: true,
    },
  });

  const handleCreateSubmit = (values: TermFormValues) => {
    createTermMutation.mutate(values);
  };

  const handleEditSubmit = (values: TermFormValues) => {
    if (!currentTerm) return;
    updateTermMutation.mutate({ id: currentTerm.id, data: values });
  };

  const handleEditClick = (term: any) => {
    setCurrentTerm(term);
    editForm.reset({
      title: term.title,
      content: term.content,
      type: term.type,
      active: term.active,
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (termId: number) => {
    setTermToDelete(termId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (termToDelete !== null) {
      deleteTermMutation.mutate(termToDelete);
    }
  };

  // Filter terms based on active tab
  const getFilteredTerms = () => {
    if (!terms) return [];
    if (activeTab === 'all') return terms;
    return terms.filter((term: any) => term.type === activeTab);
  };

  // Get all unique term types for the tabs
  const getTermTypes = () => {
    if (!terms) return [];
    const types = [...new Set(terms.map((term: any) => term.type))];
    return types;
  };

  // Format term type for display
  const formatTermType = (type: string): string => {
    return type
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const filteredTerms = getFilteredTerms();
  const termTypes = getTermTypes();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Terms & Policies</h1>
          <p className="text-neutral-600">Manage legal documents and policies for your site</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Term/Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Term/Policy</DialogTitle>
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
                        <Input placeholder="Terms of Service" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="terms-of-service">Terms of Service</SelectItem>
                          <SelectItem value="privacy-policy">Privacy Policy</SelectItem>
                          <SelectItem value="cookie-policy">Cookie Policy</SelectItem>
                          <SelectItem value="refund-policy">Refund Policy</SelectItem>
                          <SelectItem value="disclaimer">Disclaimer</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This determines how the document will be categorized
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the full content of your terms or policy..." 
                          className="min-h-[300px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          This document will be visible to users
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
                    disabled={createTermMutation.isPending}
                  >
                    {createTermMutation.isPending ? 'Creating...' : 'Create Document'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          {termTypes.map((type: string) => (
            <TabsTrigger key={type} value={type}>
              {formatTermType(type)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Terms & Policies' : formatTermType(activeTab)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTerms ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 border rounded">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTerms.length === 0 ? (
                    <p className="text-center py-4 text-neutral-500">
                      No terms or policies found. Create your first document.
                    </p>
                  ) : (
                    filteredTerms.map((term: any) => (
                      <div key={term.id} className="p-4 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{term.title}</h3>
                            <p className="text-sm text-neutral-500">
                              Type: {formatTermType(term.type)} | 
                              Status: <span className={term.active ? 'text-green-600' : 'text-red-600'}>
                                {term.active ? 'Active' : 'Inactive'}
                              </span> | 
                              Last Updated: {new Date(term.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(term)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(term.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Show a preview of the content */}
                        <div className="mt-3">
                          <p className="text-sm text-neutral-600 line-clamp-3">
                            {term.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Term Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Term/Policy</DialogTitle>
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
                      <Input placeholder="Terms of Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="terms-of-service">Terms of Service</SelectItem>
                        <SelectItem value="privacy-policy">Privacy Policy</SelectItem>
                        <SelectItem value="cookie-policy">Cookie Policy</SelectItem>
                        <SelectItem value="refund-policy">Refund Policy</SelectItem>
                        <SelectItem value="disclaimer">Disclaimer</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines how the document will be categorized
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the full content of your terms or policy..." 
                        className="min-h-[300px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        This document will be visible to users
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
                  disabled={updateTermMutation.isPending}
                >
                  {updateTermMutation.isPending ? 'Updating...' : 'Update Document'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteTermMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
