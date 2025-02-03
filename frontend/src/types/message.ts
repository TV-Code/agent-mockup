export interface Message {
  id: string;
  text: string;
  type: 'user' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
  steps?: {
    title: string;
    status: 'completed' | 'in-progress' | 'pending';
    timeEstimate?: string;
  }[];
} 