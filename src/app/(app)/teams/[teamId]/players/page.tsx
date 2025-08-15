// src/app/(app)/teams/[teamId]/players/page.tsx
import { supabaseServer } from "@/lib/supabase-server";
import NewPlayerDialog from "./player-new";
import ImportPlayers from "./player-import";
import PlayerCard from "./player-card";
import SubscribeIcs from "../../ui/subscribe-ics";
import { rotateIcsToken } from "../../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayersPage(
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const sb = await supabaseServer();

  const { data: { user } } = await sb.auth.getUser();

  // fetch team so we can show Subscribe card (owner-only)
  const { data: team } = await sb
    .from("teams")
    .select("id, name, created_by, ics_token")
    .eq("id", teamId)
    .maybeSingle();

  const { data: players } = await sb
    .from("players")
    .select("id, first_name, last_name, position, jersey, created_at")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  const isOwner = team?.created_by === user?.id;

  // server action binder for rotate
  async function onRotate(id: string) {
    "use server";
    return await rotateIcsToken(id);
  }

  return (
    <div className="space-y-6">
      {/* Subscribe to calendar (coach/owner only) */}
      {team && isOwner && team.ics_token && (
        <SubscribeIcs
          token={team.ics_token}
          teamId={team.id}
          teamName={team.name}
          onRotate={onRotate}
        />
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Players</h3>
        <div className="flex gap-2">
          <ImportPlayers teamId={teamId} />
          <NewPlayerDialog teamId={teamId} />
        </div>
      </div>

      {!players?.length ? (
        <p className="text-muted-foreground">No players yet. Add or import a roster.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((p) => (
            <PlayerCard key={p.id} teamId={teamId} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}
