"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateEvent } from "../actions";

export default function EditEventDialog({ teamId, event }: {
  teamId: string;
  event: { id: string; type: "training"|"game"|"other"; date: string; start_time: string|null; title: string|null }
}) {
  const [open, setOpen] = useState(false);

  async function onSubmit(formData: FormData) {
    formData.set("id", event.id);
    formData.set("team_id", teamId);
    const res = await updateEvent(formData);
    if (res.ok) { toast.success("Event updated"); setOpen(false); }
    else { toast.error(res.error ?? "Update failed"); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="secondary">Edit</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit event</DialogTitle></DialogHeader>
        <form action={onSubmit} className="space-y-3">
          <Select name="type" defaultValue={event.type}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="game">Game</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input name="date" type="date" defaultValue={event.date} required />
          <Input name="start_time" type="time" defaultValue={event.start_time ?? ""} />
          <Input name="title" placeholder="Title" defaultValue={event.title ?? ""} />
          <div className="flex justify-end"><Button type="submit">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
