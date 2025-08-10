"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

const DrillSchema = z.object({
  id: z.string().uuid().optional(),
  team_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1),
  category: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  age_group: z.string().optional().nullable(),
  difficulty: z.enum(["Easy","Medium","Hard"]).optional().nullable(),
  duration_min: z.coerce.number().int().min(0).optional().nullable(),
  players_min: z.coerce.number().int().min(0).optional().nullable(),
  players_max: z.coerce.number().int().min(0).optional().nullable(),
  equipment: z.string().optional().nullable(), // comma-separated input; we'll split
  setup: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  coaching_points: z.string().optional().nullable(),
  progressions: z.string().optional().nullable(),
  visibility: z.enum(["private","team","public"]).default("private").optional(),
});

function splitEquipment(s?: string | null) {
  if (!s) return null;
  const arr = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return arr.length ? arr : null;
}

export async function createDrill(formData: FormData) {
  const parsed = DrillSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const p = parsed.data;
  const row = {
    team_id: p.team_id ?? null,
    title: p.title,
    category: p.category ?? null,
    objective: p.objective ?? null,
    age_group: p.age_group ?? null,
    difficulty: p.difficulty ?? null,
    duration_min: p.duration_min ?? null,
    players_min: p.players_min ?? null,
    players_max: p.players_max ?? null,
    equipment: splitEquipment(p.equipment),
    setup: p.setup ?? null,
    instructions: p.instructions ?? null,
    coaching_points: p.coaching_points ?? null,
    progressions: p.progressions ?? null,
    visibility: p.visibility ?? "private",
  };

  const sb = await supabaseServer();
  const { error } = await sb.from("drills").insert(row);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/drills");
  return { ok: true };
}

export async function updateDrill(id: string, formData: FormData) {
  const parsed = DrillSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Invalid data" };

  const p = parsed.data;
  const row = {
    team_id: p.team_id ?? null,
    title: p.title,
    category: p.category ?? null,
    objective: p.objective ?? null,
    age_group: p.age_group ?? null,
    difficulty: p.difficulty ?? null,
    duration_min: p.duration_min ?? null,
    players_min: p.players_min ?? null,
    players_max: p.players_max ?? null,
    equipment: splitEquipment(p.equipment),
    setup: p.setup ?? null,
    instructions: p.instructions ?? null,
    coaching_points: p.coaching_points ?? null,
    progressions: p.progressions ?? null,
    visibility: p.visibility ?? "private",
  };

  const sb = await supabaseServer();
  const { error } = await sb.from("drills").update(row).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/drills");
  revalidatePath(`/drills/${id}`);
  return { ok: true };
}

export async function deleteDrill(id: string) {
  const sb = await supabaseServer();
  const { error } = await sb.from("drills").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/drills");
  return { ok: true };
}
