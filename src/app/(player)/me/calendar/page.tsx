import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { getMe, upsertAvailability } from "../actions";
import RsvpList from "./rsvp-list";
import SubscribeIcsReadOnly from "./subscribe-ics-readonly";

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

  // fetch the team for the ICS token + name
  const { data: team } = await sb
    .from("teams")
    .select("id, name, ics_token")
    .eq("id", player.team_id)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  const { data: events } = await sb
    .from("events")
    .select("id,title,type,date,start_time")
    .eq("team_id", player.team_id)
    .gte("date", today)
    .order("date", { ascending: true });

  const { data: avail } = await sb
    .from("availability")
    .select("event_id,status")
    .eq("player_id", player.id);

  const initialStatuses = Object.fromEntries(
    (avail ?? []).map(a => [a.event_id, a.status as Status])
  ) as Record<string, Status | undefined>;

  return (
    <div className="space-y-4">
      {/* Subscribe card (read-only for players) */}
      {team?.ics_token && (
        <SubscribeIcsReadOnly token={team.ics_token} teamName={team.name ?? "Team"} />
      )}

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
