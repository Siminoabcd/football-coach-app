"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function attachDrillsToEvent(teamId: string, eventId: string, drillIds: string[]) {
  const sb = await supabaseServer();
  // Fetch current max order_index
  const { data: existing } = await sb
    .from("event_drills")
    .select("order_index")
    .eq("event_id", eventId)
    .order("order_index", { ascending: false })
    .limit(1);

  let start = existing?.[0]?.order_index ?? -1;
  const rows = drillIds.map((id) => ({ event_id: eventId, drill_id: id, order_index: ++start }));

  const { error } = await sb.from("event_drills").upsert(rows, { onConflict: "event_id,drill_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${teamId}/events/${eventId}`);
  return { ok: true };
}

export async function reorderEventDrills(teamId: string, eventId: string, orderedDrillIds: string[]) {
  const sb = await supabaseServer();
  const updates = orderedDrillIds.map((id, idx) => ({ event_id: eventId, drill_id: id, order_index: idx }));
  // Upsert one-by-one to avoid PostgREST bulk mishaps with composite PK
  for (const u of updates) {
    const { error } = await sb.from("event_drills").update({ order_index: u.order_index })
      .eq("event_id", eventId).eq("drill_id", u.drill_id);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/teams/${teamId}/events/${eventId}`);
  return { ok: true };
}

export async function removeDrillFromEvent(teamId: string, eventId: string, drillId: string) {
  const sb = await supabaseServer();
  const { error } = await sb.from("event_drills").delete().eq("event_id", eventId).eq("drill_id", drillId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/teams/${teamId}/events/${eventId}`);
  return { ok: true };
}
