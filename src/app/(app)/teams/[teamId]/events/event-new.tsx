"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createEvent } from "./actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewEventDialog({
  teamId,
  open,
  onOpenChange,
  defaultDate,
  defaultTime,
}: {
  teamId: string;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  defaultDate?: string;
  defaultTime?: string;
}) {
  const controlled = typeof open === "boolean";
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = controlled ? open! : innerOpen;
  const setOpen = controlled ? onOpenChange! : setInnerOpen;

  async function onSubmit(formData: FormData) {
    formData.set("team_id", teamId);
    const res = await createEvent(formData);
    if (res.ok) { toast.success("Event created"); setOpen(false); }
    else { toast.error(res.error ?? "Failed to create event"); }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!controlled && (
        <DialogTrigger asChild><Button>New Event</Button></DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
        <form action={onSubmit} className="space-y-3">
          <Select name="type" defaultValue="training">
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="game">Game</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input name="date" type="date" required defaultValue={defaultDate} />
          <Input name="start_time" type="time" defaultValue={defaultTime} />
          <Input name="title" placeholder="Title (optional)" />
          <div className="flex justify-end"><Button type="submit">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
