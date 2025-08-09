import { supabaseServer } from "@/lib/supabase-server";
import NewTeamForm from "./new-team-form"

export default async function TeamsPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: teams } = await sb
    .from("teams")
    .select("id,name,season,color,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Teams</h2>
        <NewTeamForm />
      </div>
      {(!teams || teams.length === 0) ? (
        <p className="text-muted-foreground">No teams yet. Create your first one.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <li key={t.id} className="border rounded-lg p-4">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-muted-foreground">{t.season ?? "—"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
