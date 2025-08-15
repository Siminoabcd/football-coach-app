"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const TeamSchema = z.object({
  name: z.string().min(2),
  season: z.string().optional(),
  color: z.string().optional(),
});

export async function createTeam(formData: FormData) {
  const parsed = TeamSchema.safeParse({
    name: formData.get("name"),
    season: formData.get("season") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await sb.from("teams").insert({
    name: parsed.data.name,
    season: parsed.data.season,
    color: parsed.data.color ?? "slate",
    created_by: user.id,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/teams");
  return { ok: true };
}

export async function deleteTeam(teamId: string) {
  const sb = await supabaseServer();

  const { error } = await sb.rpc("delete_team", { _team_id: teamId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/teams");
  return { ok: true };
}