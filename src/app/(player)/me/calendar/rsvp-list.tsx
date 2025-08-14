"use client";

import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Status = "coming" | "maybe" | "out";
type CalendarEvent = {
  id: string;
  title: string | null;
  date: string;          // ISO date (YYYY-MM-DD)
  start_time: string | null;
};

export default function RsvpList({
  events,
  initialStatuses,
  onSet, // server action passed from the page
}: {
  events: CalendarEvent[];
  initialStatuses: Record<string, Status | undefined>;
  onSet: (eventId: string, status: Status) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic<Record<string, Status | undefined>>(
    initialStatuses
  );

  function setStatus(eventId: string, status: Status) {
    start(async () => {
      // 1) instant UI feedback (must be inside a transition)
      setOptimistic(prev => ({ ...prev, [eventId]: status }));

      // 2) confirm with server
      const res = await onSet(eventId, status);
      if (!res?.ok) {
        toast.error(res?.error ?? "Failed to update RSVP");
        // Optional: revert on failure
        // setOptimistic(prev => ({ ...prev, [eventId]: initialStatuses[eventId] }));
      } else {
        toast.success(`RSVP: ${status}`);
      }
    });
  }

  return (
    <div className="space-y-2">
      {events.map(e => {
        const s = optimistic[e.id];
        return (
          <div key={e.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium">{e.title || "Session"}</div>
              <div className="text-xs text-muted-foreground">
                {e.date} {e.start_time ?? ""}
              </div>
              <div className="text-xs">RSVP: <b>{s ?? "—"}</b></div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={s === "coming" ? "default" : "outline"}
                disabled={pending}
                onClick={() => setStatus(e.id, "coming")}
              >
                Coming
              </Button>
              <Button
                size="sm"
                variant={s === "maybe" ? "default" : "outline"}
                disabled={pending}
                onClick={() => setStatus(e.id, "maybe")}
              >
                Maybe
              </Button>
              <Button
                size="sm"
                variant={s === "out" ? "default" : "outline"}
                disabled={pending}
                onClick={() => setStatus(e.id, "out")}
              >
                Out
              </Button>
            </div>
          </div>
        );
      })}
      {events.length === 0 && (
        <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
      )}
    </div>
  );
}
