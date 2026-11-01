export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export interface Workspace {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole;
}

export interface WorkspaceInput {
  name: string;
  description?: string;
}
