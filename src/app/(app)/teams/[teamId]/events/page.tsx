import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import NewEventDialog from "./event-new";
import EventsCalendar from "./events-calendar";

function TypeBadge({ type }: { type: "training" | "game" | "other" }) {
  const cls =
    type === "training"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : type === "game"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>
      {type}
    </span>
  );
}

export default async function EventsPage(
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;                 // ✅ await params
  const sb = await supabaseServer();

  const { data: events } = await sb
    .from("events")
    .select("id,type,date,start_time,title")
    .eq("team_id", teamId)                         // ✅ use var
    .order("date", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Events</h3>
        <NewEventDialog teamId={teamId} />         {/* ✅ use var */}
      </div>

      <EventsCalendar teamId={teamId} events={events ?? []} /> {/* ✅ use var */}

      <div className="space-y-2">
        <h4 className="font-medium">List</h4>
        {(!events || events.length === 0) ? (
          <p className="text-muted-foreground">No events yet. Add training or a game.</p>
        ) : (
          <ul className="space-y-2">
            {events!.map(e => (
              <li key={e.id} className="border rounded p-3">
                <Link
                  href={`/teams/${teamId}/events/${e.id}`}      // ✅ use var
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <TypeBadge type={e.type as any} />
                    <span className="capitalize">{e.title ? e.title : e.type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {e.date} {e.start_time ?? ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
