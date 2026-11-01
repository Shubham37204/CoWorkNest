import { notFound } from "next/navigation";

import { WorkspaceDetail } from "@/components/workspace/workspace-detail";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const id = Number(workspaceId);

  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  return <WorkspaceDetail workspaceId={id} />;
}
