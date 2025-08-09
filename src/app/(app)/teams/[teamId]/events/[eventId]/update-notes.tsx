"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveNotes } from "./actions";

export default function UpdateNotes({ teamId, eventId, notesPre, notesPost }:
  { teamId: string; eventId: string; notesPre: string; notesPost: string }) {
  const [pre, setPre] = useState(notesPre);
  const [post, setPost] = useState(notesPost);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveNotes(teamId, eventId, pre, post);
          if (res.ok) toast.success("Notes saved");
          else toast.error(res.error ?? "Failed to save");
        });
      }}
      className="space-y-4"
    >
      <div>
        <div className="text-sm font-medium mb-1">Pre-event notes</div>
        <Textarea value={pre} onChange={e => setPre(e.target.value)} rows={6} />
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Post-event notes</div>
        <Textarea value={post} onChange={e => setPost(e.target.value)} rows={6} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save notes"}</Button>
    </form>
  );
}
