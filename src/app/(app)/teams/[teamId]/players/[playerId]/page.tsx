import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import InfoForm from "./info/info-form";

export default async function PlayerInfoPage(
  { params }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  const { teamId, playerId } = await params;
  const sb = await supabaseServer();

  const { data: player } = await sb
    .from("players")
    .select("id")
    .eq("id", playerId).eq("team_id", teamId).single();
  if (!player) notFound();

  const { data: profile } = await sb
    .from("player_profiles")
    .select("*")
    .eq("player_id", playerId)
    .eq("team_id", teamId)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Player info</h3>
      <InfoForm teamId={teamId} playerId={playerId} profile={profile} />
    </div>
  );
}
