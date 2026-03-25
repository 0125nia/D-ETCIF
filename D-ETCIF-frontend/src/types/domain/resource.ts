export interface ResourceItem {
  id: number;
  name: string;
  children?: ResourceItem[];
  url?: string;
  type?: 'pdf' | 'image' | 'text' | 'html' | 'video';
}