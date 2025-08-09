import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function TeamLayout({ children, params }: { children: React.ReactNode, params: { teamId: string } }) {
  const sb = await supabaseServer();
  const { data: team } = await sb.from("teams").select("id,name,season,color").eq("id", params.teamId).single();

  if (!team) notFound();

  const tabs = [
    { href: `/teams/${team.id}/players`, label: "Players" },
    { href: `/teams/${team.id}/events`,  label: "Calendar" },
    { href: `/teams/${team.id}/settings`, label: "Settings" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{team.name}</h2>
          <p className="text-sm text-muted-foreground">{team.season ?? "—"}</p>
        </div>
        <Link href="/teams" className="underline">← Back to teams</Link>
      </div>

      <div className="flex gap-4 border-b">
        {tabs.map(t => (
          <Link key={t.href} href={t.href} className="pb-2 -mb-px border-b-2 border-transparent hover:border-foreground/30">
            {t.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
