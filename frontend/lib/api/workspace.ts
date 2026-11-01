import { apiFetch } from "@/lib/api/client";
import type { Workspace, WorkspaceInput } from "@/types/workspace";

function toBody(input: WorkspaceInput): string {
  return JSON.stringify({
    name: input.name.trim(),
    description: input.description?.trim() || null,
  });
}

export function listWorkspaces(signal?: AbortSignal): Promise<Workspace[]> {
  return apiFetch<Workspace[]>("/api/workspaces", { cache: "no-store", signal });
}

export function getWorkspace(id: number, signal?: AbortSignal): Promise<Workspace> {
  return apiFetch<Workspace>(`/api/workspaces/${id}`, { cache: "no-store", signal });
}

export function createWorkspace(input: WorkspaceInput): Promise<Workspace> {
  return apiFetch<Workspace>("/api/workspaces", {
    method: "POST",
    body: toBody(input),
  });
}

export function updateWorkspace(id: number, input: WorkspaceInput): Promise<Workspace> {
  return apiFetch<Workspace>(`/api/workspaces/${id}`, {
    method: "PATCH",
    body: toBody(input),
  });
}

export function deleteWorkspace(id: number): Promise<void> {
  return apiFetch<void>(`/api/workspaces/${id}`, { method: "DELETE" });
}
