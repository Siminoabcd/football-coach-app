import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  const { teamId, playerId } = await params;
  const sb = await supabaseServer();

  const [{ data: perf }, { data: events }] = await Promise.all([
    sb.from("performance_stats")
      .select("event_id,goals,assists,minutes_played,rating,notes,updated_at")
      .eq("team_id", teamId)
      .eq("player_id", playerId),
    sb.from("events")
      .select("id,date,start_time,title,type")
      .eq("team_id", teamId),
  ]);

  const evMap = new Map((events ?? []).map(e => [e.id, e]));
  const rows = (perf ?? []).map(r => {
    const e = evMap.get(r.event_id);
    return {
      team_id: teamId,
      player_id: playerId,
      event_id: r.event_id,
      event_date: e?.date ?? "",
      event_time: e?.start_time ?? "",
      event_type: e?.type ?? "",
      event_title: e?.title ?? "",
      goals: r.goals ?? "",
      assists: r.assists ?? "",
      minutes_played: r.minutes_played ?? "",
      rating: r.rating ?? "",
      notes: r.notes ?? "",
      updated_at: r.updated_at ?? "",
    };
  });

  const headers = Object.keys(rows[0] ?? {
    team_id:"",player_id:"",event_id:"",event_date:"",event_time:"",event_type:"",event_title:"",
    goals:"",assists:"",minutes_played:"",rating:"",notes:"",updated_at:""
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
      "Content-Disposition": `attachment; filename="player_${playerId}_performance.csv"`,
    },
  });
}
