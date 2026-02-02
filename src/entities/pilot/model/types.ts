export type PilotType = "ROOT" | "NOTE" | "MERMAID" | "QA" | "FILE";
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

export interface PilotCategoryFile {
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

export interface PilotCategory {
  id: number;
  userId: number;
  name: string;
  pilotType: PilotType;
  projectType: string | null;
  description: string | null;
  parentId: number | null;
  displayOrder: number;
  depth: number;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: PilotCategory[];
}

export interface PilotContent {
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

export interface CreatePilotCategoryRequest {
  name: string;
  pilotType?: PilotType;
  projectType?: string;
  description?: string;
  parentId?: number;
  icon?: string;
}

export interface UpdatePilotCategoryRequest {
  name?: string;
  pilotType?: PilotType;
  description?: string;
  displayOrder?: number;
  icon?: string;
  isActive?: boolean;
}

export interface CreatePilotContentRequest {
  categoryId: number;
  title: string;
  content?: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
}

export interface UpdatePilotContentRequest {
  title?: string;
  content?: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
  displayOrder?: number;
  isActive?: boolean;
}
