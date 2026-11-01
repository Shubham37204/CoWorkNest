"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { getWorkspace } from "@/lib/api/workspace";
import { useApiErrorHandler } from "@/lib/hooks/use-api-error";
import type { Workspace } from "@/types/workspace";

type WorkspaceContextValue = {
  workspace: Workspace;
  canManage: boolean;
  setWorkspace: (next: Workspace) => void;
};

type State =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "ready"; workspace: Workspace };

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return value;
}

export function WorkspaceProvider({
  workspaceId,
  children,
}: {
  workspaceId: number;
  children: ReactNode;
}) {
  const handleError = useApiErrorHandler();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getWorkspace(workspaceId, controller.signal)
      .then((workspace) => setState({ status: "ready", workspace }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 404) {
          setState({ status: "not-found" });
          return;
        }
        handleError(err);
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [workspaceId, attempt, handleError]);

  const workspace = state.status === "ready" ? state.workspace : null;

  const value = useMemo<WorkspaceContextValue | null>(
    () =>
      workspace
        ? {
            workspace,
            canManage: workspace.role === "OWNER",
            setWorkspace: (next) => setState({ status: "ready", workspace: next }),
          }
        : null,
    [workspace],
  );

  if (state.status === "loading") {
    return (
      <p className="p-6 text-muted-foreground" aria-live="polite">
        Loading workspace...
      </p>
    );
  }

  if (state.status === "not-found") {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-3 p-6">
        <h1 className="text-2xl font-bold">Workspace not found</h1>
        <p className="text-muted-foreground">
          It may have been deleted, or you may not have access.
        </p>
        <Link href="/dashboard" className="underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  if (state.status === "error" || !value) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-3 p-6">
        <p>Could not load this workspace.</p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((n) => n + 1);
            }}
          >
            Retry
          </Button>
          <Link href="/dashboard" className="underline">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
//Role:"Fetches the workspace once and shares it"