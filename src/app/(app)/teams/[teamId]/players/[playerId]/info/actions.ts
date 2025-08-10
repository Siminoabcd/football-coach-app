"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

const Schema = z.object({
  team_id: z.string().uuid(),
  player_id: z.string().uuid(),
  date_of_birth: z.string().optional().nullable(),         // yyyy-mm-dd
  preferred_foot: z.enum(["left","right","both"]).optional().nullable(),
  positions: z.string().optional().nullable(),             // comma separated -> text[]
  strengths: z.string().optional().nullable(),
  weaknesses: z.string().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  guardian_name: z.string().optional().nullable(),
  guardian_phone: z.string().optional().nullable(),
  emergency_notes: z.string().optional().nullable(),
});

export async function upsertPlayerProfile(formData: FormData) {
  const plain = Object.fromEntries(formData);
  const parsed = Schema.safeParse(plain);
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const p = parsed.data;
  const positions = (p.positions ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const row = {
    team_id: p.team_id,
    player_id: p.player_id,
    date_of_birth: p.date_of_birth || null,
    preferred_foot: p.preferred_foot || null,
    positions: positions.length ? positions : null,
    strengths: p.strengths || null,
    weaknesses: p.weaknesses || null,
    contact_email: p.contact_email || null,
    contact_phone: p.contact_phone || null,
    guardian_name: p.guardian_name || null,
    guardian_phone: p.guardian_phone || null,
    emergency_notes: p.emergency_notes || null,
  };

  const sb = await supabaseServer();
  const { error } = await sb
    .from("player_profiles")
    .upsert(row, { onConflict: "player_id" });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${p.team_id}/players/${p.player_id}`);
  return { ok: true };
}
