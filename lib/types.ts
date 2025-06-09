
export interface CidiComponent {
  id: string;
  type: 'CONTEXT' | 'INSTRUCTIONS' | 'DETAILS' | 'INPUT';
  title: string;
  content: string;
  category?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssembledPrompt {
  id: string;
  name: string;
  finalPromptText: string;
  createdAt: Date;
  updatedAt: Date;
  contextId?: string;
  instructionsId?: string;
  detailsId?: string;
  inputId?: string;
  context?: CidiComponent;
  instructions?: CidiComponent;
  details?: CidiComponent;
  input?: CidiComponent;
}

export interface ComponentFormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  type: 'CONTEXT' | 'INSTRUCTIONS' | 'DETAILS' | 'INPUT';
}

export interface AssembledPromptFormData {
  name: string;
  contextId?: string;
  instructionsId?: string;
  detailsId?: string;
  inputId?: string;
}
