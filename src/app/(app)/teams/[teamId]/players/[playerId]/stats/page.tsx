import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import Sparkline from "@/components/sparkline";

type PerfRow = {
  event_id: string;
  goals: number | null;
  assists: number | null;
  minutes_played: number | null;
  rating: number | null;
  notes: string | null;
};

export default async function PlayerStatsPage(
  { params }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  const { teamId, playerId } = await params;
  const sb = await supabaseServer();

  // Guard: player exists in team
  const { data: player } = await sb
    .from("players")
    .select("id,first_name,last_name,position,jersey")
    .eq("id", playerId)
    .eq("team_id", teamId)
    .single();
  if (!player) notFound();

  // Performance rows
  const { data: perf } = await sb
    .from("performance_stats")
    .select("event_id,goals,assists,minutes_played,rating,notes,updated_at")
    .eq("team_id", teamId)
    .eq("player_id", playerId);

  const perfRows: PerfRow[] = perf ?? [];

  // Attendance rows
  const { data: attend } = await sb
    .from("attendance")
    .select("event_id,status,rpe")
    .eq("player_id", playerId);

  // Events metadata for those perf rows
  const eventIds = Array.from(new Set(perfRows.map(r => r.event_id)));
  let eventsMap = new Map<string, { date: string; title: string | null; type: string; start_time: string | null }>();
  if (eventIds.length) {
    const { data: events } = await sb
      .from("events")
      .select("id,date,start_time,title,type")
      .in("id", eventIds);
    (events ?? []).forEach(e => eventsMap.set(e.id, { date: e.date, start_time: e.start_time, title: e.title, type: e.type }));
  }

  // Aggregates
  const totals = perfRows.reduce(
    (acc, r) => {
      acc.goals += r.goals ?? 0;
      acc.assists += r.assists ?? 0;
      acc.minutes += r.minutes_played ?? 0;
      if (typeof r.rating === "number") { acc.ratingSum += r.rating; acc.ratingCount += 1; }
      return acc;
    },
    { goals: 0, assists: 0, minutes: 0, ratingSum: 0, ratingCount: 0 }
  );
  const avgRating = totals.ratingCount ? (totals.ratingSum / totals.ratingCount) : null;

  const totalAttend = (attend ?? []).length;
  const attended = (attend ?? []).filter(a => a.status === "present" || a.status === "late").length;
  const attendancePct = totalAttend ? Math.round((attended / totalAttend) * 100) : null;

  const rpeVals = (attend ?? []).map(a => a.rpe).filter((x): x is number => typeof x === "number");
  const avgRpe = rpeVals.length ? (rpeVals.reduce((s, v) => s + v, 0) / rpeVals.length) : null;

  // Rating trend
  const ratingSeries = [...perfRows]
    .map(r => ({ date: eventsMap.get(r.event_id)?.date ?? "", value: r.rating }))
    .filter(p => typeof p.value === "number" && p.date)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const ratingValues = ratingSeries.map(p => Number(p.value));
  const firstDate = ratingSeries[0]?.date ?? null;
  const lastDate = ratingSeries[ratingSeries.length - 1]?.date ?? null;

  // Recent performances
  const recent = [...perfRows].sort((a, b) => {
    const ea = eventsMap.get(a.event_id)?.date ?? "";
    const eb = eventsMap.get(b.event_id)?.date ?? "";
    return ea < eb ? 1 : ea > eb ? -1 : 0;
  }).slice(0, 8);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-end gap-3">
            <a href={`/api/teams/${teamId}/players/${playerId}/export/performance`} className="text-sm underline">
                Export performance CSV
            </a>
            <a href={`/api/teams/${teamId}/players/${playerId}/export/attendance`} className="text-sm underline">
                Export attendance CSV
            </a>
        </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">Goals</div>
          <div className="text-2xl font-semibold">{totals.goals}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">Assists</div>
          <div className="text-2xl font-semibold">{totals.assists}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">Minutes</div>
          <div className="text-2xl font-semibold">{totals.minutes}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">Avg rating</div>
          <div className="text-2xl font-semibold">{avgRating?.toFixed(1) ?? "—"}</div>
        </div>
      </div>

      {/* Attendance & RPE */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">Attendance</div>
          <div className="text-2xl font-semibold">{attendancePct !== null ? `${attendancePct}%` : "—"}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">Avg RPE</div>
          <div className="text-2xl font-semibold">{avgRpe ? avgRpe.toFixed(1) : "—"}</div>
        </div>
      </div>

      {/* Rating trend */}
      {ratingValues.length > 0 && (
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Rating trend</div>
            <div className="text-xs text-muted-foreground">
              {firstDate} → {lastDate}
            </div>
          </div>
          <Sparkline values={ratingValues} width={320} height={48} strokeWidth={2} ariaLabel="Player rating trend over time" />
          <div className="text-xs text-muted-foreground">
            min {Math.min(...ratingValues).toFixed(1)} · max {Math.max(...ratingValues).toFixed(1)}
          </div>
        </div>
      )}

      {/* Recent performances */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Recent performances</h3>
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">No performance data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Event</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">G</th>
                  <th className="p-2">A</th>
                  <th className="p-2">Min</th>
                  <th className="p-2">Rating</th>
                  <th className="p-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const ev = eventsMap.get(r.event_id);
                  const label = ev ? (ev.title || ev.type) : "Event";
                  return (
                    <tr key={r.event_id} className="border-t">
                      <td className="p-2">
                        <Link className="underline" href={`/teams/${teamId}/events/${r.event_id}`}>
                          {label}
                        </Link>
                      </td>
                      <td className="p-2">{ev?.date ?? "—"}</td>
                      <td className="p-2 text-center">{r.goals ?? "—"}</td>
                      <td className="p-2 text-center">{r.assists ?? "—"}</td>
                      <td className="p-2 text-center">{r.minutes_played ?? "—"}</td>
                      <td className="p-2 text-center">{r.rating ?? "—"}</td>
                      <td className="p-2">{r.notes ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
