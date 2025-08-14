// src/app/(app)/teams/[teamId]/events/[eventId]/ui/rsvp-counts.tsx
import { supabaseServer } from "@/lib/supabase-server";

type Status = "coming" | "maybe" | "out";

export default async function RSVPCounts({ eventId }: { eventId: string }) {
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("availability")
    .select("status")
    .eq("event_id", eventId);

  if (error) {
    return (
      <div className="text-xs text-red-600 rounded border px-2 py-1">
        RSVP error: {error.message}
      </div>
    );
  }

  const counts: Record<Status, number> = { coming: 0, maybe: 0, out: 0 };
  (data ?? []).forEach((r: { status: Status }) => {
    if (r?.status && counts[r.status] !== undefined) counts[r.status] += 1;
  });

  return (
    <div className="flex gap-2">
      <Pill label="Coming" value={counts.coming} />
      <Pill label="Maybe"  value={counts.maybe} />
      <Pill label="Out"    value={counts.out} />
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
