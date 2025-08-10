import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const sb = await supabaseServer();

  const [{ data: perf }, { data: events }, { data: players }] = await Promise.all([
    sb.from("performance_stats")
      .select("event_id,player_id,goals,assists,minutes_played,rating,notes,updated_at")
      .eq("team_id", teamId),
    sb.from("events")
      .select("id,date,start_time,title,type")
      .eq("team_id", teamId),
    sb.from("players")
      .select("id,first_name,last_name")
      .eq("team_id", teamId),
  ]);

  const evMap = new Map((events ?? []).map(e => [e.id, e]));
  const plMap = new Map((players ?? []).map(p => [p.id, p]));
  const rows = (perf ?? []).map(r => {
    const e = evMap.get(r.event_id);
    const p = plMap.get(r.player_id);
    return {
      team_id: teamId,
      event_id: r.event_id,
      event_date: e?.date ?? "",
      event_time: e?.start_time ?? "",
      event_type: e?.type ?? "",
      event_title: e?.title ?? "",
      player_id: r.player_id,
      player_name: p ? `${p.first_name} ${p.last_name}` : "",
      goals: r.goals ?? "",
      assists: r.assists ?? "",
      minutes_played: r.minutes_played ?? "",
      rating: r.rating ?? "",
      notes: r.notes ?? "",
      updated_at: r.updated_at ?? "",
    };
  });

  const headers = Object.keys(rows[0] ?? {
    team_id: "", event_id: "", event_date: "", event_time: "", event_type: "", event_title: "",
    player_id: "", player_name: "", goals: "", assists: "", minutes_played: "", rating: "", notes: "", updated_at: ""
  });

  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const raw = (r as any)[h] ?? "";
      const val = String(raw).replace(/"/g, '""');
      return /[",\n]/.test(val) ? `"${val}"` : val;
    }).join(","))
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="performance_${teamId}.csv"`,
    },
  });
}
