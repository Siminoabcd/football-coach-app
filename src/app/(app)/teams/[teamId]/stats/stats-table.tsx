"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Row = {
  player_id: string;
  name: string;
  attendancePct: number | null;
  avgRpe: number | null;
  avgRating: number | null;
  goals: number;
  assists: number;
  minutes: number;
};

type ColKey = keyof Pick<Row, "name" | "attendancePct" | "avgRpe" | "avgRating" | "goals" | "assists" | "minutes">;

export default function StatsTable({ teamId, rows }: { teamId: string; rows: Row[] }) {
  const [sort, setSort] = useState<{ key: ColKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const sorted = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      const { key, dir } = sort;
      const va = a[key], vb = b[key];
      const na = va == null ? -Infinity : typeof va === "number" ? va : String(va).localeCompare(String(vb));
      const nb = vb == null ? -Infinity : typeof vb === "number" ? vb : String(vb).localeCompare(String(va));
      const cmp = typeof va === "number" && typeof vb === "number"
        ? (va === vb ? 0 : va < vb ? -1 : 1)
        : String(a[key]).localeCompare(String(b[key]));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [rows, sort]);

  function header(key: ColKey, label: string) {
    const active = sort.key === key;
    return (
      <button
        type="button"
        onClick={() => setSort(s => ({ key, dir: active && s.dir === "asc" ? "desc" : "asc" }))}
        className={`text-left w-full flex items-center gap-1 ${active ? "font-medium" : ""}`}
        title="Sort"
      >
        {label}
        <span className="text-xs">{active ? (sort.dir === "asc" ? "↑" : "↓") : ""}</span>
      </button>
    );
  }

  function ratingClass(v: number | null) {
    if (v == null) return "";
    if (v >= 7.5) return "text-green-600 dark:text-green-400";
    if (v >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }

  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 w-[28%]">{header("name", "Player")}</th>
            <th className="p-2 w-[12%]">{header("attendancePct", "Attendance %")}</th>
            <th className="p-2 w-[12%]">{header("avgRpe", "Avg RPE")}</th>
            <th className="p-2 w-[12%]">{header("avgRating", "Avg Rating")}</th>
            <th className="p-2 w-[9%]">{header("goals", "G")}</th>
            <th className="p-2 w-[9%]">{header("assists", "A")}</th>
            <th className="p-2 w-[18%]">{header("minutes", "Minutes")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.player_id} className="border-t">
              <td className="p-2">
                <Link href={`/teams/${teamId}/players/${r.player_id}`} className="underline underline-offset-2">
                  {r.name}
                </Link>
              </td>
              <td className="p-2">{r.attendancePct != null ? `${r.attendancePct}%` : "—"}</td>
              <td className="p-2">{r.avgRpe != null ? r.avgRpe.toFixed(1) : "—"}</td>
              <td className={`p-2 ${ratingClass(r.avgRating)}`}>{r.avgRating != null ? r.avgRating.toFixed(1) : "—"}</td>
              <td className="p-2 text-center">{r.goals}</td>
              <td className="p-2 text-center">{r.assists}</td>
              <td className="p-2 text-center">{r.minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
