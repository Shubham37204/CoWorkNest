"use client";

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
import { WorkspaceFields } from "@/components/workspace/workspace-fields";
import { createWorkspace } from "@/lib/api/workspace";
import { useApiErrorHandler } from "@/lib/hooks/use-api-error";
import type { Workspace } from "@/types/workspace";

export function CreateWorkspaceDialog({
  onCreated,
}: {
  onCreated: (workspace: Workspace) => void;
}) {
  const handleError = useApiErrorHandler();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName("");
    setDescription("");
  }

  function onOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) reset();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createWorkspace({ name, description });
      onCreated(created);
      toast.success("Workspace created");
      setOpen(false);
      reset();
    } catch (err) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New workspace</Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create workspace</DialogTitle>
              <DialogDescription>
                Workspaces group your documents and teammates.
              </DialogDescription>
            </DialogHeader>

            <WorkspaceFields
              idPrefix="ws-create"
              name={name}
              description={description}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              disabled={submitting}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
//Role:" “New workspace” button and dialog"