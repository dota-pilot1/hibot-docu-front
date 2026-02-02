export type ReviewType = "ROOT" | "NOTE" | "MERMAID" | "QA" | "FILE";
export type ContentType = "NOTE" | "MERMAID" | "QA" | "FIGMA";

// File types
export type CategoryFileType =
  | "PDF"
  | "DOCX"
  | "XLSX"
  | "TXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "OTHER";

export interface ReviewCategoryFile {
  id: number;
  categoryId: number;
  userId: number;
  originalName: string;
  storedName: string;
  s3Url: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: CategoryFileType;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReviewCategory {
  id: number;
  userId: number;
  name: string;
  reviewType: ReviewType;
  projectType: string | null;
  description: string | null;
  parentId: number | null;
  displayOrder: number;
  depth: number;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: ReviewCategory[];
}

export interface ReviewContent {
  id: number;
  categoryId: number;
  userId: number;
  title: string;
  content: string | null;
  contentType: ContentType;
  metadata: Record<string, any> | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewCategoryRequest {
  name: string;
  reviewType?: ReviewType;
  projectType?: string;
  description?: string;
  parentId?: number;
  icon?: string;
}

export interface UpdateReviewCategoryRequest {
  name?: string;
  reviewType?: ReviewType;
  description?: string;
  displayOrder?: number;
  icon?: string;
  isActive?: boolean;
}

export interface CreateReviewContentRequest {
  categoryId: number;
  title: string;
  content?: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
}

export interface UpdateReviewContentRequest {
  title?: string;
  content?: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
  displayOrder?: number;
  isActive?: boolean;
}
