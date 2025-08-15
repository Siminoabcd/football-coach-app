"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Status = "coming" | "maybe" | "out";

export default function RSVPCountsLive({
  eventId,
  initial,
}: {
  eventId: string;
  initial: Record<Status, number>;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [counts, setCounts] = useState(initial);

  useEffect(() => {
    const channel = supabase
      .channel(`availability:${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "availability", filter: `event_id=eq.${eventId}` },
        async () => {
          const { data } = await supabase
            .from("availability")
            .select("status")
            .eq("event_id", eventId);
          const next: Record<Status, number> = { coming: 0, maybe: 0, out: 0 };
          (data ?? []).forEach((r: any) => {
            if (r.status in next) next[r.status as Status] += 1;
          });
          setCounts(next);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  return (
    <div className="flex gap-2">
      <Pill label="Coming" value={counts.coming} />
      <Pill label="Maybe" value={counts.maybe} />
      <Pill label="Out" value={counts.out} />
      <span className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> live
      </span>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background px-2.5 py-1 text-xs">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </div>
  );
}
