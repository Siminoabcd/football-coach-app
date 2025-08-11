import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { getMe, upsertAvailability } from "../actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyCalendar() {
  const sb = await supabaseServer();
  const { user, player } = await getMe();
  if (!user) redirect("/login");
  if (!player) return <p className="text-sm text-muted-foreground">Ask your coach to link your account to a player.</p>;

  const { data: events } = await sb
    .from("events")
    .select("id,title,type,date,start_time")
    .eq("team_id", player.team_id)
    .gte("date", new Date().toISOString().slice(0,10))
    .order("date", { ascending: true });

  const { data: avail } = await sb
    .from("availability")
    .select("event_id,status,note")
    .eq("player_id", player.id);

  const amap = new Map((avail ?? []).map(a => [a.event_id, a]));

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Upcoming events</h3>
      <div className="space-y-2">
        {(events ?? []).map(e => {
          const a = amap.get(e.id);
          return (
            <div key={e.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{e.title || e.type}</div>
                <div className="text-xs text-muted-foreground">{e.date} {e.start_time ?? ""}</div>
                <div className="text-xs">RSVP: <b>{a?.status ?? "—"}</b></div>
              </div>
              <div className="flex gap-2">
                <form action={async () => { "use server"; await upsertAvailability(e.id, "coming"); }}>
                  <Button variant={a?.status==="coming" ? "default":"outline"} size="sm">Coming</Button>
                </form>
                <form action={async () => { "use server"; await upsertAvailability(e.id, "maybe"); }}>
                  <Button variant={a?.status==="maybe" ? "default":"outline"} size="sm">Maybe</Button>
                </form>
                <form action={async () => { "use server"; await upsertAvailability(e.id, "out"); }}>
                  <Button variant={a?.status==="out" ? "default":"outline"} size="sm">Out</Button>
                </form>
              </div>
            </div>
          );
        })}
        {(!events || events.length === 0) && (
          <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
        )}
      </div>
    </div>
  );
}
