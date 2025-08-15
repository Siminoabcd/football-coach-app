"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

export default function DeleteTeamButton({
  teamId,
  teamName,
  onDelete, // server action passed from page
}: {
  teamId: string;
  teamName: string;
  onDelete: (teamId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const canDelete = confirmText.trim() === teamName.trim();

  function run() {
    start(async () => {
      const res = await onDelete(teamId);
      if (!res?.ok) {
        toast.error(res?.error ?? "Failed to delete team");
      } else {
        toast.success(`Deleted “${teamName}”`);
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="inline-flex items-center gap-1">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete team</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This will permanently remove <b>{teamName}</b> and all its events, attendance, drills, player links, and stats.
          This cannot be undone.
        </p>
        <div className="space-y-2">
          <label className="text-sm">Type the team name to confirm</label>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={teamName} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={run} disabled={!canDelete || pending}>
            {pending ? "Deleting…" : "Delete team"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
