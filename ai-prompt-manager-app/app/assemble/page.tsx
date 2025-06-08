
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Save, FileText, Target, Layers, Search as SearchIcon, Copy, X, Filter, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/copy-button';
import type { CidiComponent, AssembledPrompt } from '@/lib/types';

export default function AssemblePage() {
  const [components, setComponents] = useState<{
    CONTEXT: CidiComponent[];
    INSTRUCTIONS: CidiComponent[];
    DETAILS: CidiComponent[];
    INPUT: CidiComponent[];
  }>({
    CONTEXT: [],
    INSTRUCTIONS: [],
    DETAILS: [],
    INPUT: [],
  });
  
  const [selectedComponents, setSelectedComponents] = useState<{
    contextId?: string;
    instructionsId?: string;
    detailsId?: string;
    inputId?: string;
  }>({});
  
  // Filter states for each component type
  const [filters, setFilters] = useState<{
    CONTEXT: { title: string; category: string; tag: string };
    INSTRUCTIONS: { title: string; category: string; tag: string };
    DETAILS: { title: string; category: string; tag: string };
    INPUT: { title: string; category: string; tag: string };
  }>({
    CONTEXT: { title: '', category: 'all', tag: 'all' },
    INSTRUCTIONS: { title: '', category: 'all', tag: 'all' },
    DETAILS: { title: '', category: 'all', tag: 'all' },
    INPUT: { title: '', category: 'all', tag: 'all' },
  });

  // Dynamic filter options for each component type
  const [filterOptions, setFilterOptions] = useState<{
    CONTEXT: { categories: string[]; tags: string[] };
    INSTRUCTIONS: { categories: string[]; tags: string[] };
    DETAILS: { categories: string[]; tags: string[] };
    INPUT: { categories: string[]; tags: string[] };
  }>({
    CONTEXT: { categories: [], tags: [] },
    INSTRUCTIONS: { categories: [], tags: [] },
    DETAILS: { categories: [], tags: [] },
    INPUT: { categories: [], tags: [] },
  });
  
  const [promptName, setPromptName] = useState('');
  const [assembledPrompt, setAssembledPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const componentTypes = [
    { type: 'CONTEXT', label: 'Context', icon: FileText, color: 'bg-blue-500', description: 'Background information and setting' },
    { type: 'INSTRUCTIONS', label: 'Instructions', icon: Target, color: 'bg-green-500', description: 'Clear directives and commands' },
    { type: 'DETAILS', label: 'Details', icon: Layers, color: 'bg-purple-500', description: 'Specific requirements and constraints' },
    { type: 'INPUT', label: 'Input', icon: SearchIcon, color: 'bg-orange-500', description: 'Data and variables for processing' },
  ];

  // Filter components based on title, category, and tags separately
  const filterComponents = (componentList: CidiComponent[], filter: { title: string; category: string; tag: string }) => {
    if (!filter.title && !filter.category && !filter.tag) return componentList;
    
    return componentList.filter(component => {
      const titleMatch = !filter.title || 
        component.title.toLowerCase().includes(filter.title.toLowerCase());
      
      const categoryMatch = !filter.category || filter.category === 'all' ||
        (component.category && component.category === filter.category);
      
      const tagMatch = !filter.tag || filter.tag === 'all' ||
        component.tags.includes(filter.tag);
      
      return titleMatch && categoryMatch && tagMatch;
    });
  };

  // Extract unique categories and tags for each component type
  const extractFilterOptions = (componentList: CidiComponent[]) => {
    const categories = Array.from(new Set(
      componentList
        .map(c => c.category)
        .filter((category): category is string => Boolean(category))
    )).sort();
    
    const tags = Array.from(new Set(
      componentList
        .flatMap(c => c.tags)
        .filter(tag => Boolean(tag))
    )).sort();
    
    return { categories, tags };
  };

  // Get filtered components for each type
  const getFilteredComponents = (type: keyof typeof components) => {
    return filterComponents(components[type], filters[type]);
  };

  // Update filter for a specific component type
  const updateFilter = (type: keyof typeof filters, field: 'title' | 'category' | 'tag', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  // Clear specific filter field for a component type
  const clearFilterField = (type: keyof typeof filters, field: 'title' | 'category' | 'tag') => {
    setFilters(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: field === 'title' ? '' : 'all'
      }
    }));
  };

  // Clear all filters for a specific component type
  const clearAllFilters = (type: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [type]: { title: '', category: 'all', tag: 'all' }
    }));
  };

  // Check if any filter is active for a component type
  const hasActiveFilter = (type: keyof typeof filters) => {
    const filter = filters[type];
    return filter.title !== '' || (filter.category !== '' && filter.category !== 'all') || (filter.tag !== '' && filter.tag !== 'all');
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    assemblePrompt();
  }, [selectedComponents, components]);

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/components');
      if (response.ok) {
        const data: CidiComponent[] = await response.json();
        
        const groupedComponents = {
          CONTEXT: data.filter(c => c.type === 'CONTEXT'),
          INSTRUCTIONS: data.filter(c => c.type === 'INSTRUCTIONS'),
          DETAILS: data.filter(c => c.type === 'DETAILS'),
          INPUT: data.filter(c => c.type === 'INPUT'),
        };
        
        // Extract filter options for each component type
        const newFilterOptions = {
          CONTEXT: extractFilterOptions(groupedComponents.CONTEXT),
          INSTRUCTIONS: extractFilterOptions(groupedComponents.INSTRUCTIONS),
          DETAILS: extractFilterOptions(groupedComponents.DETAILS),
          INPUT: extractFilterOptions(groupedComponents.INPUT),
        };
        
        setComponents(groupedComponents);
        setFilterOptions(newFilterOptions);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch components',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching components:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch components',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const assemblePrompt = () => {
    const parts: string[] = [];
    
    if (selectedComponents.contextId) {
      const context = components.CONTEXT.find(c => c.id === selectedComponents.contextId);
      if (context) {
        parts.push(`**CONTEXT:**\n${context.content}`);
      }
    }
    
    if (selectedComponents.instructionsId) {
      const instructions = components.INSTRUCTIONS.find(c => c.id === selectedComponents.instructionsId);
      if (instructions) {
        parts.push(`**INSTRUCTIONS:**\n${instructions.content}`);
      }
    }
    
    if (selectedComponents.detailsId) {
      const details = components.DETAILS.find(c => c.id === selectedComponents.detailsId);
      if (details) {
        parts.push(`**DETAILS:**\n${details.content}`);
      }
    }
    
    if (selectedComponents.inputId) {
      const input = components.INPUT.find(c => c.id === selectedComponents.inputId);
      if (input) {
        parts.push(`**INPUT:**\n${input.content}`);
      }
    }
    
    setAssembledPrompt(parts.join('\n\n'));
  };

  const handleComponentSelect = (type: string, componentId: string) => {
    const key = `${type.toLowerCase()}Id` as keyof typeof selectedComponents;
    setSelectedComponents({
      ...selectedComponents,
      [key]: componentId === selectedComponents[key] ? undefined : componentId,
    });
  };

  const clearComponentSelection = (type: string) => {
    const key = `${type.toLowerCase()}Id` as keyof typeof selectedComponents;
    setSelectedComponents({
      ...selectedComponents,
      [key]: undefined,
    });
  };

  const handleSave = async () => {
    if (!promptName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the prompt',
        variant: 'destructive',
      });
      return;
    }

    if (!assembledPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please select at least one component to create a prompt',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: promptName,
          finalPromptText: assembledPrompt,
          ...selectedComponents,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Prompt saved successfully',
        });
        setPromptName('');
        setSelectedComponents({});
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save prompt',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prompt',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const clearSelection = () => {
    setSelectedComponents({});
    setPromptName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Assemble Prompt</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select components from each CIDI category to build your perfect AI prompt
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Selection</CardTitle>
              <CardDescription>Choose components for each CIDI category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {componentTypes.map((type, index) => {
                const IconComponent = type.icon;
                const allTypeComponents = components[type.type as keyof typeof components];
                const filteredComponents = getFilteredComponents(type.type as keyof typeof components);
                const selectedId = selectedComponents[`${type.type.toLowerCase()}Id` as keyof typeof selectedComponents];
                const currentFilter = filters[type.type as keyof typeof filters];
                const isFilterActive = hasActiveFilter(type.type as keyof typeof filters);
                
                return (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="space-y-4"
                  >
                    {/* Component Type Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${type.color}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{type.label} Components</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearComponentSelection(type.type)}
                            className="text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear Selection
                          </Button>
                        )}
                        {isFilterActive && (
                          <Badge variant="secondary" className="text-xs">
                            <Filter className="h-3 w-3 mr-1" />
                            Filtered
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Condensed Filter Controls - Single Row */}
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">Filters</Label>
                        {isFilterActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearAllFilters(type.type as keyof typeof filters)}
                            className="h-7 px-2 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear All
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Title Filter */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Title</Label>
                          <Input
                            placeholder="Search title..."
                            value={currentFilter.title}
                            onChange={(e) => updateFilter(type.type as keyof typeof filters, 'title', e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Category</Label>
                          <Select
                            value={currentFilter.category || 'all'}
                            onValueChange={(value) => updateFilter(type.type as keyof typeof filters, 'category', value)}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {filterOptions[type.type as keyof typeof filterOptions].categories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tag Filter */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Tags</Label>
                          <Select
                            value={currentFilter.tag || 'all'}
                            onValueChange={(value) => updateFilter(type.type as keyof typeof filters, 'tag', value)}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="All Tags" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Tags</SelectItem>
                              {filterOptions[type.type as keyof typeof filterOptions].tags.map(tag => (
                                <SelectItem key={tag} value={tag}>
                                  {tag}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-3">
                        Showing {filteredComponents.length} of {allTypeComponents.length} components
                      </div>
                    </div>
                    
                    {/* Visual Component Selection */}
                    <div className="space-y-3">
                      {filteredComponents.length > 0 ? (
                        <div className="grid gap-3">
                          {filteredComponents.map((component) => {
                            const isSelected = selectedId === component.id;
                            return (
                              <motion.div
                                key={component.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`
                                  relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                  ${isSelected 
                                    ? 'border-primary bg-primary/5 shadow-md' 
                                    : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                                  }
                                `}
                                onClick={() => handleComponentSelect(type.type, component.id)}
                              >
                                {/* Selection Indicator */}
                                {isSelected && (
                                  <div className="absolute top-3 right-3">
                                    <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                                      <Check className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                  </div>
                                )}
                                
                                <div className="space-y-2 pr-8">
                                  {/* Title and Category */}
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-medium text-sm leading-tight">
                                      {component.title}
                                    </h4>
                                    {component.category && (
                                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                                        {component.category}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Content Preview */}
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {component.content.length > 100 
                                      ? `${component.content.substring(0, 100)}...` 
                                      : component.content
                                    }
                                  </p>
                                  
                                  {/* Tags */}
                                  {component.tags && component.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {component.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {component.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{component.tags.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <IconComponent className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No components match your filters</p>
                          {isFilterActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearAllFilters(type.type as keyof typeof filters)}
                              className="mt-2 text-xs"
                            >
                              Clear filters to see all components
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Save Section */}
          <Card>
            <CardHeader>
              <CardTitle>Save Prompt</CardTitle>
              <CardDescription>Give your assembled prompt a name and save it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promptName">Prompt Name</Label>
                <Input
                  id="promptName"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  placeholder="Enter a name for this prompt"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Prompt'}
                </Button>
                <Button variant="outline" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prompt Preview</CardTitle>
                  <CardDescription>Live preview of your assembled prompt</CardDescription>
                </div>
                {assembledPrompt && (
                  <CopyButton text={assembledPrompt} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {assembledPrompt ? (
                <div className="space-y-4">
                  <Textarea
                    value={assembledPrompt}
                    readOnly
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{assembledPrompt.length} characters</span>
                    <span>{assembledPrompt.split('\n').length} lines</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No components selected</h3>
                  <p className="text-muted-foreground">
                    Select components from the left panel to see your prompt preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Component Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Available Components</CardTitle>
          <CardDescription>Component counts and filter status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {componentTypes.map(type => {
              const IconComponent = type.icon;
              const totalCount = components[type.type as keyof typeof components].length;
              const filteredCount = getFilteredComponents(type.type as keyof typeof components).length;
              const isFiltered = hasActiveFilter(type.type as keyof typeof filters);
              
              return (
                <div key={type.type} className="text-center">
                  <div className={`p-3 rounded-lg ${type.color} mx-auto w-fit mb-2 relative`}>
                    <IconComponent className="h-6 w-6 text-white" />
                    {isFiltered && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isFiltered ? (
                      <>
                        <span className="font-medium">{filteredCount}</span> of {totalCount} shown
                      </>
                    ) : (
                      <>{totalCount} available</>
                    )}
                  </p>
                  {isFiltered && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      <Filter className="h-3 w-3 mr-1" />
                      Filtered
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
