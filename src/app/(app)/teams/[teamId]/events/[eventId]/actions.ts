"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

export async function saveNotes(teamId: string, eventId: string, data: { notes_pre?: string | null; notes_post?: string | null }) {
  const sb = await supabaseServer();
  const { error } = await sb
    .from("events")
    .update({
      notes_pre: data.notes_pre ?? null,
      notes_post: data.notes_post ?? null,
    })
    .eq("id", eventId)
    .eq("team_id", teamId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/teams/${teamId}/events/${eventId}`);
  return { ok: true };
}

type AttRow = {
  player_id: string;
  status: "present" | "late" | "injured" | "absent";
  rpe?: number | null;
  comment?: string | null;
};

export async function upsertAttendanceBulk(teamId: string, eventId: string, rows: AttRow[]) {
  const sb = await supabaseServer();

  // Build upserts
  const payload = rows.map(r => ({
    event_id: eventId,
    player_id: r.player_id,
    status: r.status,
    rpe: r.rpe ?? null,
    comment: (r.comment ?? "") || null,
  }));

  const { error } = await sb.from("attendance").upsert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${teamId}/events/${eventId}`);
  return { ok: true };
}
