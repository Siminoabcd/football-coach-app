"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { saveAttendance } from "./attendance-actions";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["present", "late", "injured", "absent"] as const;
type Status = typeof statuses[number];

type Row = {
  player_id: string;
  name: string;
  status: Status | "";
  rpe: number | "" | null;
  comment: string;
};

export default function AttendanceTable({
  teamId, eventId, players, existing
}: {
  teamId: string;
  eventId: string;
  players: { id: string; first_name: string; last_name: string }[];
  existing: { player_id: string; status: Status; rpe: number | null; comment: string | null }[];
}) {
  const existingMap = useMemo(
    () => new Map(existing.map(e => [e.player_id, e])),
    [existing]
  );

  const [rows, setRows] = useState<Row[]>(
    () =>
      players.map(p => {
        const found = existingMap.get(p.id);
        return {
          player_id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          status: (found?.status as Status) ?? "",
          rpe: found?.rpe ?? "",
          comment: found?.comment ?? "",
        };
      })
  );

  const statusCounts = useMemo(() => {
    const m = { present: 0, late: 0, injured: 0, absent: 0, unset: 0 } as Record<string, number>;
    for (const r of rows) {
      if (!r.status) m.unset++;
      else m[r.status]++;
    }
    return m;
  }, [rows]);

  // --- selection state ---
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allSelected = useMemo(
    () => rows.length > 0 && rows.every(r => selected[r.player_id]),
    [rows, selected]
  );

  function toggleAll(sel: boolean) {
    const next: Record<string, boolean> = {};
    rows.forEach(r => (next[r.player_id] = sel));
    setSelected(next);
  }

  function toggleOne(id: string, sel: boolean) {
    setSelected(prev => ({ ...prev, [id]: sel }));
  }

  // --- row update helpers ---
  function updateRow(id: string, patch: Partial<Row>) {
    setRows(prev => prev.map(r => (r.player_id === id ? { ...r, ...patch } : r)));
  }

  function applyTo(ids: string[], patch: Partial<Row>) {
    if (ids.length === 0) return;
    setRows(prev =>
      prev.map(r => (ids.includes(r.player_id) ? { ...r, ...patch } : r))
    );
  }

  const selectedIds = useMemo(
    () => rows.filter(r => selected[r.player_id]).map(r => r.player_id),
    [rows, selected]
  );

  // --- bulk toolbar state ---
  const [bulkStatus, setBulkStatus] = useState<Status | "">("");
  const [bulkRpe, setBulkRpe] = useState<string>(""); // keep as string for input

  // --- save ---
  const [pending, start] = useTransition();

  async function saveAll() {
    start(async () => {
      const res = await saveAttendance(teamId, eventId, rows);
      if (!res?.ok) toast.error(res?.error ?? "Failed to save");
      else toast.success("Attendance saved");
    });
  }

  // --- keyboard shortcuts ---
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Select all
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        toggleAll(true);
        return;
      }
      // Status: P/L/I/A
      const k = e.key.toLowerCase();
      const statusMap: Record<string, Status> = {
        p: "present",
        l: "late",
        i: "injured",
        a: "absent",
      };
      if (statusMap[k] && selectedIds.length > 0) {
        e.preventDefault();
        applyTo(selectedIds, { status: statusMap[k] });
        return;
      }
      // RPE: digits 0..9 and '10'
      if (/^\d$/.test(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const v = Number(e.key);
        applyTo(selectedIds, { rpe: v });
        return;
      }
      if (e.key === "Enter" && e.shiftKey && selectedIds.length > 0) {
        // Shift+Enter => RPE 10 for selected
        e.preventDefault();
        applyTo(selectedIds, { rpe: 10 });
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIds]);

  // NEW — tiny helpers
  function plural(n: number, word: string) {
    return `${n} ${word}${n === 1 ? "" : "s"}`;
  }


  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">Present: {statusCounts.present}</Badge>
          <Badge variant="secondary">Late: {statusCounts.late}</Badge>
          <Badge variant="secondary">Injured: {statusCounts.injured}</Badge>
          <Badge variant="secondary">Absent: {statusCounts.absent}</Badge>
          <span className="text-muted-foreground">Unset: {statusCounts.unset}</span>
        </div>
        <Checkbox
          checked={allSelected}
          onCheckedChange={v => toggleAll(Boolean(v))}
          id="selectAll"
        />
        <label htmlFor="selectAll" className="text-sm">Select all</label>

        <div className="h-4 w-px bg-border" />

        {/* Mark status */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Mark</span>
          <Select
            value={bulkStatus}
            onValueChange={(v) => setBulkStatus(v as Status)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            onClick={() => {
              const ids = selectedIds.length ? selectedIds : rows.map(r => r.player_id);
              if (!bulkStatus) return;
              applyTo(ids, { status: bulkStatus as Status });
              // NEW
              toast.success(
                `Marked ${plural(ids.length, "player")} as ${bulkStatus}`
              );
            }}
          >
            Apply to {selectedIds.length ? "selected" : "all"}
          </Button>

        </div>

        <div className="h-4 w-px bg-border" />

        {/* RPE all */}
        <div className="flex items-center gap-2">
          <span className="text-sm">RPE</span>
          <Input
            type="number"
            min={0}
            max={10}
            value={bulkRpe}
            onChange={(e) => setBulkRpe(e.target.value)}
            className="w-20"
            placeholder="0–10"
          />
          <Button
            variant="secondary"
            onClick={() => {
              const v = bulkRpe.trim() === "" ? null : Math.max(0, Math.min(10, Number(bulkRpe)));
              const ids = selectedIds.length ? selectedIds : rows.map(r => r.player_id);
              applyTo(ids, { rpe: v as any });
              // NEW
              toast.success(
                v === null
                  ? `Cleared RPE for ${plural(ids.length, "player")}`
                  : `Set RPE ${v} for ${plural(ids.length, "player")}`
              );
            }}
          >
            Set for {selectedIds.length ? "selected" : "all"}
          </Button>

        </div>

        <div className="h-4 w-px bg-border" />

        {/* Clear comments */}
        <Button
          variant="ghost"
          onClick={() => {
            const ids = selectedIds.length ? selectedIds : rows.map(r => r.player_id);
            applyTo(ids, { comment: "" });
            // NEW
            toast.success(`Cleared comments for ${plural(ids.length, "player")}`);
          }}
        >
          Clear comments {selectedIds.length ? "(selected)" : "(all)"}
        </Button>


        <div className="ml-auto flex items-center gap-2">
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">P/L/I/A</kbd>
          <span className="text-xs text-muted-foreground">status</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">0–9</kbd>
          <span className="text-xs text-muted-foreground">RPE</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Shift+Enter</kbd>
          <span className="text-xs text-muted-foreground">RPE 10</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="w-10 p-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={v => toggleAll(Boolean(v))}
                  aria-label="Select all"
                />
              </th>
              <th className="w-56 p-2">Player</th>
              <th className="w-40 p-2">Status</th>
              <th className="w-24 p-2">RPE</th>
              <th className="p-2">Comment</th>
              <th className="w-16 p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.player_id} className="border-t">
                <td className="p-2 align-top">
                  <Checkbox
                    checked={!!selected[r.player_id]}
                    onCheckedChange={(v) => toggleOne(r.player_id, Boolean(v))}
                    aria-label={`Select ${r.name}`}
                  />
                </td>
                <td className="p-2 align-top">
                  <Link
                    href={`/teams/${teamId}/players/${r.player_id}`}
                    className="hover:underline"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="p-2 align-top">
                  <Select
                    value={r.status || ""}
                    onValueChange={(v) => updateRow(r.player_id, { status: v as Status })}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 align-top">
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    inputMode="numeric"
                    value={r.rpe ?? ""}
                    onChange={(e) =>
                      updateRow(r.player_id, {
                        rpe: e.target.value === "" ? "" : Math.max(0, Math.min(10, Number(e.target.value))),
                      })
                    }
                    className="w-20"
                  />
                </td>
                <td className="p-2 align-top">
                  <Input
                    value={r.comment}
                    onChange={e => updateRow(r.player_id, { comment: e.target.value })}
                    placeholder="Add comment"
                  />
                </td>
                <td className="p-2 align-top text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateRow(r.player_id, { status: "", rpe: "", comment: "" })}
                  >
                    Reset
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={saveAll} disabled={pending}>
        {pending ? "Saving..." : "Save Attendance"}
      </Button>
    </div>
  );
}
