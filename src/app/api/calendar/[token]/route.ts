import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function icsEscape(s: string) {
  return (s || "").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");
}

function fmtDateYYYYMMDD(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const da = String(dt.getDate()).padStart(2, "0");
  return `${y}${m}${da}`;
}

function fmtTimeHHMMSS(t: string | null) {
  if (!t) return null;
  return t.replace(/:/g, "").padEnd(6, "0"); // "18:00:00" -> "180000"
}

export async function GET(_: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params; // Next 15 params are async

  // server-side Supabase client (no user session required)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // allowed because we call SECURITY DEFINER RPC
    { auth: { persistSession: false } }
  );

  // Basic validation
  const tokenUuid = token.replace(".ics", "");
  const { data, error } = await supabase
    .rpc("get_team_events_by_token", { _token: tokenUuid as any });

  if (error) {
    return new NextResponse("Invalid calendar token.", { status: 404 });
  }

  const rows = (data ?? []) as Array<{
    team_name: string | null;
    id: string;
    title: string | null;
    type: string;
    date: string;              // yyyy-mm-dd
    start_time: string | null; // HH:MM:SS
    notes_pre: string | null;
  }>;

  // Calendar meta
  const teamName = rows[0]?.team_name || "Modern Coach Team";
  const calName = icsEscape(teamName);
  const tz = process.env.TEAM_ICS_TZ || "Europe/Bratislava"; // adjust if you need

  const now = new Date();
  const dtStamp = `${fmtDateYYYYMMDD(now)}T${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}${String(now.getSeconds()).padStart(2,"0")}Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Modern Coach//EN",
    `X-WR-CALNAME:${calName}`,
    `X-WR-TIMEZONE:${icsEscape(tz)}`,
  ];

  for (const e of rows) {
    const d = fmtDateYYYYMMDD(e.date);
    const t = fmtTimeHHMMSS(e.start_time);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.id}@moderncoach`);
    lines.push(`DTSTAMP:${dtStamp}`);

    if (t) {
      // Local time; most clients treat as calendar's timezone
      lines.push(`DTSTART:${d}T${t}`);
    } else {
      // All-day event
      lines.push(`DTSTART;VALUE=DATE:${d}`);
    }

    const title = icsEscape(e.title || e.type || "Session");
    lines.push(`SUMMARY:${title}`);

    const desc = e.notes_pre ? icsEscape(e.notes_pre) : "";
    if (desc) lines.push(`DESCRIPTION:${desc}`);

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const body = lines.join("\r\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${calName || "team"}.ics"`,
      "Cache-Control": "max-age=600", // cache 10min
    },
  });
}
