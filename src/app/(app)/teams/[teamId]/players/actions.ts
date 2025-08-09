"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

const UpdateSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  position: z.string().optional(),
  jersey: z.string().optional(),
});

export async function createPlayer(formData: FormData) {
  const parsed = UpdateSchema.safeParse({
    team_id: formData.get("team_id"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    position: formData.get("position") || undefined,
    jersey: formData.get("jersey") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const sb = await supabaseServer();
  const { error } = await sb.from("players").insert(parsed.data);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${parsed.data.team_id}/players`);
  return { ok: true };
}

export async function updatePlayer(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = UpdateSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const sb = await supabaseServer();
  const { error } = await sb
    .from("players")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      position: parsed.data.position || null,
      jersey: parsed.data.jersey || null,
    })
    .eq("id", parsed.data.id)
    .eq("team_id", parsed.data.team_id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/teams/${parsed.data.team_id}/players`);
  return { ok: true };
}

export async function deletePlayer(teamId: string, playerId: string) {
  const sb = await supabaseServer();
  const { error } = await sb.from("players").delete().eq("id", playerId).eq("team_id", teamId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/teams/${teamId}/players`);
  return { ok: true };
}