export type NoteType = "ROOT" | "NOTE" | "MERMAID" | "QA" | "FILE";
export type ContentType = "NOTE" | "MERMAID" | "QA" | "FIGMA";

// File types
export type NoteCategoryFileType =
  | "PDF"
  | "DOCX"
  | "XLSX"
  | "TXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "OTHER";

export interface NoteCategoryFile {
  id: number;
  categoryId: number;
  userId: number;
  originalName: string;
  storedName: string;
  s3Url: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: NoteCategoryFileType;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface NoteCategory {
  id: number;
  userId: number;
  name: string;
  noteType: NoteType;
  description: string | null;
  parentId: number | null;
  displayOrder: number;
  depth: number;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: NoteCategory[];
}

export interface NoteContent {
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

export interface CreateNoteCategoryRequest {
  name: string;
  noteType?: NoteType;
  description?: string;
  parentId?: number;
  icon?: string;
}

export interface UpdateNoteCategoryRequest {
  name?: string;
  noteType?: NoteType;
  description?: string;
  displayOrder?: number;
  icon?: string;
  isActive?: boolean;
}

export interface CreateNoteContentRequest {
  categoryId: number;
  title: string;
  content?: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
}

export interface UpdateNoteContentRequest {
  title?: string;
  content?: string;
  contentType?: ContentType;
  metadata?: Record<string, any>;
  displayOrder?: number;
  isActive?: boolean;
}
