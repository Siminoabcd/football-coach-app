import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { rows } = await req.json();

  if (!Array.isArray(rows) || !rows.length) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const { error } = await sb.from("players").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
