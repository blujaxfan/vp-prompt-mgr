
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CidiComponent, ComponentFormData } from '@/lib/types';

interface ComponentFormProps {
  component?: CidiComponent | null;
  onSuccess: (component: CidiComponent) => void;
  onCancel: () => void;
}

export default function ComponentForm({ component, onSuccess, onCancel }: ComponentFormProps) {
  const [formData, setFormData] = useState<ComponentFormData>({
    title: '',
    content: '',
    category: '',
    tags: [],
    type: 'CONTEXT',
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (component) {
      setFormData({
        title: component.title,
        content: component.content,
        category: component.category || '',
        tags: component.tags,
        type: component.type,
      });
    }
  }, [component]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('=== Component Form Submit - START ===');
    console.log('Form data being submitted:', JSON.stringify(formData, null, 2));
    console.log('Is editing existing component:', !!component);
    if (component) {
      console.log('Existing component ID:', component.id);
    }

    try {
      const url = component ? `/api/components/${component.id}` : '/api/components';
      const method = component ? 'PUT' : 'POST';
      
      console.log('Request URL:', url);
      console.log('Request method:', method);
      console.log('Request payload:', JSON.stringify(formData, null, 2));

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        console.log('Response successful, parsing JSON...');
        const savedComponent = await response.json();
        console.log('Saved component:', JSON.stringify(savedComponent, null, 2));
        
        toast({
          title: 'Success',
          description: `Component ${component ? 'updated' : 'created'} successfully`,
        });
        console.log('=== Component Form Submit - SUCCESS ===');
        onSuccess(savedComponent);
      } else {
        console.log('Response failed, parsing error...');
        let errorData;
        try {
          errorData = await response.json();
          console.log('Error response data:', JSON.stringify(errorData, null, 2));
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: 'Unknown error occurred' };
        }
        
        const errorMessage = errorData.error || `Failed to ${component ? 'update' : 'create'} component`;
        console.error('Error message:', errorMessage);
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        console.log('=== Component Form Submit - API ERROR ===');
      }
    } catch (error: any) {
      console.error('=== Component Form Submit - NETWORK ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Full error object:', error);
      
      // Check for specific error types
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network/fetch error detected');
      }
      
      toast({
        title: 'Error',
        description: `Failed to ${component ? 'update' : 'create'} component`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('=== Component Form Submit - END ===');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {component ? 'Edit Component' : 'Create New Component'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter component title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONTEXT">Context</SelectItem>
                  <SelectItem value="INSTRUCTIONS">Instructions</SelectItem>
                  <SelectItem value="DETAILS">Details</SelectItem>
                  <SelectItem value="INPUT">Input</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter component content"
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Enter category (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Enter tag and press Enter"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (component ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
