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

export async function upsertAvailability(eventId: string, status: "coming" | "maybe" | "out") {
    const sb = await supabaseServer();
    const { user, player } = await getMe();
    if (!user || !player) return { ok: false, error: "Not linked to a player." };
  
    // Get the event's team to ensure team_id is correct
    const { data: evt, error: evtErr } = await sb
      .from("events")
      .select("team_id")
      .eq("id", eventId)
      .maybeSingle();
  
    if (evtErr || !evt) return { ok: false, error: "Event not found." };
    // (Optional) safety: make sure the player belongs to this team
    if (evt.team_id !== player.team_id) {
      return { ok: false, error: "This event is not for your team." };
    }
  
    const { error } = await sb.from("availability").upsert({
      team_id: evt.team_id,
      event_id: eventId,
      player_id: player.id,
      status,
    });
  
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

export async function updateMyInfo(form: {
    date_of_birth?: string | null;
    preferred_foot?: "left" | "right" | "both" | null | string;
    contact_email?: string | null;
    contact_phone?: string | null;
    guardian_name?: string | null;
    guardian_phone?: string | null;
    emergency_notes?: string | null;
  }) {
    const sb = await supabaseServer();
    const me = await getMe();
    if (!me.player) return { ok: false, error: "Not linked to a player." };
  
    // ensure a row exists (insert is allowed by policy below; otherwise this step may fail)
    const { data: existing } = await sb
      .from("player_profiles")
      .select("id")
      .eq("player_id", me.player.id)
      .maybeSingle();
  
    if (!existing) {
      const { error: insErr } = await sb.from("player_profiles").insert({
        player_id: me.player.id,
        team_id: me.player.team_id,
      });
      if (insErr) {
        // If insert blocked by RLS, return a friendly message
        return { ok: false, error: "Profile not initialized. Ask your coach to create your profile." };
      }
    }
  
    const { error } = await sb
      .from("player_profiles")
      .update({
        date_of_birth: form.date_of_birth ?? null,
        preferred_foot: (form.preferred_foot as any) ?? null,
        contact_email: form.contact_email ?? null,
        contact_phone: form.contact_phone ?? null,
        guardian_name: form.guardian_name ?? null,
        guardian_phone: form.guardian_phone ?? null,
        emergency_notes: form.emergency_notes ?? null,
        // positions/strengths/weaknesses intentionally NOT updated here (coach-only)
      })
      .eq("player_id", me.player.id);
  
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  
