export type FavoriteType = 'ROOT' | 'COMMAND' | 'LINK' | 'DOCUMENT';

export interface FavoriteCategory {
  id: number;
  userId: number;
  name: string;
  favoriteType: FavoriteType;
  description?: string;
  icon?: string;
  parentId?: number;
  depth: number;
  displayOrder: number;
  isActive: boolean;
  children?: FavoriteCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteContent {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  content?: string;
  contentType: FavoriteType;
  metadata?: {
    url?: string;
    language?: string;
    tags?: string[];
  };
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteCategoryFile {
  id: number;
  categoryId: number;
  userId: number;
  originalName: string;
  storedName: string;
  s3Url: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
