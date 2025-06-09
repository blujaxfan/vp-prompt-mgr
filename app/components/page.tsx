
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, FileText, Target, Layers, Search as SearchIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import ComponentForm from '@/components/component-form';
import type { CidiComponent } from '@/lib/types';

export default function ComponentsPage() {
  const [components, setComponents] = useState<CidiComponent[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<CidiComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<CidiComponent | null>(null);
  const { toast } = useToast();

  const componentTypes = [
    { value: 'CONTEXT', label: 'Context', icon: FileText, color: 'bg-blue-500' },
    { value: 'INSTRUCTIONS', label: 'Instructions', icon: Target, color: 'bg-green-500' },
    { value: 'DETAILS', label: 'Details', icon: Layers, color: 'bg-purple-500' },
    { value: 'INPUT', label: 'Input', icon: SearchIcon, color: 'bg-orange-500' },
  ];

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    filterComponents();
  }, [components, searchTerm, selectedType, selectedCategory]);

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/components');
      if (response.ok) {
        const data = await response.json();
        setComponents(data);
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

  const filterComponents = () => {
    let filtered = components;

    if (selectedType !== 'all') {
      filtered = filtered.filter(component => component.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(component => component.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(component =>
        component.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredComponents(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this component?')) return;

    try {
      const response = await fetch(`/api/components/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComponents(components.filter(c => c.id !== id));
        toast({
          title: 'Success',
          description: 'Component deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete component',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting component:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete component',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = (component: CidiComponent) => {
    if (editingComponent) {
      setComponents(components.map(c => c.id === component.id ? component : c));
    } else {
      setComponents([component, ...components]);
    }
    setShowForm(false);
    setEditingComponent(null);
  };

  const getUniqueCategories = () => {
    const categories = components
      .map(c => c.category)
      .filter((category): category is string => Boolean(category))
      .filter((category, index, array) => array.indexOf(category) === index);
    return categories;
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = componentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : FileText;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = componentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'bg-gray-500';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">CIDI Components</h1>
          <p className="text-muted-foreground">Manage your Context, Instructions, Details, and Input components</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Component</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {componentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getUniqueCategories().map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComponents.map((component, index) => {
          const IconComponent = getTypeIcon(component.type);
          return (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(component.type)}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{component.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {component.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingComponent(component);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(component.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {component.content}
                  </p>
                  {component.category && (
                    <Badge variant="outline" className="mb-2">
                      {component.category}
                    </Badge>
                  )}
                  {component.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {component.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredComponents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No components found</h3>
            <p className="text-muted-foreground mb-4">
              {components.length === 0 
                ? "Get started by creating your first CIDI component"
                : "Try adjusting your filters or search terms"
              }
            </p>
            {components.length === 0 && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Component
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Component Form Dialog */}
      {showForm && (
        <ComponentForm
          component={editingComponent}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingComponent(null);
          }}
        />
      )}
    </div>
  );
}
