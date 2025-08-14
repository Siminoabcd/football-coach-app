import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { getMe, upsertAvailability } from "../actions";
import RsvpList from "./rsvp-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Status = "coming" | "maybe" | "out";

export default async function MyCalendar() {
  const sb = await supabaseServer();
  const { user, player } = await getMe();
  if (!user) redirect("/login");
  if (!player) {
    return <p className="text-sm text-muted-foreground">Ask your coach to link your account to a player.</p>;
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: events, error: eventsErr } = await sb
    .from("events")
    .select("id,title,type,date,start_time")
    .eq("team_id", player.team_id)
    .gte("date", today)
    .order("date", { ascending: true });

  if (eventsErr) {
    return <pre className="text-xs text-red-600 whitespace-pre-wrap">Events error: {eventsErr.message}</pre>;
  }

  const { data: avail, error: availErr } = await sb
    .from("availability")
    .select("event_id,status")
    .eq("player_id", player.id);

  if (availErr) {
    return <pre className="text-xs text-red-600 whitespace-pre-wrap">Availability error: {availErr.message}</pre>;
  }

  const initialStatuses = Object.fromEntries(
    (avail ?? []).map(a => [a.event_id, a.status as Status])
  ) as Record<string, Status | undefined>;

  // Pass the server action down – the client component will call it and update optimistically
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Upcoming events</h3>
      <RsvpList
        events={(events ?? []).map(e => ({
          id: e.id,
          title: e.title || e.type,
          date: String(e.date),
          start_time: e.start_time ?? null,
        }))}
        initialStatuses={initialStatuses}
        onSet={upsertAvailability}
      />
    </div>
  );
}
