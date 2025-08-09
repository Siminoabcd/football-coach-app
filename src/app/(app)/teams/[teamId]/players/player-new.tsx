"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createPlayer } from "./actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function NewPlayerDialog({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false);

  async function onSubmit(formData: FormData) {
    formData.set("team_id", teamId);
    const res = await createPlayer(formData);
    if (res.ok) {
      toast.success("Player added");
      setOpen(false);
    } else {
      toast.error(res.error ?? "Could not add player");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add Player</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Player</DialogTitle></DialogHeader>
        <form action={onSubmit} className="space-y-3">
          <Input name="first_name" placeholder="First name" required />
          <Input name="last_name" placeholder="Last name" required />
          <Input name="position" placeholder="Position (e.g., GK, CB, ST)" />
          <Input name="jersey" placeholder="Jersey number" />
          <div className="flex justify-end"><Button type="submit">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
