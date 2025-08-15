// src/app/(app)/teams/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import NewTeamForm from "./new-team-form";
import DeleteTeamButton from "./ui/delete-team-button";
import { deleteTeam } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamsPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  // Include created_by so we can conditionally show the Delete button
  const { data: teams } = await sb
    .from("teams")
    .select("id, name, season, color, created_at, created_by")
    .order("created_at", { ascending: false });

  // Server action binder for the client button
  async function onDelete(teamId: string) {
    "use server";
    return await deleteTeam(teamId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Teams</h2>
        <NewTeamForm />
      </div>

      {!teams?.length ? (
        <p className="text-muted-foreground">No teams yet. Create your first one.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => {
            const isOwner = t.created_by === user?.id;
            return (
              <li key={t.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: team info links to detail page */}
                  <Link href={`/teams/${t.id}`} className="block min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.season ?? "—"}</div>
                  </Link>

                  {/* Right: delete (owner only) */}
                  {isOwner && (
                    <DeleteTeamButton
                      teamId={t.id}
                      teamName={t.name}
                      onDelete={onDelete}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
