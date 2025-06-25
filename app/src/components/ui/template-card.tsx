'use client';

import { DatasetTemplate } from '@/lib/models';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Database, Bot, Sparkles } from 'lucide-react';

interface TemplateCardProps {
  template: DatasetTemplate;
  onSelect: (template: DatasetTemplate) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{template.name}</CardTitle>
          <div className="p-2 rounded-full bg-primary/20">
            {template.id === 'ultrachat-instruct' ? (
              <Bot className="h-6 w-6 text-primary" />
            ) : (
              <Sparkles className="h-6 w-6 text-primary" />
            )}
          </div>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {template.datasetSource.path}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Prompt Template:</p>
            <div className="bg-muted p-3 rounded-md text-xs overflow-hidden text-ellipsis max-h-20">
              {template.prompt.substring(0, 150)}
              {template.prompt.length > 150 && '...'}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{template.maxTokens.toLocaleString()} max tokens</Badge>
            <Badge variant="outline">${template.price.toFixed(2)} per 1K samples</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 pt-4">
        <Button 
          className="w-full" 
          onClick={() => onSelect(template)}
        >
          Use Template <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function TemplateList({ templates, onSelect }: { 
  templates: DatasetTemplate[]; 
  onSelect: (template: DatasetTemplate) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard 
          key={template.id} 
          template={template} 
          onSelect={onSelect} 
        />
      ))}
    </div>
  );
}
