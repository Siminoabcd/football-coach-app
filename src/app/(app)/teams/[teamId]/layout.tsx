import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

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
      {children}
    </div>
  );
}
