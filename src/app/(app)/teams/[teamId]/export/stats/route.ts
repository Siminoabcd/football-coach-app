import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const sb = await supabaseServer();

  const [{ data: players }, { data: events }, { data: attendance }, { data: perf }] =
    await Promise.all([
      sb.from("players").select("id,first_name,last_name").eq("team_id", teamId),
      sb.from("events").select("id").eq("team_id", teamId),
      sb.from("attendance").select("player_id,event_id,status,rpe"),
      sb.from("performance_stats").select("player_id,goals,assists,minutes_played,rating").eq("team_id", teamId),
    ]);

  const eventIds = new Set((events ?? []).map(e => e.id));

  // Attendance aggregates
  const att = new Map<string, { total: number; presentLike: number; rpeSum: number; rpeCount: number }>();
  (attendance ?? []).forEach(a => {
    if (!eventIds.has(a.event_id)) return;
    const m = att.get(a.player_id) ?? { total: 0, presentLike: 0, rpeSum: 0, rpeCount: 0 };
    m.total += 1;
    if (a.status === "present" || a.status === "late") m.presentLike += 1;
    if (typeof a.rpe === "number") { m.rpeSum += Number(a.rpe); m.rpeCount += 1; }
    att.set(a.player_id, m);
  });

  // Performance aggregates
  const per = new Map<string, { g: number; a: number; min: number; ratingSum: number; ratingCount: number }>();
  (perf ?? []).forEach(p => {
    const m = per.get(p.player_id) ?? { g: 0, a: 0, min: 0, ratingSum: 0, ratingCount: 0 };
    m.g += p.goals ?? 0;
    m.a += p.assists ?? 0;
    m.min += p.minutes_played ?? 0;
    if (typeof p.rating === "number") { m.ratingSum += Number(p.rating); m.ratingCount += 1; }
    per.set(p.player_id, m);
  });

  const rows = (players ?? []).map(p => {
    const A = att.get(p.id) ?? { total: 0, presentLike: 0, rpeSum: 0, rpeCount: 0 };
    const P = per.get(p.id) ?? { g: 0, a: 0, min: 0, ratingSum: 0, ratingCount: 0 };
    const attendancePct = A.total ? Math.round((A.presentLike / A.total) * 100) : "";
    const avgRpe = A.rpeCount ? (A.rpeSum / A.rpeCount).toFixed(1) : "";
    const avgRating = P.ratingCount ? (P.ratingSum / P.ratingCount).toFixed(1) : "";
    return {
      team_id: teamId,
      player_id: p.id,
      player_name: `${p.first_name} ${p.last_name}`,
      attendance_pct: attendancePct,
      avg_rpe: avgRpe,
      avg_rating: avgRating,
      goals: P.g,
      assists: P.a,
      minutes: P.min,
      events_count: A.total,
    };
  });

  const headers = Object.keys(rows[0] ?? {
    team_id:"",player_id:"",player_name:"",attendance_pct:"",avg_rpe:"",avg_rating:"",goals:"",assists:"",minutes:"",events_count:""
  });

  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const val = String((r as any)[h] ?? "").replace(/"/g,'""');
      return /[",\n]/.test(val) ? `"${val}"` : val;
    }).join(","))
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="team_${teamId}_stats.csv"`,
    },
  });
}
