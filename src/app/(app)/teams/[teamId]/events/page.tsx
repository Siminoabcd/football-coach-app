import { supabaseServer } from "@/lib/supabase-server";
import NewEventDialog from "./event-new";
import Link from "next/link";

export default async function EventsPage({ params }: { params: { teamId: string } }) {
  const sb = await supabaseServer();
  const { data: events } = await sb
    .from("events")
    .select("id,type,date,start_time,title,created_at")
    .eq("team_id", params.teamId)
    .order("date", { ascending: true });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Events</h3>
        <NewEventDialog teamId={params.teamId} />
      </div>

      {!events?.length ? (
        <p className="text-muted-foreground">No events yet. Add training or a game.</p>
      ) : (
        <ul className="space-y-2">
          {events!.map(e => (
            <li key={e.id} className="border rounded p-3">
              <Link href={`/teams/${params.teamId}/events/${e.id}`} className="flex justify-between">
                <span className="capitalize">{e.type}{e.title ? `: ${e.title}` : ""}</span>
                <span className="text-sm text-muted-foreground">{e.date} {e.start_time ?? ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
