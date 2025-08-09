"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { savePerformanceStats } from "./stats-actions";

type Player = { id: string; first_name: string; last_name: string };
type Existing = {
  player_id: string;
  goals: number | null;
  assists: number | null;
  minutes_played: number | null;
  rating: number | null;
  notes: string | null;
};

export default function PerformanceTable({
  teamId,
  eventId,
  players,
  existing,
}: {
  teamId: string;
  eventId: string;
  players: Player[];
  existing: Existing[];
}) {
  const map = new Map(existing.map((e) => [e.player_id, e]));
  const [rows, setRows] = useState(() =>
    players.map((p) => {
      const e = map.get(p.id);
      return {
        player_id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        goals: e?.goals ?? "",
        assists: e?.assists ?? "",
        minutes_played: e?.minutes_played ?? "",
        rating: e?.rating ?? "",
        notes: e?.notes ?? "",
      };
    })
  );

  const [pending, start] = useTransition();

  function set(i: number, field: string, value: any) {
    setRows((r) => r.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));
  }

  return (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold">Performance stats</h4>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Player</th>
              <th className="p-2">G</th>
              <th className="p-2">A</th>
              <th className="p-2">Min</th>
              <th className="p-2">Rating (0–10)</th>
              <th className="p-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.player_id} className="border-t">
                <td className="p-2">
                    <Link
                        href={`/teams/${teamId}/players/${r.player_id}`}
                        className="underline underline-offset-2"
                    >
                        {r.name}
                    </Link>
                    </td>
                <td className="p-2 w-20">
                  <Input
                    type="number"
                    min={0}
                    value={r.goals}
                    onChange={(e) => set(i, "goals", e.target.value)}
                  />
                </td>
                <td className="p-2 w-20">
                  <Input
                    type="number"
                    min={0}
                    value={r.assists}
                    onChange={(e) => set(i, "assists", e.target.value)}
                  />
                </td>
                <td className="p-2 w-24">
                  <Input
                    type="number"
                    min={0}
                    value={r.minutes_played}
                    onChange={(e) => set(i, "minutes_played", e.target.value)}
                  />
                </td>
                <td className="p-2 w-32">
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={10}
                    value={r.rating}
                    onChange={(e) => set(i, "rating", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <Textarea
                    rows={2}
                    value={r.notes}
                    onChange={(e) => set(i, "notes", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const payload = rows.map((r) => ({
              player_id: r.player_id,
              goals: r.goals === "" ? null : Number(r.goals),
              assists: r.assists === "" ? null : Number(r.assists),
              minutes_played: r.minutes_played === "" ? null : Number(r.minutes_played),
              rating: r.rating === "" ? null : Number(r.rating),
              notes: r.notes || null,
            }));
            const res = await savePerformanceStats(teamId, eventId, payload);
            if (res.ok) toast.success("Performance saved");
            else toast.error(res.error ?? "Failed to save");
          })
        }
      >
        {pending ? "Saving…" : "Save performance"}
      </Button>
    </div>
  );
}
