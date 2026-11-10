export interface DocumentResponse {
  id: number;
  workspaceId: number;
  title: string;
  description: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  description?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
}