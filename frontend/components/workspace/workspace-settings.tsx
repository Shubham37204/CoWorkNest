"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { WorkspaceFields } from "@/components/workspace/workspace-fields";
import { deleteWorkspace, updateWorkspace } from "@/lib/api/workspace";
import { useApiErrorHandler } from "@/lib/hooks/use-api-error";

export function WorkspaceSettings() {
  const router = useRouter();
  const handleError = useApiErrorHandler();
  const { workspace, canManage, setWorkspace } = useWorkspace();

  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty =
    name.trim() !== workspace.name ||
    description.trim() !== (workspace.description ?? "");

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving || !canManage) return;

    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateWorkspace(workspace.id, { name, description });
      setWorkspace(updated);
      setName(updated.name);
      setDescription(updated.description ?? "");
      toast.success("Workspace updated");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (deleting || !canManage) return;

    setDeleting(true);
    try {
      await deleteWorkspace(workspace.id);
      toast.success("Workspace deleted");
      router.replace("/dashboard");
    } catch (err) {
      handleError(err);
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <Link
          href={`/workspaces/${workspace.id}`}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Back to workspace
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {!canManage && (
        <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          Only the workspace owner can change these settings.
        </p>
      )}

      <form onSubmit={onSave} className="space-y-4 rounded-xl border p-4">
        <WorkspaceFields
          idPrefix="ws-settings"
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          disabled={saving || !canManage}
        />

        {canManage && (
          <div className="flex justify-between">
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              Delete workspace
            </Button>
          </div>
        )}
      </form>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!deleting) setConfirmOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete workspace?</DialogTitle>
            <DialogDescription>
              &quot;{workspace.name}&quot; and its memberships will be permanently
              deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
//Role:"Edit and delete form"