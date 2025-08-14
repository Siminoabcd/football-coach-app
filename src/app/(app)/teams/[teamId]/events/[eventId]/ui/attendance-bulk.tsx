"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Status = "present" | "late" | "injured" | "absent";

type PlayerLite = {
  id: string;
  first_name: string;
  last_name: string;
};

type Row = {
  player_id: string;
  status: Status;
  rpe?: number | null;
  comment?: string | null;
};

export default function AttendanceBulk({
  players,
  initialRows,
  onSave,
}: {
  players: PlayerLite[];
  initialRows: Row[]; // existing attendance for this event
  onSave: (rows: Row[]) => Promise<{ ok: boolean; error?: string }>;
}) {
  const map = React.useMemo(
    () => new Map(initialRows.map(r => [r.player_id, r] as const)),
    [initialRows]
  );

  const [rows, setRows] = React.useState<Record<string, Row>>(() => {
    const o: Record<string, Row> = {};
    players.forEach(p => {
      const found = map.get(p.id);
      o[p.id] = {
        player_id: p.id,
        status: (found?.status ?? "present") as Status,
        rpe: found?.rpe ?? null,
        comment: found?.comment ?? "",
      };
    });
    return o;
  });

  function setField(pid: string, patch: Partial<Row>) {
    setRows(prev => ({ ...prev, [pid]: { ...prev[pid], ...patch } }));
  }

  function markAll(status: Status) {
    setRows(prev => {
      const out: Record<string, Row> = {};
      for (const pid of Object.keys(prev)) out[pid] = { ...prev[pid], status };
      return out;
    });
  }

  async function save() {
    const payload = Object.values(rows);
    const res = await onSave(payload);
    if (!res.ok) toast.error(res.error ?? "Failed to save attendance");
    else toast.success("Attendance saved");
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Attendance</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAll("present")}>Mark all Present</Button>
          <Button variant="outline" size="sm" onClick={() => markAll("absent")}>Mark all Absent</Button>
          <Button size="sm" onClick={save}>Save changes</Button>
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
                      type="number"
                      min={1}
                      max={10}
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
