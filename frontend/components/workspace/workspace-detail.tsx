"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  deleteWorkspace,
  getWorkspace,
  updateWorkspace,
} from "@/lib/api/workspace";
import { useApiErrorHandler } from "@/lib/hooks/use-api-error";
import type { Workspace } from "@/types/workspace";

type State =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "ready"; workspace: Workspace };

export function WorkspaceDetail({ workspaceId }: { workspaceId: number }) {
  const router = useRouter();
  const handleError = useApiErrorHandler();

  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getWorkspace(workspaceId, controller.signal)
      .then((workspace) => {
        setState({ status: "ready", workspace });
        setName(workspace.name);
        setDescription(workspace.description ?? "");
      })
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

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving || state.status !== "ready") return;

    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateWorkspace(workspaceId, { name, description });
      setState({ status: "ready", workspace: updated });
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
    if (deleting) return;

    setDeleting(true);
    try {
      await deleteWorkspace(workspaceId);
      toast.success("Workspace deleted");
      router.replace("/dashboard");
    } catch (err) {
      handleError(err);
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (state.status === "loading") {
    return (
      <p className="p-6 text-muted-foreground" aria-live="polite">
        Loading workspace...
      </p>
    );
  }

  if (state.status === "not-found") {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-6">
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

  if (state.status === "error") {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-6">
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

  const { workspace } = state;
  const isOwner = workspace.role === "OWNER";
  const dirty =
    name.trim() !== workspace.name ||
    description.trim() !== (workspace.description ?? "");

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <Link href="/dashboard" className="text-sm underline">
        Back to dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          {workspace.role}
        </span>
      </div>

      {isOwner ? (
        <form onSubmit={onSave} className="space-y-4 rounded-xl border p-4">
          <div className="space-y-2">
            <Label htmlFor="ws-name">Name</Label>
            <Input
              id="ws-name"
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ws-description">Description</Label>
            <Textarea
              id="ws-description"
              maxLength={1000}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

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
        </form>
      ) : (
        <p className="text-muted-foreground">
          {workspace.description ?? "No description"}
        </p>
      )}

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
    </main>
  );
}
