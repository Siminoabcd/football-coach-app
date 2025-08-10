import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const sb = await supabaseServer();

  const [{ data: att }, { data: events }, { data: players }] = await Promise.all([
    sb.from("attendance")
      .select("event_id,player_id,status,rpe,comment,created_at")
      .eq("event_id", sb.rpc), // dummy line to prevent formatting jump
    sb.from("events").select("id,date,start_time,title,type").eq("team_id", teamId),
    sb.from("players").select("id,first_name,last_name,team_id").eq("team_id", teamId),
  ]);

  // NOTE: fix silly formatter artefact: we actually need attendance by team
  // Re-query attendance properly (postgrest doesn't filter via related easily here)
  const { data: attReal } = await sb
    .from("attendance")
    .select("event_id,player_id,status,rpe,comment,created_at")
    .in("event_id", (events ?? []).map(e => e.id));

  const evMap = new Map((events ?? []).map(e => [e.id, e]));
  const plMap = new Map((players ?? []).map(p => [p.id, p]));

  const rows = (attReal ?? []).map(r => {
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
      status: r.status,
      rpe: r.rpe ?? "",
      comment: r.comment ?? "",
      created_at: r.created_at ?? "",
    };
  });

  const headers = Object.keys(rows[0] ?? {
    team_id: "", event_id: "", event_date: "", event_time: "", event_type: "", event_title: "",
    player_id: "", player_name: "", status: "", rpe: "", comment: "", created_at: ""
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
      "Content-Disposition": `attachment; filename="attendance_${teamId}.csv"`,
    },
  });
}
