import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import RSVPCounts from "./ui/rsvp-counts";
import NotesCard from "./ui/notes-card";
import AttendanceBulk from "./ui/attendance-bulk";
import EventDrills from "./ui/event-drills";
import { saveNotes, upsertAttendanceBulk } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventPage({ params }: { params: { teamId: string; eventId: string } }) {
  const { teamId, eventId } = params;
  const sb = await supabaseServer();

  // Ensure user is logged in
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // Load event
  const { data: event, error: evErr } = await sb
    .from("events")
    .select("id, team_id, type, title, date, start_time, notes_pre, notes_post")
    .eq("id", eventId)
    .eq("team_id", teamId)
    .maybeSingle();

  if (evErr || !event) {
    return <pre className="text-xs text-red-600 whitespace-pre-wrap">
      {evErr?.message || "Event not found"}
    </pre>;
  }

  // Players of team
  const { data: players } = await sb
    .from("players")
    .select("id, first_name, last_name")
    .eq("team_id", teamId)
    .order("last_name", { ascending: true });

  // Existing attendance for this event
  const { data: attRows } = await sb
    .from("attendance")
    .select("player_id,status,rpe,comment")
    .eq("event_id", eventId);

  // RSVP list
  const { data: rsvps } = await sb
    .from("availability")
    .select("player_id,status,updated_at")
    .eq("event_id", eventId);

  // Drill plan summary: count + total minutes
  const { data: drills } = await sb
    .from("event_drills")
    .select("drill_id, order_index, drills(duration_min)")
    .eq("event_id", eventId)
    .order("order_index", { ascending: true });

  const drillCount = drills?.length ?? 0;
  const totalMin = (drills ?? []).reduce((sum, d: any) => sum + Number(d.drills?.duration_min ?? 0), 0);

  // Attendance summary (present/late/injured/absent)
  const summary = { present: 0, late: 0, injured: 0, absent: 0 } as Record<string, number>;
  (attRows ?? []).forEach(r => { summary[r.status] = (summary[r.status] ?? 0) + 1; });

  // Server actions wrapped to bind params
  async function onSaveNotes(fd: FormData) {
    "use server";
    return await saveNotes(teamId, eventId, {
      notes_pre: (fd.get("notes_pre") as string) ?? null,
      notes_post: (fd.get("notes_post") as string) ?? null,
    });
  }
  async function onSaveAttendance(rows: any) {
    "use server";
    return await upsertAttendanceBulk(teamId, eventId, rows as any[]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize">
              {event.type}
            </span>
            <h1 className="text-xl font-semibold">{event.title || "Session"}</h1>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {String(event.date)} {event.start_time ?? ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RSVPCounts eventId={event.id} />
          {/* quick actions (placeholders hook into your other pages if any) */}
          <Button asChild variant="outline" size="sm">
            <a href={`#attendance`}>Record attendance</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`#drills`}>Add drills</a>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CardStat label="Drills" value={String(drillCount)} hint={`${totalMin} min`} />
        <CardStat label="Present" value={String(summary.present)} />
        <CardStat label="Late" value={String(summary.late)} />
        <CardStat label="Absent" value={String(summary.absent)} hint={summary.injured ? `Injured ${summary.injured}` : undefined} />
      </div>

      {/* Notes */}
      <NotesCard
        notesPre={event.notes_pre ?? null}
        notesPost={event.notes_post ?? null}
        onSave={onSaveNotes}
      />

      {/* Drills */}
      <section id="drills" className="space-y-3">
        <h3 className="font-medium">Drill plan</h3>
        <EventDrills teamId={teamId} eventId={eventId} />
      </section>

      {/* Attendance bulk editor */}
      <section id="attendance" className="space-y-3">
        <AttendanceBulk
          players={(players ?? []) as any}
          initialRows={(attRows ?? []) as any}
          onSave={onSaveAttendance}
        />
      </section>

      {/* RSVP list */}
      <section className="space-y-2">
        <h3 className="font-medium">RSVP</h3>
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="[&>th]:px-2 [&>th]:py-1">
                <th className="text-left">Player</th>
                <th>Status</th>
                <th className="text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {(rsvps ?? []).map((r: any) => {
                const p = (players ?? []).find(pl => pl.id === r.player_id);
                const name = p ? `${p.last_name} ${p.first_name}` : r.player_id;
                return (
                  <tr key={r.player_id} className="border-t [&>td]:px-2 [&>td]:py-2">
                    <td>{name}</td>
                    <td className="capitalize">{r.status}</td>
                    <td className="text-right text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {!rsvps?.length && (
                <tr className="border-t">
                  <td colSpan={3} className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No RSVPs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CardStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
