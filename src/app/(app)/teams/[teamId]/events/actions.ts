"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

const Schema = z.object({
  team_id: z.string().uuid(),
  type: z.enum(["training","game","other"]),
  date: z.string().min(1),       // ISO yyyy-mm-dd
  start_time: z.string().optional(), // HH:mm
  title: z.string().optional(),
});

export async function createEvent(formData: FormData) {
  const parsed = Schema.safeParse({
    team_id: formData.get("team_id"),
    type: formData.get("type"),
    date: formData.get("date"),
    start_time: (formData.get("start_time") || undefined) as string | undefined,
    title: (formData.get("title") || undefined) as string | undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const sb = await supabaseServer();
  const { error } = await sb.from("events").insert(parsed.data);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${parsed.data.team_id}/events`);
  return { ok: true };
}
