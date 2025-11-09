// Type definitions for the application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  publishedAt: Date;
  tags: string[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export type Theme = 'light' | 'dark';

export interface AppConfig {
  theme: Theme;
  apiUrl: string;
  version: string;
}