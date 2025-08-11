import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { getMe } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyAttendance() {
  const sb = await supabaseServer();
  const { user, player } = await getMe();
  if (!user) redirect("/login");
  if (!player) return <p className="text-sm text-muted-foreground">Not linked to a player yet.</p>;

  const { data: rows } = await sb
    .from("attendance")
    .select("event_id,status,rpe,comment")
    .eq("player_id", player.id)
    .order("event_id", { ascending: false });

  // Fetch event titles/dates for those rows (simple second query)
  const ids = Array.from(new Set((rows ?? []).map(r => r.event_id)));
  let eventsMap = new Map<string, { title: string|null; date: string|null }>();
  if (ids.length) {
    const { data: ev } = await sb.from("events").select("id,title,date").in("id", ids);
    eventsMap = new Map((ev ?? []).map(e => [e.id, { title: e.title, date: e.date }]));
  }

  return (
    <div className="space-y-3">
      {(rows ?? []).map((r: any) => {
        const ev = eventsMap.get(r.event_id) ?? { title: "Session", date: null };
        return (
          <div key={r.event_id} className="border rounded p-3">
            <div className="flex justify-between">
              <div className="font-medium">{ev.title ?? "Session"}</div>
              <div className="text-xs text-muted-foreground">{ev.date ?? ""}</div>
            </div>
            <div className="text-sm">Status: <b>{r.status}</b> • RPE: <b>{r.rpe ?? "—"}</b></div>
            {r.comment && <div className="text-sm mt-1">{r.comment}</div>}
          </div>
        );
      })}
      {!rows?.length && <p className="text-sm text-muted-foreground">No records yet.</p>}
    </div>
  );
}
