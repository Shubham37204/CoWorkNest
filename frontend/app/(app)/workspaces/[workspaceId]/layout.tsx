import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { WorkspaceNav } from "@/components/workspace/workspace-nav";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";

type Params = Promise<{ workspaceId: string }>;

async function WorkspaceShell({
  params,
  children,
}: {
  params: Params;
  children: ReactNode;
}) {
  const { workspaceId } = await params;
  const id = Number(workspaceId);

  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  return (
    <WorkspaceProvider key={id} workspaceId={id}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:flex-row">
        <WorkspaceNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </WorkspaceProvider>
  );
}

export default function WorkspaceLayout({
  params,
  children,
}: {
  params: Params;
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={<p className="p-6 text-muted-foreground">Loading workspace...</p>}
    >
      <WorkspaceShell params={params}>{children}</WorkspaceShell>
    </Suspense>
  );
}
