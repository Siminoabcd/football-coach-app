"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Status = "present" | "late" | "injured" | "absent";
type PlayerLite = { id: string; first_name: string; last_name: string; };
type Row = { player_id: string; status: Status; rpe?: number | null; comment?: string | null; };

export default function AttendanceBulk({
  players,
  initialRows,
  onSave,
  eventId,
}: {
  players: PlayerLite[];
  initialRows: Row[];
  onSave: (rows: Row[]) => Promise<{ ok: boolean; error?: string }>;
  eventId: string;
}) {
  const supabase = supabaseBrowser();
  const initialMap = React.useMemo(() => new Map(initialRows.map(r => [r.player_id, r] as const)), [initialRows]);

  const [rows, setRows] = React.useState<Record<string, Row>>(() => {
    const o: Record<string, Row> = {};
    players.forEach(p => {
      const found = initialMap.get(p.id);
      o[p.id] = {
        player_id: p.id,
        status: (found?.status ?? "present"),
        rpe: found?.rpe ?? null,
        comment: found?.comment ?? "",
      };
    });
    return o;
  });
  const [dirty, setDirty] = React.useState(false);
  const [incoming, setIncoming] = React.useState(false);

  function setField(pid: string, patch: Partial<Row>) {
    setDirty(true);
    setRows(prev => ({ ...prev, [pid]: { ...prev[pid], ...patch } }));
  }
  function markAll(status: Status) {
    setDirty(true);
    setRows(prev => {
      const out: Record<string, Row> = {};
      for (const pid of Object.keys(prev)) out[pid] = { ...prev[pid], status };
      return out;
    });
  }
  async function refreshFromServer() {
    const { data, error } = await supabase
      .from("attendance")
      .select("player_id,status,rpe,comment")
      .eq("event_id", eventId);
    if (error) return;
    const map = new Map((data ?? []).map((r: any) => [r.player_id, r]));
    setRows(prev => {
      const next: Record<string, Row> = {};
      for (const p of players) {
        const r = map.get(p.id);
        next[p.id] = {
          player_id: p.id,
          status: (r?.status ?? prev[p.id]?.status ?? "present"),
          rpe: r?.rpe ?? prev[p.id]?.rpe ?? null,
          comment: r?.comment ?? prev[p.id]?.comment ?? "",
        };
      }
      return next;
    });
    setIncoming(false);
  }

  // Live subscription: refetch (non-destructively) when not dirty; otherwise show "incoming" hint
  React.useEffect(() => {
    const channel = supabase
      .channel(`attendance:${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance", filter: `event_id=eq.${eventId}` },
        () => {
          if (dirty) setIncoming(true);
          else refreshFromServer();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId, dirty, supabase]);

  async function save() {
    const payload = Object.values(rows);
    const res = await onSave(payload);
    if (!res.ok) toast.error(res.error ?? "Failed to save attendance");
    else { toast.success("Attendance saved"); setDirty(false); setIncoming(false); }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Attendance</h3>
        <div className="flex items-center gap-2">
          {incoming && (
            <span className="text-xs text-amber-600">Updates available</span>
          )}
          <Button variant="outline" size="sm" onClick={() => markAll("present")}>Mark all Present</Button>
          <Button variant="outline" size="sm" onClick={() => markAll("absent")}>Mark all Absent</Button>
          <Button variant="outline" size="sm" onClick={refreshFromServer}>Refresh</Button>
          <Button size="sm" onClick={save} disabled={!dirty}>Save changes</Button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="[&>th]:px-2 [&>th]:py-1">
              <th className="text-left">Player</th>
              <th>Status</th>
              <th>RPE (1–10)</th>
              <th className="min-w-[280px]">Comment</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const r = rows[p.id];
              return (
                <tr key={p.id} className="border-t align-top [&>td]:px-2 [&>td]:py-2">
                  <td className="whitespace-nowrap">{p.last_name} {p.first_name}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(["present","late","injured","absent"] as Status[]).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setField(p.id, { status: s })}
                          className={[
                            "rounded-md border px-2 py-1 text-xs",
                            r.status === s ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/60",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="w-[90px]">
                    <Input
                      type="number" min={1} max={10}
                      value={r.rpe ?? ""}
                      onChange={e => {
                        const v = e.target.value === "" ? null : Math.max(1, Math.min(10, Number(e.target.value)));
                        setField(p.id, { rpe: v });
                      }}
                    />
                  </td>
                  <td>
                    <Input
                      placeholder="Optional note"
                      value={r.comment ?? ""}
                      onChange={e => setField(p.id, { comment: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
