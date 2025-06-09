
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, Layers, Target, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Stats {
  totalComponents: number;
  totalPrompts: number;
  componentsByType: {
    CONTEXT: number;
    INSTRUCTIONS: number;
    DETAILS: number;
    INPUT: number;
  };
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalComponents: 0,
    totalPrompts: 0,
    componentsByType: {
      CONTEXT: 0,
      INSTRUCTIONS: 0,
      DETAILS: 0,
      INPUT: 0
    }
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const componentTypes = [
    { type: 'CONTEXT', icon: FileText, color: 'bg-blue-500', description: 'Background information and setting' },
    { type: 'INSTRUCTIONS', icon: Target, color: 'bg-green-500', description: 'Clear directives and commands' },
    { type: 'DETAILS', icon: Layers, color: 'bg-purple-500', description: 'Specific requirements and constraints' },
    { type: 'INPUT', icon: Search, color: 'bg-orange-500', description: 'Data and variables for processing' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">AI Prompt Manager</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Organize and assemble powerful AI prompts using the CIDI framework. 
          Create reusable components and build sophisticated prompts with ease.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Components</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComponents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assembled Prompts</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrompts}</div>
          </CardContent>
        </Card>

        {componentTypes.slice(0, 2).map((component, index) => (
          <Card key={component.type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{component.type}</CardTitle>
              <component.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.componentsByType[component.type as keyof typeof stats.componentsByType]}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* CIDI Framework Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {componentTypes.map((component, index) => (
          <Card key={component.type} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${component.color}`}>
                  <component.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{component.type}</CardTitle>
              </div>
              <CardDescription>{component.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                {stats.componentsByType[component.type as keyof typeof stats.componentsByType]} components
              </Badge>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Manage Components</span>
            </CardTitle>
            <CardDescription>
              Create, edit, and organize your CIDI components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/components">
              <Button className="w-full">Manage Components</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Assemble Prompts</span>
            </CardTitle>
            <CardDescription>
              Combine components to create powerful prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/assemble">
              <Button className="w-full">Assemble Prompts</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Saved Prompts</span>
            </CardTitle>
            <CardDescription>
              View and manage your assembled prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/prompts">
              <Button className="w-full">View Prompts</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
