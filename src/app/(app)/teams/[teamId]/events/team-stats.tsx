import { supabaseServer } from "@/lib/supabase-server";

type Perf = {
  player_id: string;
  goals: number | null;
  assists: number | null;
  minutes_played: number | null;
  rating: number | null;
  event_id: string;
};

export default async function TeamStats({ teamId }: { teamId: string }) {
  const sb = await supabaseServer();

  // pull players map
  const { data: players } = await sb
    .from("players")
    .select("id,first_name,last_name")
    .eq("team_id", teamId);

  const nameOf = (id: string) => {
    const p = players?.find((x) => x.id === id);
    return p ? `${p.first_name} ${p.last_name}` : "Unknown";
    };

  // all performance rows for this team (MVP; can scope by season later)
  const { data: perf } = await sb
    .from("performance_stats")
    .select("player_id,goals,assists,minutes_played,rating,event_id,team_id")
    .eq("team_id", teamId);

  // last 5 games (by date) to compute avg team rating
  const { data: games } = await sb
    .from("events")
    .select("id,date")
    .eq("team_id", teamId)
    .eq("type", "game")
    .order("date", { ascending: false })
    .limit(5);

  // aggregate in JS (simple + safe)
  const totals = new Map<string, { g: number; a: number; min: number }>();
  (perf ?? []).forEach((r: Perf) => {
    const t = totals.get(r.player_id) ?? { g: 0, a: 0, min: 0 };
    t.g += r.goals ?? 0;
    t.a += r.assists ?? 0;
    t.min += r.minutes_played ?? 0;
    totals.set(r.player_id, t);
  });

  const topScorers = [...totals.entries()]
    .sort((a, b) => b[1].g - a[1].g)
    .slice(0, 5)
    .map(([player_id, t]) => ({ name: nameOf(player_id), goals: t.g }));

  const mostMinutes = [...totals.entries()]
    .sort((a, b) => b[1].min - a[1].min)
    .slice(0, 5)
    .map(([player_id, t]) => ({ name: nameOf(player_id), minutes: t.min }));

  // avg team rating across last 5 games
  const gameIds = new Set((games ?? []).map((g) => g.id));
  const gameRatings = (perf ?? [])
    .filter((r) => r.rating != null && gameIds.has(r.event_id))
    .reduce((acc, r) => {
      acc.sum += Number(r.rating);
      acc.count += 1;
      return acc;
    }, { sum: 0, count: 0 });
  const avgTeamRatingLast5 =
    gameRatings.count ? (gameRatings.sum / gameRatings.count) : null;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="border rounded p-3">
        <div className="text-sm font-medium mb-2">Top scorers</div>
        {!topScorers.length ? (
          <div className="text-sm text-muted-foreground">No data yet</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {topScorers.map((r, i) => (
              <li key={i} className="flex justify-between">
                <span className="truncate">{r.name}</span>
                <span className="font-medium">{r.goals}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded p-3">
        <div className="text-sm font-medium mb-2">Most minutes</div>
        {!mostMinutes.length ? (
          <div className="text-sm text-muted-foreground">No data yet</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {mostMinutes.map((r, i) => (
              <li key={i} className="flex justify-between">
                <span className="truncate">{r.name}</span>
                <span className="font-medium">{r.minutes}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded p-3">
        <div className="text-sm font-medium mb-1">Avg team rating (last 5 games)</div>
        <div className="text-3xl font-semibold">
          {avgTeamRatingLast5 != null ? avgTeamRatingLast5.toFixed(1) : "—"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Based on {gameRatings.count} ratings across last {games?.length ?? 0} games
        </div>
      </div>
    </div>
  );
}
