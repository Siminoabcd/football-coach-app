import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import StatsTable from "./stats-table";
import TeamRatingTrend from "./team-rating-trend";

export const dynamic = "force-dynamic";

export default async function TeamStatsPage(
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const sb = await supabaseServer();

  // Team (guard)
  const { data: team } = await sb
    .from("teams")
    .select("id,name,season")
    .eq("id", teamId)
    .single();
  if (!team) notFound();

  // Players
  const { data: players } = await sb
    .from("players")
    .select("id,first_name,last_name")
    .eq("team_id", teamId)
    .order("last_name");

  // All team events (used for attendance denominator)
  const { data: events } = await sb
    .from("events")
    .select("id,type,date")
    .eq("team_id", teamId);

  const eventIds = new Set((events ?? []).map(e => e.id));

  // Attendance for all players in team events
  const { data: attendance } = await sb
    .from("attendance")
    .select("player_id,event_id,status,rpe")
    .in("event_id", [...eventIds]);

  // Performance for all players in team
  const { data: perf } = await sb
    .from("performance_stats")
    .select("player_id,goals,assists,minutes_played,rating")
    .eq("team_id", teamId);

  // Build aggregates per player
  const attByPlayer = new Map<string, { total: number; presentLike: number; rpeSum: number; rpeCount: number }>();
  (attendance ?? []).forEach(a => {
    const m = attByPlayer.get(a.player_id) ?? { total: 0, presentLike: 0, rpeSum: 0, rpeCount: 0 };
    // count only team events
    if (eventIds.has(a.event_id)) {
      m.total += 1;
      if (a.status === "present" || a.status === "late") m.presentLike += 1;
      if (typeof a.rpe === "number") { m.rpeSum += a.rpe; m.rpeCount += 1; }
    }
    attByPlayer.set(a.player_id, m);
  });

  const perfByPlayer = new Map<string, { g: number; a: number; min: number; ratingSum: number; ratingCount: number }>();
  (perf ?? []).forEach(p => {
    const m = perfByPlayer.get(p.player_id) ?? { g: 0, a: 0, min: 0, ratingSum: 0, ratingCount: 0 };
    m.g += p.goals ?? 0;
    m.a += p.assists ?? 0;
    m.min += p.minutes_played ?? 0;
    if (typeof p.rating === "number") { m.ratingSum += Number(p.rating); m.ratingCount += 1; }
    perfByPlayer.set(p.player_id, m);
  });

  const rows = (players ?? []).map(p => {
    const att = attByPlayer.get(p.id) ?? { total: 0, presentLike: 0, rpeSum: 0, rpeCount: 0 };
    const per = perfByPlayer.get(p.id) ?? { g: 0, a: 0, min: 0, ratingSum: 0, ratingCount: 0 };
    const attendancePct = att.total ? Math.round((att.presentLike / att.total) * 100) : null;
    const avgRpe = att.rpeCount ? att.rpeSum / att.rpeCount : null;
    const avgRating = per.ratingCount ? per.ratingSum / per.ratingCount : null;

    return {
      player_id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      attendancePct,
      avgRpe,
      avgRating,
      goals: per.g,
      assists: per.a,
      minutes: per.min,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Team stats</h3>
        <p className="text-sm text-muted-foreground">
          {team.name} · {team.season ?? "Season"}
        </p>
      </div>
      <div className="flex items-center justify-end">
        <a href={`/api/teams/${teamId}/export/stats`} className="text-sm underline">
            Export team stats CSV
        </a>
      </div>
    

      <TeamRatingTrend teamId={teamId} />

      <StatsTable teamId={teamId} rows={rows} />
    </div>
  );
}
