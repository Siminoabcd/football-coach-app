import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import UpdateNotes from "./update-notes";
import AttendanceTable from "./attendance-table";
import PerformanceTable from "./performance-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditEventDialog from "./event-edit";
import { deleteEvent } from "../actions";

export default async function EventDetail(
  { params }: { params: Promise<{ teamId: string; eventId: string }> }
) {
  const { teamId, eventId } = await params;      // ✅ await params
  const sb = await supabaseServer();

  // Event
  const { data: event } = await sb
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("team_id", teamId)
    .single();

  if (!event) notFound();

  // Players in team
  const { data: players } = await sb
    .from("players")
    .select("id,first_name,last_name")
    .eq("team_id", teamId)
    .order("last_name");

  // Attendance for this event
  const { data: attendance } = await sb
    .from("attendance")
    .select("*")
    .eq("event_id", eventId);

  // Performance stats for this event
  const { data: perf } = await sb
    .from("performance_stats")
    .select("player_id,goals,assists,minutes_played,rating,notes")
    .eq("event_id", eventId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold capitalize">
            {event.type} {event.title ? `· ${event.title}` : ""}
          </h3>
          <div className="text-sm text-muted-foreground">
            {event.date} {event.start_time ?? ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EditEventDialog
            teamId={teamId}
            event={{
              id: event.id,
              type: event.type,
              date: event.date,
              start_time: event.start_time,
              title: event.title,
            }}
          />

          {/* Delete → redirect back to events list */}
          <form
            action={async () => {
              "use server";
              await deleteEvent(teamId, eventId);
              redirect(`/teams/${teamId}/events`);
            }}
          >
            <Button variant="destructive" type="submit">Delete</Button>
          </form>
        </div>
      </div>

      {/* Notes */}
      <UpdateNotes
        teamId={teamId}
        eventId={eventId}
        notesPre={event.notes_pre ?? ""}
        notesPost={event.notes_post ?? ""}
      />

      {/* Attendance */}
      <AttendanceTable
        teamId={teamId}
        eventId={eventId}
        players={players ?? []}
        existing={attendance ?? []}
      />

      {/* Performance stats */}
      <PerformanceTable
        teamId={teamId}
        eventId={eventId}
        players={players ?? []}
        existing={perf ?? []}
      />

      {/* Back link */}
      <div>
        <Link href={`/teams/${teamId}/events`} className="underline">
          ← Back to events
        </Link>
      </div>
    </div>
  );
}
