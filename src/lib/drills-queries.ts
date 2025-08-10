import { supabaseServer } from "@/lib/supabase-server";
import type { Drill, DrillFilters, DrillMedia } from "./types/drills";

function applyFilters(q: any, f: DrillFilters) {
  if (f.category) q = q.eq("category", f.category);
  if (f.age_group) q = q.eq("age_group", f.age_group);
  if (f.difficulty) q = q.eq("difficulty", f.difficulty);
  if (f.visibility) q = q.eq("visibility", f.visibility);

  // text search (title/objective/coaching_points). Using ilike benefits from pg_trgm indexes.
  if (f.q && f.q.trim().length) {
    const like = `%${f.q.trim()}%`;
    q = q.or(`title.ilike.${like},objective.ilike.${like},coaching_points.ilike.${like}`);
  }

  // equipment contains ANY of provided items
  if (f.equipment?.length) {
    // PostgREST "overlap" operator: ?| for arrays (useful via RPC normally).
    // As a workaround, filter one-by-one with or: equipment.cs.{item} won’t work; prefer contains/contained.
    // Best simple: for each item, use contains array -> equipment.cs.{item}
    const orParts = f.equipment.map(e => `equipment.cs.{${e}}`);
    q = q.or(orParts.join(","));
  }

  // scope by team/personal
  if (typeof f.teamId === "string") {
    q = q.eq("team_id", f.teamId);
  } else if (f.createdByOnly) {
    // if you want only your personal drills (team_id is null and created_by = auth.uid())
    // NOTE: created_by = auth.uid() can’t be used directly here—RLS already enforces visibility;
    // we rely on the “private” + personal usage patterns from policies.
    q = q.is("team_id", null);
  }

  return q;
}

export async function listDrills(filters: DrillFilters) {
  const sb = await supabaseServer();
  let q = sb
    .from("drills")
    .select("*")
    .order("updated_at", { ascending: false });

  q = applyFilters(q, filters);

  if (typeof filters.limit === "number") q = q.limit(filters.limit);
  if (typeof filters.offset === "number") q = q.range(filters.offset, (filters.offset ?? 0) + (filters.limit ?? 20) - 1);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Drill[];
}

export async function getDrill(id: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb.from("drills").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data as Drill;
}

export async function getDrillMedia(drillId: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb.from("drill_media").select("*").eq("drill_id", drillId).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as DrillMedia[];
}
