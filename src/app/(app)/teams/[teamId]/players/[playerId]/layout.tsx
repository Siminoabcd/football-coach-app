import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import PlayerTabsNav from "./player-tabs-nav";

export default async function PlayerLayout(
  { children, params }: { children: React.ReactNode; params: Promise<{ teamId: string; playerId: string }> }
) {
  const { teamId, playerId } = await params;
  const sb = await supabaseServer();

  const { data: player } = await sb
    .from("players")
    .select("id,first_name,last_name,position,jersey,team_id")
    .eq("id", playerId).eq("team_id", teamId).single();

  if (!player) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{player.first_name} {player.last_name}</h2>
          <p className="text-sm text-muted-foreground">
            {player.position ?? "—"} {player.jersey ? `· #${player.jersey}` : ""}
          </p>
        </div>
      </div>

      <PlayerTabsNav teamId={teamId} playerId={playerId} />

      {children}
    </div>
  );
}
