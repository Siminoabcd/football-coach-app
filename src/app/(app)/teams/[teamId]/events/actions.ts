"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

// CREATE: no id required
const CreateEventSchema = z.object({
  team_id: z.string().uuid(),
  type: z.enum(["training", "game", "other"]),
  date: z.string().min(1),                 // yyyy-mm-dd
  start_time: z.string().optional().nullable(), // HH:mm or null
  title: z.string().optional().nullable(),
});

// UPDATE: requires id
const UpdateEventSchema = CreateEventSchema.extend({
  id: z.string().uuid(),
});

export async function createEvent(formData: FormData) {
  const parsed = CreateEventSchema.safeParse({
    team_id: formData.get("team_id"),
    type: formData.get("type"),
    date: formData.get("date"),
    start_time: (formData.get("start_time") as string) || null,
    title: (formData.get("title") as string) || null,
  });
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const sb = await supabaseServer();
  const { error } = await sb.from("events").insert(parsed.data);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${parsed.data.team_id}/events`);
  return { ok: true };
}

export async function updateEvent(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = UpdateEventSchema.safeParse({
    ...data,
    start_time: data.start_time || null,
    title: data.title || null,
  });
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const sb = await supabaseServer();
  const { error } = await sb
    .from("events")
    .update({
      type: parsed.data.type,
      date: parsed.data.date,
      start_time: parsed.data.start_time,
      title: parsed.data.title,
    })
    .eq("id", parsed.data.id)
    .eq("team_id", parsed.data.team_id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teams/${parsed.data.team_id}/events/${parsed.data.id}`);
  revalidatePath(`/teams/${parsed.data.team_id}/events`);
  return { ok: true };
}

export async function deleteEvent(teamId: string, eventId: string) {
  const sb = await supabaseServer();
  const { error } = await sb.from("events").delete().eq("id", eventId).eq("team_id", teamId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/teams/${teamId}/events`);
  return { ok: true };
}
