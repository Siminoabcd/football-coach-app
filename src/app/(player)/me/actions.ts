"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

export async function getMe() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, player: null, teams: [] as any[] };

  const { data: player } = await sb
    .from("players")
    .select("id, team_id, first_name, last_name, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let teams: any[] = [];
  if (player?.team_id) {
    const r = await sb.from("teams").select("id,name").eq("id", player.team_id);
    teams = r.data ?? [];
  }
  return { user, player, teams };
}

export async function upsertAvailability(eventId: string, status: "coming"|"maybe"|"out", note?: string) {
  const sb = await supabaseServer();
  const me = await getMe();
  if (!me.player) return { ok: false, error: "Not linked to a player." };

  const { error } = await sb.from("availability").upsert({
    team_id: me.player.team_id,
    event_id: eventId,
    player_id: me.player.id,
    status,
    note: note ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/me/calendar");
  return { ok: true };
}

export async function updateMyInfo(form: {
  phone?: string; emergency_contact?: string; medical_notes?: string;
}) {
  const sb = await supabaseServer();
  const me = await getMe();
  if (!me.player) return { ok: false, error: "Not linked to a player." };

  await sb.from("player_profiles").upsert({ player_id: me.player.id });
  const { error } = await sb
    .from("player_profiles")
    .update({
      phone: form.phone ?? null,
      emergency_contact: form.emergency_contact ?? null,
      medical_notes: form.medical_notes ?? null,
    })
    .eq("player_id", me.player.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/me/info");
  return { ok: true };
}
