import type {
  DocumentResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from "@/types/document";

// Implement these using your existing API client.

export async function getDocuments(
  workspaceId: number
): Promise<DocumentResponse[]> {
  // GET /api/workspaces/{workspaceId}/documents
  throw new Error("Implementation pending");
}

export async function getDocument(
  workspaceId: number,
  documentId: number
): Promise<DocumentResponse> {
  // GET /api/workspaces/{workspaceId}/documents/{documentId}
  throw new Error("Implementation pending");
}

export async function createDocument(
  workspaceId: number,
  data: CreateDocumentRequest
): Promise<DocumentResponse> {
  // POST /api/workspaces/{workspaceId}/documents
  throw new Error("Implementation pending");
}

export async function updateDocument(
  workspaceId: number,
  documentId: number,
  data: UpdateDocumentRequest
): Promise<DocumentResponse> {
  // PATCH /api/workspaces/{workspaceId}/documents/{documentId}
  throw new Error("Implementation pending");
}

export async function deleteDocument(
  workspaceId: number,
  documentId: number
): Promise<void> {
  // DELETE /api/workspaces/{workspaceId}/documents/{documentId}
  throw new Error("Implementation pending");
}
