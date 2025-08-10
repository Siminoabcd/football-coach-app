import { supabaseServer } from "@/lib/supabase-server";

export async function getEventDrills(eventId: string) {
  const sb = await supabaseServer();
  const { data: links } = await sb
    .from("event_drills")
    .select("drill_id,order_index")
    .eq("event_id", eventId)
    .order("order_index", { ascending: true });

  if (!links?.length) return [];

  const ids = links.map(l => l.drill_id);
  const { data: drills } = await sb
    .from("drills")
    .select("id,title,category,age_group,difficulty,duration_min,objective,equipment")
    .in("id", ids);

  const map = new Map(drills?.map(d => [d.id, d]));
  return links
    .map(l => ({ ...map.get(l.drill_id)!, order_index: l.order_index }))
    .filter(Boolean);
}
