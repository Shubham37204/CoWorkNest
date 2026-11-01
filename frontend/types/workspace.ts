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

export const WORKSPACE_NAME_MAX = 150;
export const WORKSPACE_DESCRIPTION_MAX = 1000;
