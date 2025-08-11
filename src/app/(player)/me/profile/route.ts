import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ profile: null }, { status: 401 });

  const { data: player } = await sb
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!player) return NextResponse.json({ profile: null }, { status: 200 });

  const { data: profile } = await sb
    .from("player_profiles")
    .select("*")
    .eq("player_id", player.id)
    .maybeSingle();

  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const body = await req.json();
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({}, { status: 401 });

  const { data: player } = await sb
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!player) return NextResponse.json({ error: "No player link" }, { status: 400 });

  await sb.from("player_profiles").upsert({ player_id: player.id });
  const { error } = await sb
    .from("player_profiles")
    .update({
      phone: body.phone ?? null,
      emergency_contact: body.emergency_contact ?? null,
      medical_notes: body.medical_notes ?? null,
    })
    .eq("player_id", player.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
