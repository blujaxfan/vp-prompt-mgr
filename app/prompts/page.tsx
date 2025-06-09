
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, Search, Edit, Trash2, Eye, FileText, Target, Layers, Search as SearchIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/copy-button';
import type { AssembledPrompt } from '@/lib/types';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<AssembledPrompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<AssembledPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<AssembledPrompt | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    filterPrompts();
  }, [prompts, searchTerm]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch prompts',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch prompts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPrompts = () => {
    let filtered = prompts;

    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.finalPromptText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrompts(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPrompts(prompts.filter(p => p.id !== id));
        toast({
          title: 'Success',
          description: 'Prompt deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete prompt',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete prompt',
        variant: 'destructive',
      });
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'CONTEXT': return FileText;
      case 'INSTRUCTIONS': return Target;
      case 'DETAILS': return Layers;
      case 'INPUT': return SearchIcon;
      default: return FileText;
    }
  };

  const getComponentColor = (type: string) => {
    switch (type) {
      case 'CONTEXT': return 'bg-blue-500';
      case 'INSTRUCTIONS': return 'bg-green-500';
      case 'DETAILS': return 'bg-purple-500';
      case 'INPUT': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Saved Prompts</h1>
          <p className="text-muted-foreground">Manage your assembled AI prompts</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((prompt, index) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{prompt.name}</CardTitle>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {prompt.context && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Context
                        </Badge>
                      )}
                      {prompt.instructions && (
                        <Badge variant="secondary" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Instructions
                        </Badge>
                      )}
                      {prompt.details && (
                        <Badge variant="secondary" className="text-xs">
                          <Layers className="h-3 w-3 mr-1" />
                          Details
                        </Badge>
                      )}
                      {prompt.input && (
                        <Badge variant="secondary" className="text-xs">
                          <SearchIcon className="h-3 w-3 mr-1" />
                          Input
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(prompt.createdAt.toString())}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {prompt.finalPromptText}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {prompt.finalPromptText.length} characters
                  </span>
                  <CopyButton text={prompt.finalPromptText} size="sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
            <p className="text-muted-foreground mb-4">
              {prompts.length === 0 
                ? "You haven't created any prompts yet. Start by assembling your first prompt!"
                : "Try adjusting your search terms"
              }
            </p>
            {prompts.length === 0 && (
              <Button onClick={() => window.location.href = '/assemble'}>
                <Brain className="h-4 w-4 mr-2" />
                Assemble Prompt
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Prompt Details Modal */}
      {showDetails && selectedPrompt && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedPrompt.name}</span>
                <CopyButton text={selectedPrompt.finalPromptText} />
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Component Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'context', label: 'Context', icon: FileText, color: 'bg-blue-500' },
                  { key: 'instructions', label: 'Instructions', icon: Target, color: 'bg-green-500' },
                  { key: 'details', label: 'Details', icon: Layers, color: 'bg-purple-500' },
                  { key: 'input', label: 'Input', icon: SearchIcon, color: 'bg-orange-500' },
                ].map(({ key, label, icon: Icon, color }) => {
                  const component = selectedPrompt[key as keyof AssembledPrompt] as any;
                  return (
                    <Card key={key} className={component ? '' : 'opacity-50'}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-sm">{label}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {component ? (
                          <div>
                            <h4 className="font-medium text-sm mb-1">{component.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {component.content}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not used</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Full Prompt */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Complete Prompt</h3>
                <Textarea
                  value={selectedPrompt.finalPromptText}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>{selectedPrompt.finalPromptText.length} characters</span>
                  <span>{selectedPrompt.finalPromptText.split('\n').length} lines</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-muted-foreground">{formatDate(selectedPrompt.createdAt.toString())}</p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">{formatDate(selectedPrompt.updatedAt.toString())}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
