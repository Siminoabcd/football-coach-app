"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

// For CREATE (no id)
const CreateSchema = z.object({
  team_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  position: z.string().optional().nullable(),
  jersey: z.string().optional().nullable(),
});

// For UPDATE (requires id)
const UpdateSchema = CreateSchema.extend({
  id: z.string().uuid(),
});

export async function createPlayer(formData: FormData) {
  const parsed = CreateSchema.safeParse({
    team_id: formData.get("team_id"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    position: (formData.get("position") as string) || null,
    jersey: (formData.get("jersey") as string) || null,
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
      position: parsed.data.position,
      jersey: parsed.data.jersey,
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
