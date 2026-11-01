"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { listWorkspaces } from "@/lib/api/workspace";
import { useApiErrorHandler } from "@/lib/hooks/use-api-error";
import type { Workspace } from "@/types/workspace";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Workspace[] };

export function WorkspaceList() {
  const handleError = useApiErrorHandler();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    listWorkspaces(controller.signal)
      .then((items) => setState({ status: "ready", items }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        handleError(err);
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [attempt, handleError]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  function onCreated(workspace: Workspace) {
    setState((prev) =>
      prev.status === "ready"
        ? { status: "ready", items: [workspace, ...prev.items] }
        : prev,
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your workspaces</h1>
        <CreateWorkspaceDialog onCreated={onCreated} />
      </div>

      {state.status === "loading" && (
        <p className="text-muted-foreground" aria-live="polite">
          Loading workspaces...
        </p>
      )}

      {state.status === "error" && (
        <div className="space-y-2">
          <p>Unable to load workspaces.</p>
          <Button variant="outline" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {state.status === "ready" && state.items.length === 0 && (
        <p className="text-muted-foreground">
          No workspaces yet. Create your first one to get started.
        </p>
      )}

      {state.status === "ready" && state.items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {state.items.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </section>
  );
}
