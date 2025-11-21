export enum ItemType {
  FOLDER = 'folder',
  FILE = 'file'
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface FileSystemItem {
  id: string;
  kbId: string;
  parentId: string | null;
  type: ItemType;
  name: string;
  content?: string; // Only for files
  order: number; // For manual sorting
  createdAt: number;
  updatedAt: number;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export enum AIAction {
  SUMMARIZE = 'SUMMARIZE',
  IMPROVE = 'IMPROVE',
  CONTINUE = 'CONTINUE',
  FIX_GRAMMAR = 'FIX_GRAMMAR'
}

export type Language = 'en' | 'zh';

export type Theme = 'light' | 'dark' | 'system';