import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  const { teamId, playerId } = await params;
  const sb = await supabaseServer();

  const [{ data: events }, { data: att }] = await Promise.all([
    sb.from("events").select("id,date,start_time,title,type").eq("team_id", teamId),
    sb.from("attendance").select("event_id,status,rpe,comment,created_at").eq("player_id", playerId),
  ]);

  const evMap = new Map((events ?? []).map(e => [e.id, e]));
  const rows = (att ?? []).map(r => {
    const e = evMap.get(r.event_id);
    return {
      team_id: teamId,
      player_id: playerId,
      event_id: r.event_id,
      event_date: e?.date ?? "",
      event_time: e?.start_time ?? "",
      event_type: e?.type ?? "",
      event_title: e?.title ?? "",
      status: r.status,
      rpe: r.rpe ?? "",
      comment: r.comment ?? "",
      created_at: r.created_at ?? "",
    };
  });

  const headers = Object.keys(rows[0] ?? {
    team_id:"",player_id:"",event_id:"",event_date:"",event_time:"",event_type:"",event_title:"",
    status:"",rpe:"",comment:"",created_at:""
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
      "Content-Disposition": `attachment; filename="player_${playerId}_attendance.csv"`,
    },
  });
}
