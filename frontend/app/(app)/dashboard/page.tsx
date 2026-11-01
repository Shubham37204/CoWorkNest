import { WorkspaceList } from "@/components/workspace/workspace-list";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <WorkspaceList />
    </main>
  );
}