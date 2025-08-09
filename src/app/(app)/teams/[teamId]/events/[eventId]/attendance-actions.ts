"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

export async function saveAttendance(teamId: string, eventId: string, rows: any[]) {
  const sb = await supabaseServer();

  const payload = rows.map(r => ({
    event_id: eventId,
    player_id: r.player_id,
    status: r.status,
    rpe: r.rpe ? Number(r.rpe) : null,
    comment: r.comment || null,
  }));

  const { error } = await sb
    .from("attendance")
    .upsert(payload, { onConflict: "event_id,player_id" });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${teamId}/events/${eventId}`);
  return { ok: true };
}
