import { supabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export default async function PrintSession(
  { params }: { params: Promise<{ teamId: string; eventId: string }> }
) {
  const { teamId, eventId } = await params;
  const sb = await supabaseServer();

  const { data: event } = await sb
    .from("events")
    .select("id,date,start_time,title,type,team_id")
    .eq("id", eventId).eq("team_id", teamId).single();
  if (!event) notFound();

  const { data: links } = await sb
    .from("event_drills")
    .select("drill_id,order_index")
    .eq("event_id", eventId)
    .order("order_index");
  const ids = (links ?? []).map(l => l.drill_id);
  const { data: drills } = ids.length
    ? await sb.from("drills").select("id,title,duration_min,setup,instructions,coaching_points,equipment").in("id", ids)
    : { data: [] as any[] };

  // order by index
  const order = new Map(links?.map(l => [l.drill_id, l.order_index]));
  const ordered = (drills ?? []).sort((a,b) => (order.get(a.id)! - order.get(b.id)!));

  return (
    <div className="p-6 print:p-0 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Session plan: {event.title || event.type}</h2>
        <div className="text-sm text-muted-foreground">{event.date} {event.start_time ?? ""}</div>
      </div>
      <hr className="print:my-2" />

      <ol className="space-y-4">
        {ordered.map((d, i) => (
          <li key={d.id} className="break-inside-avoid">
            <div className="font-medium">{i + 1}. {d.title} {d.duration_min != null ? <span className="text-muted-foreground text-sm">· {d.duration_min} min</span> : null}</div>
            {d.equipment?.length ? (
              <div className="text-xs text-muted-foreground mt-1">Equipment: {d.equipment.join(", ")}</div>
            ) : null}
            {d.setup && <p className="text-sm mt-1 whitespace-pre-wrap"><span className="font-medium">Setup:</span> {d.setup}</p>}
            {d.instructions && <p className="text-sm mt-1 whitespace-pre-wrap"><span className="font-medium">Instructions:</span> {d.instructions}</p>}
            {d.coaching_points && <p className="text-sm mt-1 whitespace-pre-wrap"><span className="font-medium">Coaching points:</span> {d.coaching_points}</p>}
          </li>
        ))}
        {!ordered.length && <p className="text-sm text-muted-foreground">No drills attached.</p>}
      </ol>

      <style>{`@media print { @page { margin: 12mm; } hr{border:0;border-top:1px solid #ddd} }`}</style>
    </div>
  );
}
