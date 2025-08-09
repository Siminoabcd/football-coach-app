"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveAttendance } from "./attendance-actions";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const statuses = ["present", "late", "injured", "absent"] as const;

export default function AttendanceTable({
  teamId, eventId, players, existing
}: {
  teamId: string;
  eventId: string;
  players: { id: string; first_name: string; last_name: string; }[];
  existing: any[];
}) {
  const [rows, setRows] = useState(() =>
    players.map(p => {
      const found = existing.find(e => e.player_id === p.id);
      return {
        player_id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        status: found?.status ?? "present",
        rpe: found?.rpe ?? "",
        comment: found?.comment ?? "",
      };
    })
  );

  const [pending, start] = useTransition();

  function updateRow(i: number, field: string, value: any) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  async function saveAll() {
    start(async () => {
      const res = await saveAttendance(teamId, eventId, rows);
      if (res.ok) toast.success("Attendance saved");
      else toast.error(res.error ?? "Error saving attendance");
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold">Attendance</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Player</th>
              <th className="p-2">Status</th>
              <th className="p-2">RPE</th>
              <th className="p-2">Comment</th>
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
                <td className="p-2">
                  <select
                    value={r.status}
                    onChange={e => updateRow(i, "status", e.target.value)}
                    className="border rounded px-1 py-0.5"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={r.rpe}
                    onChange={e => updateRow(i, "rpe", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={r.comment}
                    onChange={e => updateRow(i, "comment", e.target.value)}
                  />
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
