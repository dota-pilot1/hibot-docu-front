export type DesignSystemType =
  | "ROOT"
  | "NOTE"
  | "MERMAID"
  | "QA"
  | "FILE"
  | "GITHUB"
  | "FAQ"
  | "MEMBER";
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

export interface CategoryFile {
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

export interface DesignSystemCategory {
  id: number;
  userId: number;
  name: string;
  designSystemType: DesignSystemType;
  techType: string | null;
  description: string | null;
  parentId: number | null;
  displayOrder: number;
  depth: number;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: DesignSystemCategory[];
}

export interface DesignSystemContent {
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

export interface CreateCategoryRequest {
  name: string;
  designSystemType?: DesignSystemType;
  techType?: string;
  description?: string;
  parentId?: number;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  designSystemType?: DesignSystemType;
  description?: string;
  displayOrder?: number;
  icon?: string;
  isActive?: boolean;
}

export interface CreateContentRequest {
  categoryId: number;
  title: string;
  content?: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
}

export interface UpdateContentRequest {
  title?: string;
  content?: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
  displayOrder?: number;
  isActive?: boolean;
}
