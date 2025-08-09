import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import UpdateNotes from "./update-notes";
import AttendanceTable from "./attendance-table";

export default async function EventDetail({ params }: { params: { teamId: string, eventId: string } }) {
  const sb = await supabaseServer();
  
  const { data: event } = await sb
    .from("events")
    .select("*")
    .eq("id", params.eventId)
    .eq("team_id", params.teamId)
    .single();

  if (!event) notFound();

  // Get players
  const { data: players } = await sb
    .from("players")
    .select("id,first_name,last_name")
    .eq("team_id", params.teamId)
    .order("last_name");

  // Get attendance
  const { data: attendance } = await sb
    .from("attendance")
    .select("*")
    .eq("event_id", params.eventId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold capitalize">{event.type} {event.title ? `· ${event.title}` : ""}</h3>
        <div className="text-sm text-muted-foreground">{event.date} {event.start_time ?? ""}</div>
      </div>

      <UpdateNotes
        teamId={params.teamId}
        eventId={params.eventId}
        notesPre={event.notes_pre ?? ""}
        notesPost={event.notes_post ?? ""}
      />

      <AttendanceTable
        teamId={params.teamId}
        eventId={params.eventId}
        players={players ?? []}
        existing={attendance ?? []}
      />
    </div>
  );
}
