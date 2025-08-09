"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

const Schema = z.object({
  team_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  position: z.string().optional(),
  jersey: z.string().optional(),
});

export async function createPlayer(formData: FormData) {
  const parsed = Schema.safeParse({
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
