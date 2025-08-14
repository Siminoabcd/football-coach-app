"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : children}
    </Button>
  );
}

export default function NotesCard({
  notesPre,
  notesPost,
  onSave,
}: {
  notesPre: string | null;
  notesPost: string | null;
  onSave: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [open, setOpen] = React.useState(false);

  async function action(fd: FormData) {
    const res = await onSave(fd);
    if (!res.ok) toast.error(res.error ?? "Failed to save notes");
    else {
      toast.success("Notes saved");
      setOpen(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Notes</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Edit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Edit notes</DialogTitle></DialogHeader>
            <form action={action} className="space-y-3">
              <div>
                <label className="text-sm mb-1 block">Pre-session</label>
                <Textarea name="notes_pre" defaultValue={notesPre ?? ""} rows={4} />
              </div>
              <div>
                <label className="text-sm mb-1 block">Post-session</label>
                <Textarea name="notes_post" defaultValue={notesPost ?? ""} rows={4} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <SubmitBtn>Save</SubmitBtn>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 mt-3 md:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Pre</div>
          <div className="min-h-16 whitespace-pre-wrap rounded-md border bg-background p-2 text-sm">
            {notesPre || "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Post</div>
          <div className="min-h-16 whitespace-pre-wrap rounded-md border bg-background p-2 text-sm">
            {notesPost || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
