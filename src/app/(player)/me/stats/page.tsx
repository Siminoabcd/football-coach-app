import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import Sparkline from "@/components/sparkline";
import { getMe } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyStats() {
  const sb = await supabaseServer();
  const { user, player } = await getMe();
  if (!user) redirect("/login");
  if (!player) return <p className="text-sm text-muted-foreground">Not linked to a player yet.</p>;

  const { data: perf, error } = await sb
    .from("performance_stats")
    .select("goals,assists,minutes_played,rating,created_at")
    .eq("player_id", player.id)
    .order("created_at", { ascending: true });

  if (error) {
    return <pre className="text-xs text-red-600 whitespace-pre-wrap">Stats error: {error.message}</pre>;
  }

  const rows = (perf ?? []).map((p: any) => ({
    goals: Number(p.goals ?? 0),
    assists: Number(p.assists ?? 0),
    minutes: Number(p.minutes_played ?? 0),
    rating: p.rating == null ? null : Number(p.rating),
  }));

  const totals = rows.reduce(
    (a, p) => ({
      goals: a.goals + p.goals,
      assists: a.assists + p.assists,
      minutes: a.minutes + p.minutes,
      ratings: p.rating == null ? a.ratings : [...a.ratings, p.rating],
    }),
    { goals: 0, assists: 0, minutes: 0, ratings: [] as number[] }
  );

  const avgRating =
    totals.ratings.length
      ? (totals.ratings.reduce((x, y) => x + y, 0) / totals.ratings.length).toFixed(2)
      : "—";

  const trend = rows.map((p, i) => ({ x: i + 1, y: p.rating ?? 0 }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border rounded p-3"><div className="text-xs text-muted-foreground">Goals</div><div className="text-2xl">{totals.goals}</div></div>
        <div className="border rounded p-3"><div className="text-xs text-muted-foreground">Assists</div><div className="text-2xl">{totals.assists}</div></div>
        <div className="border rounded p-3"><div className="text-xs text-muted-foreground">Minutes</div><div className="text-2xl">{totals.minutes}</div></div>
        <div className="border rounded p-3"><div className="text-xs text-muted-foreground">Avg Rating</div><div className="text-2xl">{avgRating}</div></div>
      </div>
      <div className="border rounded p-3">
        <div className="text-sm mb-2">Rating trend</div>
        <Sparkline data={trend} />
      </div>
    </div>
  );
}
