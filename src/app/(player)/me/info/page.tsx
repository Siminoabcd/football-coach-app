import { supabaseServer } from "@/lib/supabase-server";
import { getMe, updateMyInfo } from "../actions";
import EditMyInfoDialog from "./edit-my-info-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyInfo() {
  const sb = await supabaseServer();
  const { player } = await getMe();
  if (!player) {
    return (
      <p className="text-sm text-muted-foreground">
        Ask your coach to link your account to a player.
      </p>
    );
  }

  // pull player (name) + team
  const { data: playerRow } = await sb
    .from("players")
    .select("id, first_name, last_name, team_id, teams(name)")
    .eq("id", player.id)
    .maybeSingle();

  // profile
  const { data: profile } = await sb
    .from("player_profiles")
    .select("date_of_birth, preferred_foot, positions, strengths, weaknesses, contact_email, contact_phone, guardian_name, guardian_phone, emergency_notes")
    .eq("player_id", player.id)
    .maybeSingle();

  const fullName = `${playerRow?.first_name ?? ""} ${playerRow?.last_name ?? ""}`.trim();
  const teamName = (playerRow as any)?.teams?.name ?? null;

  // server action to save allowed fields
  async function save(formData: FormData) {
    "use server";
    return await updateMyInfo({
      // Allowed to edit by PLAYER:
      date_of_birth: (formData.get("date_of_birth") as string) || null,
      preferred_foot: (formData.get("preferred_foot") as string) || null,
      contact_email: (formData.get("contact_email") as string) || null,
      contact_phone: (formData.get("contact_phone") as string) || null,
      guardian_name: (formData.get("guardian_name") as string) || null,
      guardian_phone: (formData.get("guardian_phone") as string) || null,
      emergency_notes: (formData.get("emergency_notes") as string) || null,
      // NOT editable by player (positions/strengths/weaknesses) – intentionally omitted
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{fullName || "Player"}</h2>
          <p className="text-sm text-muted-foreground">{teamName ?? "No team"}</p>
        </div>
        <EditMyInfoDialog
          initial={{
            date_of_birth: profile?.date_of_birth ?? null,
            preferred_foot: profile?.preferred_foot ?? null,
            contact_email: profile?.contact_email ?? "",
            contact_phone: profile?.contact_phone ?? "",
            guardian_name: profile?.guardian_name ?? "",
            guardian_phone: profile?.guardian_phone ?? "",
            emergency_notes: profile?.emergency_notes ?? "",
          }}
          onSave={save}
        >
          <Button>Edit</Button>
        </EditMyInfoDialog>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Personal</h3>
          </div>
          <div className="mt-3 text-sm space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Date of birth</span>
              <span>{profile?.date_of_birth ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Preferred foot</span>
              <span>{profile?.preferred_foot ?? "—"}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground">Positions</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {Array.isArray(profile?.positions) && profile!.positions!.length
                  ? profile!.positions!.map((pos: string, i: number) => (
                      <Badge key={i} variant="secondary">{pos}</Badge>
                    ))
                  : <span>—</span>}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Positions are set by your coach.</p>
        </div>

        {/* Contact */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Contact</h3>
          <div className="mt-3 text-sm space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="truncate">{profile?.contact_email ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Phone</span>
              <span className="truncate">{profile?.contact_phone ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Guardian */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Guardian</h3>
          <div className="mt-3 text-sm space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Name</span>
              <span className="truncate">{profile?.guardian_name ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Phone</span>
              <span className="truncate">{profile?.guardian_phone ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Emergency / Medical */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Emergency / Medical</h3>
          <div className="mt-3 text-sm space-y-1.5">
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground">Notes</span>
              <span className="max-w-[70%] text-right whitespace-pre-wrap">
                {profile?.emergency_notes ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Attributes (read-only for player) 
        <div className="rounded-lg border bg-card p-4 md:col-span-2">
          <h3 className="font-medium">Attributes</h3>
          <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Strengths</div>
              <div className="whitespace-pre-wrap min-h-10 border rounded p-2 bg-muted/30">
                {profile?.strengths ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Weaknesses</div>
              <div className="whitespace-pre-wrap min-h-10 border rounded p-2 bg-muted/30">
                {profile?.weaknesses ?? "—"}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">These are maintained by your coach.</p>
        </div>*/}
      </div>
    </div>
  );
}
