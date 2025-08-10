import Link from "next/link";
import type { Drill } from "@/lib/types/drills";

export default function DrillCard({ drill }: { drill: Drill }) {
  return (
    <Link href={`/drills/${drill.id}`} className="block border rounded-lg p-3 hover:bg-muted/40 transition">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate">{drill.title}</div>
          <div className="text-xs text-muted-foreground truncate">
            {drill.category ?? "—"} · {drill.age_group ?? "All ages"} · {drill.difficulty ?? "—"}
          </div>
        </div>
        {drill.duration_min != null && (
          <span className="text-xs text-muted-foreground shrink-0">{drill.duration_min} min</span>
        )}
      </div>
      {drill.objective && (
        <p className="mt-2 text-sm line-clamp-2">{drill.objective}</p>
      )}
      {drill.equipment && drill.equipment.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {drill.equipment.slice(0, 4).map((e, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{e}</span>
          ))}
          {drill.equipment.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">+{drill.equipment.length - 4}</span>
          )}
        </div>
      )}
    </Link>
  );
}
