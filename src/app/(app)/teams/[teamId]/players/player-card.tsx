"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deletePlayer, updatePlayer } from "./actions";
import Link from "next/link";

export default function PlayerCard({
  teamId,
  player,
}: {
  teamId: string;
  player: { id: string; first_name: string; last_name: string; position?: string | null; jersey?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  async function onDelete() {
    start(async () => {
      const res = await deletePlayer(teamId, player.id);
      if (res.ok) toast.success("Player deleted");
      else toast.error(res.error ?? "Delete failed");
    });
  }

  async function onUpdate(formData: FormData) {
    formData.set("id", player.id);
    formData.set("team_id", teamId);
    const res = await updatePlayer(formData);
    if (res.ok) {
      toast.success("Player updated");
      setOpen(false);
    } else {
      toast.error(res.error ?? "Update failed");
    }
  }

  return (
    <div className="border rounded-lg p-3 flex items-center justify-between">
      <Link href={`/teams/${teamId}/players/${player.id}`} className="min-w-0">
        <div className="font-medium truncate">{player.first_name} {player.last_name}</div>
        <div className="text-sm text-muted-foreground">{player.position ?? "—"} {player.jersey ? `· #${player.jersey}` : ""}</div>
      </Link>
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" variant="secondary">Edit</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit player</DialogTitle></DialogHeader>
            <form action={onUpdate} className="space-y-3">
              <Input name="first_name" defaultValue={player.first_name} required />
              <Input name="last_name" defaultValue={player.last_name} required />
              <Input name="position" defaultValue={player.position ?? ""} />
              <Input name="jersey" defaultValue={player.jersey ?? ""} />
              <div className="flex justify-end"><Button type="submit">Save</Button></div>
            </form>
          </DialogContent>
        </Dialog>
        <Button size="sm" variant="destructive" disabled={pending} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
