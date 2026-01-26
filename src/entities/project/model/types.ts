export type ProjectType = 'ROOT' | 'NOTE' | 'MERMAID' | 'QA' | 'GITHUB' | 'FAQ' | 'MEMBER';
export type ContentType = 'NOTE' | 'MERMAID' | 'QA';

export interface ProjectCategory {
    id: number;
    userId: number;
    name: string;
    projectType: ProjectType;
    techType: string | null;
    description: string | null;
    parentId: number | null;
    displayOrder: number;
    depth: number;
    icon: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    children?: ProjectCategory[];
}

export interface ProjectContent {
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
    projectType?: ProjectType;
    techType?: string;
    description?: string;
    parentId?: number;
    icon?: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    projectType?: ProjectType;
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
