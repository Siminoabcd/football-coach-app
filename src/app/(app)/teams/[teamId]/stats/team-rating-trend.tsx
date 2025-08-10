import Sparkline from "@/components/sparkline";
import { supabaseServer } from "@/lib/supabase-server";

export default async function TeamRatingTrend({ teamId, limit = 12 }: { teamId: string; limit?: number }) {
  const sb = await supabaseServer();

  // Last N games (get ids + dates)
  const { data: games } = await sb
    .from("events")
    .select("id,date")
    .eq("team_id", teamId)
    .eq("type", "game")
    .order("date", { ascending: true }); // oldest -> newest

  if (!games?.length) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-sm font-medium mb-1">Team game rating trend</div>
        <div className="text-sm text-muted-foreground">No games yet.</div>
      </div>
    );
  }

  const lastGames = games.slice(-limit);
  const gameIds = lastGames.map(g => g.id);

  // Pull ratings for these games
  const { data: perf } = await sb
    .from("performance_stats")
    .select("event_id,rating")
    .eq("team_id", teamId)
    .in("event_id", gameIds);

  // Average rating per game (ignore nulls)
  const byGame = new Map<string, { sum: number; count: number }>();
  (perf ?? []).forEach(r => {
    if (typeof r.rating !== "number") return;
    const agg = byGame.get(r.event_id) ?? { sum: 0, count: 0 };
    agg.sum += Number(r.rating);
    agg.count += 1;
    byGame.set(r.event_id, agg);
  });

  const series = lastGames
    .map(g => {
      const agg = byGame.get(g.id);
      return { date: g.date, avg: agg && agg.count ? agg.sum / agg.count : null };
    })
    .filter(p => p.avg != null); // keep only games with any ratings

  if (!series.length) {
    return (
      <div className="border rounded-lg p-4">
        <div className="text-sm font-medium mb-1">Team game rating trend</div>
        <div className="text-sm text-muted-foreground">No ratings recorded yet.</div>
      </div>
    );
  }

  const values = series.map(s => Number(s.avg));
  const firstDate = series[0]?.date;
  const lastDate = series[series.length - 1]?.date;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Team game rating trend</div>
        <div className="text-xs text-muted-foreground">{firstDate} → {lastDate}</div>
      </div>

      <Sparkline values={values} width={520} height={56} strokeWidth={2} ariaLabel="Average team game rating trend" />

      <div className="text-xs text-muted-foreground">
        {series.length} games · min {min.toFixed(1)} · max {max.toFixed(1)}
      </div>
    </div>
  );
}
