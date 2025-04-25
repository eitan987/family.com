export interface Document {
  id: string;
  name: string;
  uploadDate: Date;
  uploadedBy: string;
  type: string;
  url: string;
  tags: string[];
  size: number;
  description?: string;
} 