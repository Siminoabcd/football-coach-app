"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

export async function saveNotes(teamId: string, eventId: string, notes_pre: string, notes_post: string) {
  const sb = await supabaseServer();
  const { error } = await sb.from("events").update({ notes_pre, notes_post }).eq("id", eventId).eq("team_id", teamId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/teams/${teamId}/events/${eventId}`);
  return { ok: true };
}
