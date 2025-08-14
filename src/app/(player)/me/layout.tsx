import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import PlayerSidebarNav from "@/components/player-sidebar-nav";
import LogoIcon from "@/components/logo-icon";

async function SignOutButton() {
  "use server";
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/login");
}

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the player linked to this user
  // and their team name if available

  const { data: row } = await sb
  .from("players")
  .select("id, first_name, last_name, team_id, teams(name)")
  .eq("user_id", user.id)
  .maybeSingle();

  const player = row;
  let teamName = (row as any)?.teams?.name ?? null;

  if (player?.team_id) {
    const t = await sb.from("teams").select("name").eq("id", player.team_id).maybeSingle();
    teamName = t.data?.name ?? null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col border-r bg-card/50 backdrop-blur-sm">
        {/* Brand / header */}
        <div className="p-4 border-b">
          <Link href="/me" className="group inline-flex items-center gap-2">
            <LogoIcon size={32} />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">Modern Coach</div>
              <div className="text-xs text-muted-foreground group-hover:text-foreground/80 transition">
                Player · Calendar · Stats
              </div>
            </div>
          </Link>
        </div>

        {/* Optional player caption */}
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-medium">
            {player ? `${player.first_name} ${player.last_name}` : "Player"}
          </div>
          <div className="text-xs text-muted-foreground">{teamName ?? "No team linked"}</div>
        </div>

        {/* Nav */}
        <div className="px-3 py-3">
          <PlayerSidebarNav />
        </div>

        {/* Footer */}
        <div className="mt-auto border-t p-3 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <form action={SignOutButton}>
            <Button type="submit" variant="secondary" size="sm" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
