import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import TeamTabsNav from "./team-tabs-nav";

export default async function TeamLayout(
  { children, params }: { children: React.ReactNode; params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const sb = await supabaseServer();
  const { data: team } = await sb
    .from("teams")
    .select("id,name,season,color")
    .eq("id", teamId)
    .single();

  if (!team) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{team.name}</h2>
          <p className="text-sm text-muted-foreground">{team.season ?? "—"}</p>
        </div>
      </div>

      <TeamTabsNav teamId={teamId} />

      {children}
    </div>
  );
}
