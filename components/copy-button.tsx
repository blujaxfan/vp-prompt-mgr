
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps {
  text: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function CopyButton({ text, variant = 'outline', size = 'sm', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy text to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={copyToClipboard}
      className={className}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {size !== 'icon' && (copied ? 'Copied!' : 'Copy')}
    </Button>
  );
}
