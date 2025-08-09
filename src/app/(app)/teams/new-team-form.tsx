"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTeam } from "./actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewTeamForm() {
  const [open, setOpen] = useState(false);

  async function onSubmit(formData: FormData) {
    const res = await createTeam(formData);
    if (res.ok) {
      toast.success("Team created");
      setOpen(false);
    } else {
      toast.error(res.error ?? "Failed to create team");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add Team</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Team</DialogTitle></DialogHeader>
        <form action={onSubmit} className="space-y-3">
          <Input name="name" placeholder="Team name (e.g., U9)" required />
          <Input name="season" placeholder="Season (e.g., 2025/26)" />
          <Select name="color">
            <SelectTrigger><SelectValue placeholder="Color (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="slate">Slate</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="red">Red</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
