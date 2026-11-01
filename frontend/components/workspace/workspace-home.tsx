"use client";

import { useWorkspace } from "@/components/workspace/workspace-provider";

export function WorkspaceHome() {
  const { workspace } = useWorkspace();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="truncate text-2xl font-bold">{workspace.name}</h1>
          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            {workspace.role}
          </span>
        </div>
        {workspace.description && (
          <p className="text-muted-foreground">{workspace.description}</p>
        )}
      </header>

      <div className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="font-medium">No documents yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Documents you create in this workspace will appear here.
        </p>
      </div>
    </section>
  );
}
//Role:"Main page content"