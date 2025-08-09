"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase-server";

const Row = z.object({
  player_id: z.string().uuid(),
  goals: z.coerce.number().int().min(0).optional().nullable(),
  assists: z.coerce.number().int().min(0).optional().nullable(),
  minutes_played: z.coerce.number().int().min(0).optional().nullable(),
  rating: z.coerce.number().min(0).max(10).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function savePerformanceStats(
  teamId: string,
  eventId: string,
  rows: unknown
) {
  const parsed =
    z.array(Row).safeParse(rows);

  if (!parsed.success) {
    return { ok: false, error: "Invalid data" };
  }

  const sb = await supabaseServer();

  const payload = parsed.data.map((r) => ({
    team_id: teamId,
    event_id: eventId,
    player_id: r.player_id,
    goals: r.goals ?? null,
    assists: r.assists ?? null,
    minutes_played: r.minutes_played ?? null,
    rating: r.rating ?? null,
    notes: r.notes ?? null,
  }));

  const { error } = await sb
    .from("performance_stats")
    .upsert(payload, { onConflict: "event_id,player_id" });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${teamId}/events/${eventId}`);
  return { ok: true };
}
