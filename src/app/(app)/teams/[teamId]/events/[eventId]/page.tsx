import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import UpdateNotes from "./update-notes";
import AttendanceTable from "./attendance-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditEventDialog from "./event-edit";
import { deleteEvent } from "../actions";

export default async function EventDetail({
  params,
}: { params: { teamId: string; eventId: string } }) {
  const sb = await supabaseServer();

  const { data: event } = await sb
    .from("events")
    .select("*")
    .eq("id", params.eventId)
    .eq("team_id", params.teamId)
    .single();

  if (!event) notFound();

  const { data: players } = await sb
    .from("players")
    .select("id,first_name,last_name")
    .eq("team_id", params.teamId)
    .order("last_name");

  const { data: attendance } = await sb
    .from("attendance")
    .select("*")
    .eq("event_id", params.eventId);

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
            teamId={params.teamId}
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
              await deleteEvent(params.teamId, params.eventId);
              redirect(`/teams/${params.teamId}/events`);
            }}
          >
            <Button variant="destructive" type="submit">Delete</Button>
          </form>
        </div>
      </div>

      {/* Notes */}
      <UpdateNotes
        teamId={params.teamId}
        eventId={params.eventId}
        notesPre={event.notes_pre ?? ""}
        notesPost={event.notes_post ?? ""}
      />

      {/* Attendance */}
      <AttendanceTable
        teamId={params.teamId}
        eventId={params.eventId}
        players={players ?? []}
        existing={attendance ?? []}
      />

      {/* Back link (optional) */}
      <div>
        <Link href={`/teams/${params.teamId}/events`} className="underline">
          ← Back to events
        </Link>
      </div>
    </div>
  );
}
