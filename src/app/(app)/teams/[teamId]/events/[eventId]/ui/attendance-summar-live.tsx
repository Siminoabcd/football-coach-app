"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type AttStatus = "present" | "late" | "injured" | "absent";

export default function AttendanceSummaryLive({
  eventId,
  initial,
}: {
  eventId: string;
  initial: Record<AttStatus, number>;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [counts, setCounts] = useState(initial);

  useEffect(() => {
    const channel = supabase
      .channel(`attendance:${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance", filter: `event_id=eq.${eventId}` },
        async () => {
          const { data } = await supabase
            .from("attendance")
            .select("status")
            .eq("event_id", eventId);
          const next: Record<AttStatus, number> = { present: 0, late: 0, injured: 0, absent: 0 };
          (data ?? []).forEach((r: any) => { next[r.status as AttStatus] += 1; });
          setCounts(next);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, supabase]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <CardStat label="Present" value={counts.present} />
      <CardStat label="Late" value={counts.late} />
      <CardStat label="Injured" value={counts.injured} />
      <CardStat label="Absent" value={counts.absent} />
    </div>
  );
}

function CardStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
