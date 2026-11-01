import Link from "next/link";
import type { Workspace } from "@/types/workspace";

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="block rounded-xl border p-4 transition hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{workspace.name}</h3>
        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          {workspace.role}
        </span>
      </div>
      {workspace.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {workspace.description}
        </p>
      )}
    </Link>
  );
}
