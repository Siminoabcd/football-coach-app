import { supabaseServer } from "@/lib/supabase-server";
import NewPlayerDialog from "./player-new";
import ImportPlayers from "./player-import";
import PlayerCard from "./player-card";

export default async function PlayersPage({ params }: { params: { teamId: string } }) {
  const sb = await supabaseServer();
  const { data: players } = await sb
    .from("players")
    .select("id,first_name,last_name,position,jersey,created_at")
    .eq("team_id", params.teamId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Players</h3>
        <div className="flex gap-2">
          <ImportPlayers teamId={params.teamId} />
          <NewPlayerDialog teamId={params.teamId} />
        </div>
      </div>

      {!players?.length ? (
        <p className="text-muted-foreground">No players yet. Add or import a roster.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players!.map(p => (
            <PlayerCard key={p.id} teamId={params.teamId} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}
