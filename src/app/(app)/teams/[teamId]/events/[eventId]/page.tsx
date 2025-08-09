import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import UpdateNotes from "./update-notes";

export default async function EventDetail({ params }: { params: { teamId: string, eventId: string } }) {
  const sb = await supabaseServer();
  const { data: event } = await sb
    .from("events")
    .select("*")
    .eq("id", params.eventId)
    .eq("team_id", params.teamId)
    .single();

  if (!event) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold capitalize">{event.type} {event.title ? `· ${event.title}` : ""}</h3>
        <div className="text-sm text-muted-foreground">{event.date} {event.start_time ?? ""}</div>
      </div>
      <UpdateNotes teamId={params.teamId} eventId={params.eventId} notesPre={event.notes_pre ?? ""} notesPost={event.notes_post ?? ""} />
    </div>
  );
}
